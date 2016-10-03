'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');

var metalToolsTest = rewire('../index');

describe('Metal Tools - Testing', function() {
	var karmaStub;
	var openFileStub;

	before(function() {
		openFileStub = sinon.stub();
		metalToolsTest.__set__('openFile', openFileStub);
	});

	beforeEach(function() {
		karmaStub = {
			Server: function(config, callback) {
				return {
					start: callback
				};
			}
		};
		sinon.spy(karmaStub, 'Server');
	});

	afterEach(function() {
		 if (fs.existsSync.restore) {
			 fs.existsSync.restore();
		 }
	});

	describe('run', function() {
		it('should use own karma config file with single run by default', function(done) {
			var options = {
				karma: karmaStub
			};
			metalToolsTest.run(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('lib/karma-configs/karma.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});

		it('should use local karma config file when it exists', function(done) {
			sinon.stub(fs, 'existsSync').returns(true);
			var options = {
				karma: karmaStub
			};
			metalToolsTest.run(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('karma.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});
	});

	describe('runBrowsers', function() {
		it('should run tests for browsers specified in "allBrowsers"', function(done) {
			var options = {
				allBrowsers: ['Chrome', 'Firefox'],
				karma: karmaStub
			};
			metalToolsTest.runBrowsers(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('lib/karma-configs/karma.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				assert.deepEqual(['Chrome', 'Firefox'], config.browsers);
				done();
			});
		});

		it('should use local karma browser config file when it exists', function(done) {
			sinon.stub(fs, 'existsSync').returns(true);
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runBrowsers(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('karma-browsers.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});
	});

	describe('runWithCoverage', function() {
		it('should use own coverage karma config file with single run by default', function(done) {
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runWithCoverage(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('lib/karma-configs/karma-coverage.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});

		it('should use local karma coverage config file when it exists', function(done) {
			sinon.stub(fs, 'existsSync').returns(true);
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runWithCoverage(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('karma-coverage.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});

		it('should use local karma generic config file when it exists but not a specific one', function(done) {
			sinon.stub(fs, 'existsSync', function(path) {
				return path.indexOf('coverage') === -1;
			});
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runWithCoverage(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('karma.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});
	});

	describe('runWithCoverageAndOpen', function() {
		it('should run coverage tests', function(done) {
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runWithCoverageAndOpen(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('lib/karma-configs/karma-coverage.conf.js'), config.configFile);
				assert.ok(config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});

		it('should open coverage file after running tests', function(done) {
			var options = {
				karma: karmaStub
			};
			metalToolsTest.runWithCoverageAndOpen(options, function() {
				assert.equal(1, openFileStub.callCount);
				done();
			});
		});
	});

	describe('watch', function() {
		beforeEach(function() {
			sinon.stub(gulp, 'watch');
		});

		afterEach(function() {
			gulp.watch.restore();
		});

		it('should pass singleRun as false when testing with watch', function(done) {
			var options = {
				karma: karmaStub
			};
			metalToolsTest.watch(options, function() {
				assert.equal(1, karmaStub.Server.callCount);

				var config = karmaStub.Server.args[0][0];
				assert.ok(config);
				assert.equal(path.resolve('lib/karma-configs/karma.conf.js'), config.configFile);
				assert.ok(!config.singleRun);
				assert.equal(process.cwd(), config.basePath);
				done();
			});
		});

		it('should watch extra files via "gulp.watch"', function(done) {
			var options = {
				extraWatch: {
					src: 'watchSrc/**/*.js',
					handler: sinon.stub()
				},
				karma: karmaStub
			};
			metalToolsTest.watch(options, function() {
				assert.equal(1, gulp.watch.callCount);
				assert.equal(options.extraWatch.src, gulp.watch.args[0][0]);
				assert.equal(options.extraWatch.handler, gulp.watch.args[0][1]);
				done();
			});
		});
	});
});
