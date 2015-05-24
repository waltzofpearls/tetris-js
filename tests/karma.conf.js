'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../',

    files: [
      {pattern: 'public/javascripts/**/*.js', included: false},
      {pattern: 'public/templates/**/*.html', included: false},
      {pattern: 'tests/unit-bjs/**/*.spec.js', included: false},
      'tests/unit-bjs/test-main.js'
    ],

    exclude: [
      'public/javascripts/main.js',
      'public/javascripts/main.min.js',
      'public/javascripts/libs/require-2.1.15/require.min.js'
    ],

    singleRun: true,
    autoWatch: false,

    frameworks: ['jasmine', 'requirejs'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-requirejs'
    ],

    reporters: ['dots']
  });
};
