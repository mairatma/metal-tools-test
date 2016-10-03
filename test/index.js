'use strict';

var assert = require('assert');
var consume = require('stream-consume');
var del = require('del');
var fs = require('fs');
var metalToolsBuildRollup = require('../index');

describe('Metal Tools - Rollup Build', function() {
	var options;

  beforeEach(function(done) {
		options = {
      src: 'test/fixtures/js/foo.js',
      dest: 'test/fixtures/build'
    };
		del('test/fixtures/build').then(function() {
	    done();
	  });
  });

	it('should build specified js files into a single bundle and its source map', function(done) {
    var stream = metalToolsBuildRollup(options);
		stream.on('end', function() {
			assert.ok(fs.existsSync('test/fixtures/build/metal.js'));
			assert.ok(fs.existsSync('test/fixtures/build/metal.js.map'));
  		done();
		});
		consume(stream);
	});

	it('should build js files to a bundle that uses "globalName" as the global variable name', function(done) {
		options.globalName = 'myGlobal';
		var stream = metalToolsBuildRollup(options);
		stream.on('end', function() {
			var contents = fs.readFileSync('test/fixtures/build/metal.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('global.myGlobal ='));
			done();
		});
		consume(stream);
	});

	it('should build js files to a bundle with the name specified by "bundleFileName"', function(done) {
		options.bundleFileName = 'myBundle.js';
		var stream = metalToolsBuildRollup(options);
		stream.on('end', function() {
			assert.ok(fs.existsSync('test/fixtures/build/myBundle.js'));
			assert.ok(fs.existsSync('test/fixtures/build/myBundle.js.map'));
			done();
		});
		consume(stream);
	});
});
