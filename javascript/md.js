const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HEAD = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)/;
const QUOTE = /^ {0,3}> ?(.*)$/;
const ALIGN = /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/;
const SAFE = /^(?:https?:|mailto:|data:image\/|[#./?])/i;

function esc(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function url(u) {
	return SAFE.test(u) ? u : '#';
}

function inline(s) {
	const code = [];
	s = esc(s).replace(/(`+)([^]*?)\1/g, (_, __, c) =>
		'\x00' + (code.push('<code>' + c.trim() + '</code>') - 1) + '\x00');

	s = s.replace(/!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_, a, u) =>
			'<img src="' + url(u) + '" alt="' + a + '">')
	     .replace(/\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_, t, u) =>
			'<a href="' + url(u) + '">' + t + '</a>')
	     .replace(/&lt;((?:https?:\/\/|mailto:)[^\s&]+)&gt;/g, '<a href="$1">$1</a>')
	     .replace(/(\*\*|__)(?=\S)([^]*?\S)\1/g, '<strong>$2</strong>')
	     .replace(/(?<![\w*])(\*|_)(?=\S)([^]*?\S)\1(?![\w*])/g, '<em>$2</em>')
	     .replace(/~~(?=\S)([^]*?\S)~~/g, '<del>$1</del>')
	     .replace(/ {2,}$/gm, '<br>');

	return s.replace(/\x00(\d+)\x00/g, (_, i) => code[i]);
}

function blockish(l) {
	return !l.trim() || HEAD.test(l) || RULE.test(l) || FENCE.test(l) ||
	       QUOTE.test(l) || ITEM.test(l);
}

function cells(l) {
	return l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|');
}

function md(src) {
	const ln = src.replace(/\r\n?/g, '\n').split('\n');
	let out = '', i = 0;

	const list = () => {
		const base = ln[i].match(ITEM)[1].length;
		const ord = /\d/.test(ln[i].match(ITEM)[2]);
		let html = '';
		while (i < ln.length) {
			const m = (ln[i].trim() ? ln[i] : ln[i + 1] || '').match(ITEM);
			if (!m || m[1].length < base || /\d/.test(m[2]) !== ord) break;
			if (!ln[i].trim()) { i++; continue; }
			const pad = m[1].length + m[2].length + 1;
			let body = m[3];
			i++;
			while (i < ln.length) {
				const cur = ln[i], ind = /^\s*/.exec(cur)[0].length;
				if (!cur.trim()) {
					const nxt = ln[i + 1] || '';
					if (!nxt.trim() || /^\s*/.exec(nxt)[0].length < pad) break;
					body += '\n'; i++;
				} else if (ind >= pad) { body += '\n' + cur.slice(pad); i++; }
				else if (!ITEM.test(cur) && !blockish(cur)) { body += '\n' + cur.trim(); i++; }
				else break;
			}
			let li = /\n/.test(body) ? md(body) : inline(body);
			if (!/\n\s*\n/.test(body)) li = li.replace(/^<p>([^]*?)<\/p>/, '$1');
			html += '<li>' + li + '</li>';
		}
		out += ord ? '<ol>' + html + '</ol>' : '<ul>' + html + '</ul>';
	};

	const table = () => {
		const head = cells(ln[i]), al = cells(ln[i + 1]).map(c =>
			/^\s*:-+:\s*$/.test(c) ? 'center' : /-+:\s*$/.test(c) ? 'right' : 'left');
		const td = (c, k, j) => '<' + k + ' style="text-align:' + (al[j] || 'left') +
			'">' + inline(c.trim()) + '</' + k + '>';
		out += '<table><thead><tr>' + head.map((c, j) => td(c, 'th', j)).join('') +
			'</tr></thead><tbody>';
		i += 2;
		while (i < ln.length && ln[i].includes('|'))
			out += '<tr>' + cells(ln[i++]).map((c, j) => td(c, 'td', j)).join('') + '</tr>';
		out += '</tbody></table>';
	};

	while (i < ln.length) {
		const l = ln[i], m = l.match(FENCE);

		if (!l.trim()) { i++; }
		else if (m) {
			const end = new RegExp('^ {0,3}' + m[1][0] + '{' + m[1].length + ',}\\s*$');
			const buf = [];
			for (i++; i < ln.length && !end.test(ln[i]); i++) buf.push(ln[i]);
			i++;
			out += '<pre><code' + (m[2] ? ' class="lang-' + esc(m[2]) + '"' : '') +
				'>' + esc(buf.join('\n')) + '</code></pre>';
		}
		else if (RULE.test(l)) { out += '<hr>'; i++; }
		else if (HEAD.test(l)) {
			const h = l.match(HEAD);
			out += '<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>';
			i++;
		}
		else if (QUOTE.test(l)) {
			const buf = [];
			while (i < ln.length && (QUOTE.test(ln[i]) || (ln[i].trim() && !blockish(ln[i]))))
				buf.push((ln[i].match(QUOTE) || [, ln[i]])[1]), i++;
			out += '<blockquote>' + md(buf.join('\n')) + '</blockquote>';
		}
		else if (ITEM.test(l)) list();
		else if (l.includes('|') && ALIGN.test(ln[i + 1] || '')) table();
		else {
			const buf = [];
			while (i < ln.length && ln[i].trim() && !blockish(ln[i]) &&
			       !(ln[i].includes('|') && ALIGN.test(ln[i + 1] || '')))
				buf.push(ln[i++]);
			if (!buf.length) buf.push(ln[i++]);
			let p = inline(buf.join('\n'));
			p = config.linebreaks ? p.replace(/\n/g, '<br>') : p.replace(/\n/g, ' ');
			out += '<p>' + p + '</p>';
		}
	}
	return out;
}
