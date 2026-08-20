const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const pages = [
  { html: 'index.html', copy: 'copy/01-inicio-A.md' },
  { html: 'servicios.html', copy: 'copy/02-servicios.md' },
  { html: 'como-trabajo.html', copy: 'copy/03-como-trabajo.md' },
  { html: 'quien-soy.html', copy: 'copy/04-quien-soy.md' },
  { html: 'como-manejo-tu-informacion.html', copy: 'copy/05-como-manejo-tu-informacion.md' },
];

function read(file) {
  try { return fs.readFileSync(path.join(repoRoot, file), 'utf8'); }
  catch (e) { return null; }
}

function stripHtml(html) {
  if (!html) return '';
  // Remove scripts and svgs and comments
  html = html.replace(/<!--([\s\S]*?)-->/g, ' ');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  html = html.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  // Remove noscript blocks
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  // Remove all tags
  html = html.replace(/<[^>]+>/g, ' ');
  // Decode a few common entities
  html = html.replace(/&nbsp;|\u00A0/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  // Normalize whitespace and punctuation spacing
  html = html.replace(/\s+/g, ' ').trim();
  html = html.replace(/ \./g, '.').replace(/ ,/g, ',').replace(/ \:/g, ':').replace(/ \;/g, ';');
  return html;
}

// El texto de <title> vive entre tags (sobrevive a stripHtml), pero el de
// <meta name="description" content="..."> vive en un ATRIBUTO — stripHtml lo
// tira junto con el resto del tag. Buscarlo como texto de página nunca puede
// funcionar; sale por comparación directa contra el valor real del atributo.
function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}
function extractMetaDescription(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function stripMarkdown(md) {
  if (!md) return '';
  // Remove frontmatter if any
  md = md.replace(/^---[\s\S]*?---\s*/m, '');
  // Convert links [text](url) -> text
  md = md.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Remove headings markers, emphasis, code fences, backticks
  md = md.replace(/^[#>-]+\s?/gm, '').replace(/\*|\_|`{1,3}/g, '');
  // Remove images ![alt](url)
  md = md.replace(/!\[[^\]]*\]\([^\)]*\)/g, '');
  md = md.replace(/\s+/g, ' ').trim();
  md = md.replace(/ \./g, '.').replace(/ ,/g, ',').replace(/ \:/g, ':').replace(/ \;/g, ';');
  return md;
}

function blocksFromMarkdown(md) {
  // Split on two or more newlines (approx paragraph blocks)
  return md.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
}

// Los archivos de copy/ siguen una convención fija de andamiaje editorial:
// título del documento, nota de tono en blockquote, y rótulos de sección
// ("## H1", "## Entrada", "## Cierre", "## Metadatos") que organizan el
// archivo pero nunca aparecen como texto visible en la página — el contenido
// real va en el bloque *siguiente* a cada rótulo. Compararlos contra el HTML
// renderizado siempre falla y no significa nada: hay que excluirlos antes de
// verificar, no contarlos como discrepancia.
// Bajo "## Metadatos", **JSON-LD:** y **Acción principal:**/**Alternativa:** son
// instrucciones de construcción (qué estructura usar, qué botón mostrar), no texto
// que deba aparecer tal cual en la página — a diferencia de **Title:** y
// **Meta description:**, que sí son el contenido real de una etiqueta, solo que
// recolocado (ver RELOCATED_LABEL más abajo).
const DIRECTIVE_ONLY = /^\*\*(json-ld|acci[oó]n principal)\s*:?\*\*/i;
const RELOCATED_LABEL = /^(title|meta description):\s*/;

function isScaffoldBlock(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return true;
  if (lines.length === 1 && /^#{1,6}\s+\S/.test(lines[0])) return true; // rótulo de encabezado
  if (lines.every(l => /^>/.test(l))) return true; // nota editorial en blockquote
  if (lines.every(l => /^<!--/.test(l) || /^-->$/.test(l))) return true; // marcador de comentario suelto
  if (DIRECTIVE_ONLY.test(raw.trim())) return true; // instrucción de construcción, no copy
  return false;
}

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.trim());
}

function wordOverlapRatio(block, html) {
  const words = tokenize(block).filter(w => w.length > 2);
  if (!words.length) return 0;
  const htmlText = html.toLowerCase();
  let match = 0;
  words.forEach(w => { if (htmlText.indexOf(w) !== -1) match++; });
  return match / words.length;
}

function run() {
  const FUZZY_THRESHOLD = 0.60; // 60% of words must appear to consider it matched
  let totalMissing = 0;
  pages.forEach(p => {
    const htmlRaw = read(p.html);
    const copyRaw = read(p.copy);
    console.log('--- ' + p.html + ' ↔ ' + p.copy);
    if (!htmlRaw) return console.log('  MISSING HTML: ' + p.html);
    if (!copyRaw) return console.log('  MISSING COPY: ' + p.copy);

    const html = stripHtml(htmlRaw).toLowerCase();
    const pageTitle = extractTitle(htmlRaw).toLowerCase();
    const pageDesc = extractMetaDescription(htmlRaw).toLowerCase();
    const rawBlocks = blocksFromMarkdown(copyRaw);
    const contentBlocks = rawBlocks.filter(b => !isScaffoldBlock(b));

    let missing = [];
    contentBlocks.forEach((raw, i) => {
      const strippedRaw = stripMarkdown(raw).toLowerCase();
      const isTitle = /^title:\s*/.test(strippedRaw);
      const isDesc = /^meta description:\s*/.test(strippedRaw);
      const blk = strippedRaw.replace(RELOCATED_LABEL, '');
      if (!blk) return;

      if (isTitle) {
        if (blk === pageTitle) return;
        missing.push({ index: i+1, text: blk.slice(0, 200), ratio: 'atributo <title> no coincide' });
        return;
      }
      if (isDesc) {
        if (blk === pageDesc) return;
        missing.push({ index: i+1, text: blk.slice(0, 200), ratio: 'atributo meta[description] no coincide' });
        return;
      }

      if (html.includes(blk)) return; // exact match
      const ratio = wordOverlapRatio(blk, html);
      if (ratio >= FUZZY_THRESHOLD) return; // fuzzy match
      missing.push({ index: i+1, text: blk.slice(0, 200), ratio: 'overlap ' + Math.round(ratio * 100) + '%' });
    });

    console.log('  blocks:', contentBlocks.length, '(', rawBlocks.length - contentBlocks.length, 'de andamiaje omitidos )  missing:', missing.length);
    if (missing.length) {
      totalMissing += missing.length;
      missing.slice(0,10).forEach(m => console.log('   - block', m.index, ':', m.text, ' (', m.ratio, ')'));
      if (missing.length > 10) console.log('   ...', missing.length - 10, 'more');
    }
  });
  console.log('---- Summary: total missing blocks across pages:', totalMissing);
  process.exit(totalMissing ? 2 : 0);
}

run();

