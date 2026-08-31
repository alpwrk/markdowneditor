const config = {
	tabwidth: 4,
	softtabs: true,
	linebreaks: true,

	shortbase: 'https://markdown.baden.club',
	shortlen: 8,

	syncurl: true,
	msgtimeout: 1200,
	autosave: 'md.doc',
	theme: 'md.theme',

	split: 'v',

	/* toolbar layout: keys from the table below, | is a separator, '' hides it */
	toolbar: 'b i d e | 1 2 3 | . 8 7 | k - Enter',

	greeting: [
		'# Guide',
		'',
		'Type on the left, read on the right.',
		'',
		'- The buttons above wrap the selection or start a line.',
		'- *controls* lists every key, *Esc* closes that list again.',
		'- *clear* empties the document, *reset* brings the guide (this text) back.',
		'- `Ctrl-s` copies the share url, `Ctrl-p` hides the editor.',
		'',
		'> The document lives in the URL, so copying it is the sharing.',
		'> It also survives a reload on its own.',
		'',
		'Overwrite all of this. It is only here to be read once.',
	].join('\n'),
};

/* ctrl, key, command, argument, toolbar label */
const keys = [
	[1, 'b',      'wrap',   ['**', '**'],       'bold'],
	[1, 'i',      'wrap',   ['*', '*'],         'italic'],
	[1, 'e',      'wrap',   ['`', '`'],         'code'],
	[1, 'd',      'wrap',   ['~~', '~~'],       'strike'],
	[1, 'k',      'link',   null,               'link'],
	[1, '1',      'prefix', '# ',               'h1'],
	[1, '2',      'prefix', '## ',              'h2'],
	[1, '3',      'prefix', '### ',             'h3'],
	[1, '.',      'prefix', '> ',               'quote'],
	[1, '8',      'prefix', '- ',               'list'],
	[1, '7',      'prefix', '1. ',              'ol'],
	[1, '-',      'prefix', '---\n',            'hr'],
	[1, 'Enter',  'wrap',   ['```\n', '\n```'], 'block'],
	[1, 's',      'share',  null,               'share'],
	[1, 'p',      'pane',   'out',              'preview only'],
	[1, ' ',      'split',  null,               'split'],
	[1, 'l',      'clear',  null,               'clear'],
	[1, '/',      'help',   null,               'controls'],
];
