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
    const md = stripMarkdown(copyRaw).toLowerCase();
    const blocks = blocksFromMarkdown(copyRaw).map(b => stripMarkdown(b).toLowerCase());

    let missing = [];
    blocks.forEach((blk, i) => {
      if (!blk) return;
      if (html.includes(blk)) return; // exact match
      const ratio = wordOverlapRatio(blk, html);
      if (ratio >= FUZZY_THRESHOLD) return; // fuzzy match
      missing.push({ index: i+1, text: blk.slice(0, 200), ratio: Math.round(ratio * 100) });
    });

    console.log('  blocks:', blocks.length, ' missing:', missing.length);
    if (missing.length) {
      totalMissing += missing.length;
      missing.slice(0,10).forEach(m => console.log('   - block', m.index, ':', m.text, ' (overlap', m.ratio + '%)'));
      if (missing.length > 10) console.log('   ...', missing.length - 10, 'more');
    }
  });
  console.log('---- Summary: total missing blocks across pages:', totalMissing);
  process.exit(totalMissing ? 2 : 0);
}

run();

