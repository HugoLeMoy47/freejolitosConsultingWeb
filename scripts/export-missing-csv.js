const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const pages = [
  { html: 'index.html', copy: 'copy/01-inicio-A.md' },
  { html: 'servicios.html', copy: 'copy/02-servicios.md' },
  { html: 'como-trabajo.html', copy: 'copy/03-como-trabajo.md' },
  { html: 'quien-soy.html', copy: 'copy/04-quien-soy.md' },
  { html: 'datos-e-ia.html', copy: 'copy/05-datos-e-ia.md' },
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
  html = html.replace(/\s+/g, ' ').trim();
  return html;
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
  [1,2,3].forEach(n => {
    ngrams(toks, n).forEach(g => { feats[g] = (feats[g] || 0) + 1; });
  });
  return feats;
}

function dot(a, b) {
  let s = 0; for (const k in a) if (b[k]) s += a[k] * b[k]; return s;
}

function norm(a) { let s = 0; for (const k in a) s += a[k] * a[k]; return Math.sqrt(s); }

function cosine(a, b) { const d = dot(a,b); const na = norm(a); const nb = norm(b); if (!na || !nb) return 0; return d / (na * nb); }

function htmlCandidates(raw) {
  const s = raw
    .replace(/<\/(p|h1|h2|h3|li|section|article|header|footer|main|div)>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n');
  const stripped = stripHtml(s);
  return stripped.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => l.replace(/\s+/g, ' '));
}

function run() {
  const THRESH = parseFloat(process.argv[2]) || 0.20;
  const outDir = path.join(repoRoot, 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outCsv = path.join(outDir, 'missing_blocks.csv');
  const rows = [];
  rows.push(['page','block_index','similarity','block_text'].join(','));

  pages.forEach(p => {
    const htmlRaw = read(p.html);
    const copyRaw = read(p.copy);
    if (!htmlRaw || !copyRaw) return;
    const candidates = htmlCandidates(htmlRaw);
    const blocks = blocksFromMarkdown(copyRaw).map(b => stripMarkdown(b));
    blocks.forEach((blk, i) => {
      if (!blk) return;
      const wk = normalize(blk).split(' ').filter(Boolean).length;
      const markerRe = /^(h1|h2|h3|entrada|cierre|meta|title|subtitle|subtítulo|h1:|h2:|h3:)/i;
      if (wk < 4 || markerRe.test(blk)) return;
      const fblk = features(blk);
      let best = 0; let bestCand = '';
      candidates.forEach(c => {
        const fc = features(c);
        const s = cosine(fblk, fc);
        if (s > best) { best = s; bestCand = c; }
      });
      if (best < THRESH) {
        // escape quotes
        const text = '"' + blk.replace(/"/g, '""').replace(/\n/g, ' ') + '"';
        rows.push([p.html, i+1, best.toFixed(3), text].join(','));
      }
    });
  });

  fs.writeFileSync(outCsv, rows.join('\n'), 'utf8');
  console.log('Wrote', outCsv, 'rows:', rows.length - 1);
}

run();
