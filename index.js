'use strict';

var defaultOptions = require('./lib/options');
var fs = require('fs');
var merge = require('merge');
var openFile = require('open');
var path = require('path');

var testRunners = {
	run: function(options, done) {
		options = merge({}, defaultOptions, options);
		runKarma(options, {singleRun: true}, function() {
			done();
		});
	},

	runBrowsers: function(options, done) {
		options = merge({}, defaultOptions, options);
		runKarma(
			options,
			{
				browsers: options.allBrowsers,
				singleRun: true
			},
			done,
			'browsers'
		);
	},

	runWithCoverage: function(options, done) {
		options = merge({}, defaultOptions, options);
		runKarma(
			options,
			{
				configFile: path.join(__dirname, 'lib/karma-configs/karma-coverage.conf.js'),
				singleRun: true
			},
			function() {
				done();
			},
			'coverage'
		);
		if (options.autoOpenCoverage) {
			openFile(path.resolve('coverage/lcov/lcov-report/index.html'));
		}
	},

	runWithCoverageAndOpen: function(options, done) {
		options = merge({}, defaultOptions, options);
		options.autoOpenCoverage = true;
		testRunners.runWithCoverage(options, done);
	},

	watch: function(options, done) {
		options = merge({}, defaultOptions, options);
		if (options.extraWatch) {
			options.gulp.watch(options.extraWatch.src, options.extraWatch.handler);
		}
		runKarma(options, {}, done);
	}
};

module.exports = testRunners;

function runKarma(options, config, done, opt_suffix) {
	var suffix = opt_suffix ? '-' + opt_suffix : '';
	var configFile = path.resolve('karma' + suffix + '.conf.js');
	var configGenericFile = path.resolve('karma.conf.js');
	if (fs.existsSync(configFile)) {
		config.configFile = configFile;
	} else if (fs.existsSync(configGenericFile)) {
		config.configFile = configGenericFile;
	} else if (!config.configFile) {
		config.configFile = path.join(__dirname, 'lib/karma-configs/karma.conf.js');
	}

	if (!config.basePath) {
		config.basePath = process.cwd();
	}
	new options.karma.Server(config, done).start();
}


module.exports.TASKS = [
	{name: 'test', handler: testRunners.run},
	{name: 'test:browsers', handler: testRunners.runBrowsers},
	{name: 'test:coverage', handler: testRunners.runWithCoverage},
	{
		name: 'test:coverage:open',
		handler: testRunners.runWithCoverageAndOpen
	},
	{name: 'test:watch', handler: testRunners.watch}
];
