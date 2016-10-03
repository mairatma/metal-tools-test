'use strict';

var gulp = require('gulp');
var karma = require('karma');

module.exports = {
	allBrowsers: ['Chrome'],
	autoOpenCoverage: false,
	gulp: gulp,
  karma: karma
};
