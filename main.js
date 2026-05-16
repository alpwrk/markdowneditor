const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const wc = document.getElementById('wc');

marked.setOptions({ breaks: true, gfm: true });

const demo = `# Markdown Editor

A minimal editor — **write** on the left, *read* on the right.

## Usage

- Type markdown in the editor
- Preview updates in real time
- Use the toolbar for quick formatting

## Code

\`\`\`js
const render = () => preview.innerHTML = marked.parse(editor.value);
editor.addEventListener('input', render);
\`\`\`

> Simplicity is the ultimate sophistication.

| Element | Syntax |
|---------|--------|
| Heading | \`# H1\` |
| Bold | \`**text**\` |
| Code | \`\`code\`\` |
`;

function loadFromUrl() {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;
  try {
    const decoded = LZString.decompressFromEncodedURIComponent(hash);
    if (decoded) { editor.value = decoded; return true; }
  } catch {}
  return false;
}

function updateUrl() {
  const compressed = LZString.compressToEncodedURIComponent(editor.value);
  history.replaceState(null, '', '#' + compressed);
}

function render() {
  preview.innerHTML = marked.parse(editor.value);
  const words = editor.value.trim().split(/\s+/).filter(Boolean).length;
  wc.textContent = words + ' word' + (words !== 1 ? 's' : '');
  updateUrl();
}

if (!loadFromUrl()) {
  editor.value = demo;
}
render();

editor.addEventListener('input', render);

editor.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = editor.selectionStart;
    editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + 2;
    render();
  }
});

function ins(before, after) {
  const s = editor.selectionStart, e = editor.selectionEnd;
  const sel = editor.value.slice(s, e);
  editor.value = editor.value.slice(0, s) + before + sel + after + editor.value.slice(e);
  editor.selectionStart = s + before.length;
  editor.selectionEnd = e + before.length;
  editor.focus(); render();
}

function insl(before) {
  const s = editor.selectionStart;
  const ls = editor.value.lastIndexOf('\n', s - 1) + 1;
  editor.value = editor.value.slice(0, ls) + before + editor.value.slice(ls);
  editor.selectionStart = editor.selectionEnd = ls + before.length;
  editor.focus(); render();
}

function insBlock() { ins('```\n', '\n```'); }

function insLink() {
  const s = editor.selectionStart, e = editor.selectionEnd;
  const sel = editor.value.slice(s, e) || 'text';
  const rep = `[${sel}](url)`;
  editor.value = editor.value.slice(0, s) + rep + editor.value.slice(e);
  editor.selectionStart = s + sel.length + 3;
  editor.selectionEnd = s + rep.length - 1;
  editor.focus(); render();
}

function clearAll() {
  if (confirm('Clear everything?')) { editor.value = ''; render(); editor.focus(); }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('share-btn');
    const orig = btn.textContent;
    btn.textContent = 'copied!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}