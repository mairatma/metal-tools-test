'use strict';

module.exports = function(config) {
	config.set({
		frameworks: ['browserify', 'mocha', 'chai', 'sinon', 'source-map-support'],

		files: ['test/**/*.js'],

		preprocessors: {
			'test/**/*.js': ['browserify']
		},

		browsers: ['Chrome'],

		browserify: {
			debug: true,
			transform: [
				['babelify', {presets: ['es2015']}]
			]
		}
	});
};
