# md

A markdown editor in the suckless spirit: no dependencies, no CDN, no build
step, no tracking. Open `index.html` in a browser, that is the install.

	index.html   markup
	style.css    colours and metrics
	javascript   config.js, md.js, main.js (configuration, parser, editor)
	media        font and icon

## configuration

Edit `javascript/config.js` and reload. Key bindings are a table of
`[ctrl, key, command, argument, label]`; commands are `wrap`, `prefix`, `link`,
`share`, `pane`, `split`, `help` and `clear`. Colours live at the top of
`style.css`.

The toolbar is one line of that config: `toolbar` lists the keys to show, in
order, `|` draws a separator, and an empty string leaves only the two pane
arrows in the middle.
Buttons are labelled and titled from the same table, so they cannot drift out
of sync with the bindings. The `controls` button in the status bar prints that
same table, so a binding is documented the moment it exists.

## keys

	Ctrl-b     bold           Ctrl-1..3   heading
	Ctrl-i     italic         Ctrl-.      quote
	Ctrl-e     code           Ctrl-8      unordered list
	Ctrl-d     strike         Ctrl-7      ordered list
	Ctrl-k     link           Ctrl--      rule
	Ctrl-Enter code block     Ctrl-l      clear

	Ctrl-s     copy share url Ctrl-p      toggle preview only
	Ctrl-Space toggle split direction
	Ctrl-/     controls, the same list inside the editor (Esc closes it)

## sharing

The document is base64url-encoded into `location.hash`, so the URL *is* the
document. Nothing is uploaded anywhere. `C-s` copies it.

Markdown supports headings, emphasis, strikethrough, code spans and fences,
lists (nested), blockquotes, tables with alignment, rules, links, images and
autolinks. Raw HTML is escaped, not rendered.
