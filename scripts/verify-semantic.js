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
  html = html.replace(/<!--([\s\S]*?)-->/g, ' ');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  html = html.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  html = html.replace(/<[^>]+>/g, ' ');
  html = html.replace(/&nbsp;|\u00A0/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  html = html.replace(/\s+/g, ' ').trim();
  return html;
}

// Igual que en verify-copy.js: el texto de <title> vive entre tags, pero el
// de <meta name="description" content="..."> vive en un ATRIBUTO que
// stripHtml tira junto con el resto del tag — nunca puede salir de buscarlo
// como candidato de texto de página, hay que leer el atributo directamente.
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
  md = md.replace(/^---[\s\S]*?---\s*/m, '');
  md = md.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  md = md.replace(/^[#>-]+\s?/gm, '').replace(/\*|\_|`{1,3}/g, '');
  md = md.replace(/!\[[^\]]*\]\([^\)]*\)/g, '');
  md = md.replace(/\s+/g, ' ').trim();
  return md;
}

function blocksFromMarkdown(md) {
  return md.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
}

// Misma convención de andamiaje que scripts/verify-copy.js (mantener ambas en
// sync si cambia): rótulos de sección, notas editoriales y directivas de
// construcción que nunca aparecen como texto visible en la página.
const DIRECTIVE_ONLY = /^\*\*(json-ld|acci[oó]n principal)\s*:?\*\*/i;
const RELOCATED_LABEL = /^(title|meta description):\s*/i;

function isScaffoldBlock(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return true;
  if (lines.length === 1 && /^#{1,6}\s+\S/.test(lines[0])) return true;
  if (lines.every(l => /^>/.test(l))) return true;
  if (lines.every(l => /^<!--/.test(l) || /^-->$/.test(l))) return true;
  if (DIRECTIVE_ONLY.test(raw.trim())) return true;
  return false;
}

const SPANISH_STOP = new Set([
  'de','la','que','el','en','y','a','los','se','del','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él'
]);

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ngrams(tokens, n) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}

function features(text) {
  const norm = normalize(text);
  const toks = norm.split(' ').filter(Boolean).filter(t => !SPANISH_STOP.has(t));
  const feats = {};
  // unigrams, bigrams, trigrams
  [1,2,3].forEach(n => {
    ngrams(toks, n).forEach(g => { feats[g] = (feats[g] || 0) + 1; });
  });
  return feats;
}

function dot(a, b) {
  let s = 0;
  for (const k in a) if (b[k]) s += a[k] * b[k];
  return s;
}

function norm(a) {
  let s = 0; for (const k in a) s += a[k] * a[k]; return Math.sqrt(s);
}

function cosine(a, b) {
  const d = dot(a,b); const na = norm(a); const nb = norm(b); if (!na || !nb) return 0; return d / (na * nb);
}

function run() {
  const THRESH = parseFloat(process.argv[2]) || 0.35; // cosine threshold (0..1)
  let totalMissing = 0;
  pages.forEach(p => {
    const htmlRaw = read(p.html);
    const copyRaw = read(p.copy);
    console.log('--- ' + p.html + ' ↔ ' + p.copy);
    if (!htmlRaw) return console.log('  MISSING HTML: ' + p.html);
    if (!copyRaw) return console.log('  MISSING COPY: ' + p.copy);

    const html = htmlRaw;
    const rawBlocks = blocksFromMarkdown(copyRaw);
    const contentBlocks = rawBlocks.filter(b => !isScaffoldBlock(b));

    // Crear candidatos desde HTML: separar por parrafos y encabezados.
    // OJO: stripHtml() colapsa TODO whitespace (incluidos saltos de linea) a
    // un solo espacio. La version anterior insertaba un salto de linea y
    // llamaba a stripHtml() despues, que se lo comia -- todo el documento
    // quedaba como un solo candidato gigante y la similitud de coseno se
    // diluia a casi cero para todo, incluso texto identico palabra por
    // palabra. Se usa un separador que NO es whitespace para que sobreviva
    // a stripHtml, y se parte por el al final.
    var BLOCK_SEP = "@@BREAK@@";
    function htmlCandidates(raw) {
      var withBreaks = raw
        .replace(/<\/(p|h1|h2|h3|li|section|article|header|footer|main|div)>/gi, BLOCK_SEP)
        .replace(/<br\s*\/?\s*>/gi, BLOCK_SEP);
      var stripped = stripHtml(withBreaks);
      return stripped.split(BLOCK_SEP).map(function(l){ return l.trim(); }).filter(Boolean);
    }

    const candidates = htmlCandidates(html);
    const pageTitle = normalize(extractTitle(htmlRaw));
    const pageDesc = normalize(extractMetaDescription(htmlRaw));

    let missing = [];
    contentBlocks.forEach((raw, i) => {
      const strippedRaw = stripMarkdown(raw);
      const isTitle = /^title:\s*/i.test(strippedRaw);
      const isDesc = /^meta description:\s*/i.test(strippedRaw);
      const blk = strippedRaw.replace(RELOCATED_LABEL, '');
      if (!blk) return;

      if (isTitle) {
        if (normalize(blk) === pageTitle) return;
        missing.push({ index: i+1, text: blk.slice(0,200), sim: 'atributo <title> no coincide' });
        return;
      }
      if (isDesc) {
        if (normalize(blk) === pageDesc) return;
        missing.push({ index: i+1, text: blk.slice(0,200), sim: 'atributo meta[description] no coincide' });
        return;
      }

      const wk = normalize(blk).split(' ').filter(Boolean).length;
      if (wk < 4) return; // demasiado corto para que la similitud de n-gramas diga algo
      const fblk = features(blk);
      // comparar con cada candidato y tomar la máxima similitud
      let best = 0;
      candidates.forEach(c => {
        const fc = features(c);
        const s = cosine(fblk, fc);
        if (s > best) best = s;
      });
      const sim = best;
      if (sim < THRESH) missing.push({ index: i+1, text: blk.slice(0,200), sim: Math.round(sim*100)/100 });
    });

    console.log('  blocks:', contentBlocks.length, '(', rawBlocks.length - contentBlocks.length, 'de andamiaje omitidos )  missing (semantic):', missing.length);
    if (missing.length) {
      totalMissing += missing.length;
      missing.slice(0,10).forEach(m => console.log('   - block', m.index, ':', m.text, '(sim', m.sim + ')'));
    }
  });
  console.log('---- Summary semantic: total missing blocks across pages:', totalMissing);
  process.exit(totalMissing ? 2 : 0);
}

run();

