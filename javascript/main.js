const inp = document.getElementById('in');
const out = document.getElementById('out');
const st = {
	mode: document.getElementById('st-mode'),
	msg: document.getElementById('st-msg'),
	pos: document.getElementById('st-pos'),
	cnt: document.getElementById('st-cnt'),
};

let msgtimer, pending = null;

/* restored first, so a pinned theme does not flash the other one */
const saved = config.theme && localStorage.getItem(config.theme);
if (saved) document.documentElement.dataset.theme = saved;

function enc(s) {
	const b = new TextEncoder().encode(s);
	let bin = '';
	for (const c of b) bin += String.fromCharCode(c);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function dec(s) {
	const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
	const b = Uint8Array.from(bin, c => c.charCodeAt(0));
	return new TextDecoder().decode(b);
}

function msg(s) {
	st.msg.textContent = s;
	st.msg.className = '';
	clearTimeout(msgtimer);
	msgtimer = setTimeout(() => st.msg.textContent = '', config.msgtimeout);
}

function ask(name, question, run) {
	clearTimeout(msgtimer);
	pending = { name, run };
	st.msg.textContent = question + '? y/N';
	st.msg.className = 'ask';
}

function answer(yes) {
	const p = pending;
	pending = null;
	st.msg.textContent = '';
	st.msg.className = '';
	if (yes && p) { p.run(); render(); } else msg('cancelled');
}

function status() {
	const v = inp.value, upto = v.slice(0, inp.selectionStart).split('\n');
	st.pos.textContent = upto.length + ':' + (upto[upto.length - 1].length + 1);
	st.cnt.textContent = (v.trim() ? v.trim().split(/\s+/).length : 0) + 'w ' +
		v.length + 'c';
}

function render() {
	const top = out.scrollTop;
	out.innerHTML = md(inp.value);
	out.scrollTop = top;
	status();
	if (config.syncurl)
		history.replaceState(null, '', location.pathname + '#' + enc(inp.value));
	if (config.autosave) localStorage.setItem(config.autosave, inp.value);
}

function edit(text, from, to) {
	inp.setRangeText(text, from, to, 'preserve');
}

const cmd = {
	wrap([a, b]) {
		const s = inp.selectionStart, e = inp.selectionEnd;
		edit(a + inp.value.slice(s, e) + b, s, e);
		inp.selectionStart = s + a.length;
		inp.selectionEnd = e + a.length;
	},
	prefix(p) {
		const s = inp.selectionStart;
		const bol = inp.value.lastIndexOf('\n', s - 1) + 1;
		edit(p, bol, bol);
		inp.selectionStart = inp.selectionEnd = s + p.length;
	},
	link() {
		const s = inp.selectionStart, e = inp.selectionEnd;
		const sel = inp.value.slice(s, e) || 'text';
		edit('[' + sel + '](url)', s, e);
		inp.selectionStart = s + sel.length + 3;
		inp.selectionEnd = s + sel.length + 6;
	},
	share() {
		navigator.clipboard.writeText(location.href)
			.then(() => msg('url copied (' + location.href.length + 'b)'))
			.catch(() => msg('clipboard denied'));
	},
	/* keep is the pane that stays: 'in', 'out', or '' for both */
	pane(keep) {
		const v = document.body.dataset.view === keep ? '' : keep;
		document.body.dataset.view = v;
		msg(v === 'in' ? 'editor only' : v === 'out' ? 'preview only' : 'split');
	},
	split() {
		config.split = config.split === 'v' ? 'h' : 'v';
		document.body.dataset.split = config.split;
	},
	/* without a choice the browser preference rules, a click pins one */
	theme() {
		const r = document.documentElement;
		const light = r.dataset.theme ? r.dataset.theme === 'light' :
			matchMedia('(prefers-color-scheme: light)').matches;
		r.dataset.theme = light ? 'dark' : 'light';
		if (config.theme) localStorage.setItem(config.theme, r.dataset.theme);
	},
	help() {
		document.body.dataset.help = document.body.dataset.help ? '' : '1';
	},
	clear() {
		ask('clear', 'clear the document', () => {
			inp.value = '';
			msg('cleared');
		});
	},
	reset() {
		ask('reset', 'reset to the default document', () => {
			inp.value = config.greeting;
			msg('reset');
		});
	},
};

document.addEventListener('keydown', e => {
	if (pending) {
		if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
		e.preventDefault();
		return answer(e.key === 'y' || e.key === 'Y');
	}
	if (e.key === 'Escape' && document.body.dataset.help) {
		e.preventDefault();
		return cmd.help();
	}
	if (e.key === 'Tab' && e.target === inp) {
		e.preventDefault();
		const t = config.softtabs ? ' '.repeat(config.tabwidth) : '\t';
		edit(t, inp.selectionStart, inp.selectionEnd);
		return render();
	}
	for (const [ctrl, key, fn, arg] of keys) {
		if (!!ctrl !== (e.ctrlKey || e.metaKey) || e.altKey) continue;
		if (e.key.toLowerCase() !== key.toLowerCase()) continue;
		e.preventDefault();
		cmd[fn](arg);
		inp.focus();
		return render();
	}
});

const help = document.getElementById('help');
for (const [ctrl, key, , , label] of keys) {
	if (!label) continue;
	const k = document.createElement('b'), l = document.createElement('span');
	k.textContent = (ctrl ? 'Ctrl-' : '') + (key === ' ' ? 'Space' : key);
	l.textContent = label;
	help.append(k, l);
}

/* the bar keeps the caret where it is: no focus change, no scroll to it */
for (const b of document.querySelectorAll('#bar button'))
	b.addEventListener('mousedown', e => e.preventDefault());

document.getElementById('st-controls').addEventListener('click', () => {
	if (pending) answer(false);
	cmd.help();
	inp.focus({ preventScroll: true });
});

for (const [id, keep] of [['pane-l', 'out'], ['pane-r', 'in']]) {
	const b = document.getElementById(id);
	b.addEventListener('mousedown', e => e.preventDefault());
	b.addEventListener('click', () => {
		cmd.pane(keep);
		inp.focus({ preventScroll: true });
	});
}

const th = document.getElementById('theme');
th.addEventListener('mousedown', e => e.preventDefault());
th.addEventListener('click', () => cmd.theme());

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function shortcode(n) {
	const r = new Uint32Array(n);
	crypto.getRandomValues(r);
	return Array.from(r, x => alphabet[x % alphabet.length]).join('');
}

const ls = document.getElementById('linkshort');
ls.addEventListener('mousedown', e => e.preventDefault());
ls.addEventListener('click', () => {
	const url = config.shortbase + '/' + shortcode(config.shortlen);
	navigator.clipboard.writeText(url)
		.then(() => msg('short url copied'))
		.catch(() => msg('clipboard denied'));
});

const tools = document.getElementById('tb');
for (const t of config.toolbar.split(' ').filter(Boolean)) {
	if (t === '|') { tools.append(document.createElement('i')); continue; }
	const k = keys.find(k => k[1] === t);
	if (!k) continue;
	const b = document.createElement('button');
	b.textContent = k[4];
	b.title = 'Ctrl-' + k[1];
	b.addEventListener('mousedown', e => e.preventDefault());
	b.addEventListener('click', () => {
		if (pending) return answer(false);
		cmd[k[2]](k[3]);
		inp.focus();
		render();
	});
	tools.append(b);
}

for (const name of ['clear', 'reset'])
	document.getElementById('st-' + name).addEventListener('click', () => {
		if (pending) return answer(pending.name === name);
		cmd[name]();
		inp.focus();
	});

inp.addEventListener('input', render);
['click', 'keyup', 'select'].forEach(ev => inp.addEventListener(ev, status));

window.addEventListener('hashchange', () => {
	const h = location.hash.slice(1);
	try { if (h && dec(h) !== inp.value) { inp.value = dec(h); render(); } } catch {}
});

document.body.dataset.split = config.split;
document.body.dataset.view = '';

try {
	const h = location.hash.slice(1);
	inp.value = h ? dec(h) :
		(config.autosave && localStorage.getItem(config.autosave)) || config.greeting;
} catch { inp.value = config.greeting; }

render();
