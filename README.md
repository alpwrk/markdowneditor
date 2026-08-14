# md

A markdown editor in the suckless spirit: no dependencies, no CDN, no build
step, no tracking. Open `index.html` in a browser, that is the install.

	index.html   markup
	config.js    all configuration (keys, tabs, startup text)
	md.js        markdown parser
	main.js      editor and status bar
	style.css    colours and metrics
	media        font and icon

## configuration

Edit `config.js` and reload. Key bindings are a table of
`[ctrl, key, command, argument]`; commands are `wrap`, `prefix`, `link`,
`share`, `zoom`, `split` and `clear`. Colours live at the top of `style.css`.

## keys

	C-b     bold              C-1..3   heading
	C-i     italic            C-.      quote
	C-e     code              C-8      unordered list
	C-d     strike            C-7      ordered list
	C-k     link              C--      rule
	C-Enter code block        C-l      clear

	C-s     copy share url    C-p      toggle preview only
	C-Space toggle split direction

## sharing

The document is base64url-encoded into `location.hash`, so the URL *is* the
document. Nothing is uploaded anywhere. `C-s` copies it.

Markdown supports headings, emphasis, strikethrough, code spans and fences,
lists (nested), blockquotes, tables with alignment, rules, links, images and
autolinks. Raw HTML is escaped, not rendered.
