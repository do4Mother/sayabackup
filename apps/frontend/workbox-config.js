module.exports = {
	globDirectory: 'dist',
	globPatterns: [
		'**/*.{json,html,css,js}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};