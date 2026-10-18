// Karma configuration
// Generated on Sat May 25 2019 19:42:14 GMT+0900 (日本標準時)
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
       'node_modules/react/umd/react.development.js',
       'node_modules/react-dom/umd/react-dom.development.js',
       { pattern: 'manifest.json', included: false, served: true },
       'spec/js/mock.js',
       'src/html/*.html',
       'src/js/*.js',
       'spec/js/*-spec.js'
    ],
    exclude: [
       'src/js/background.js',
    ],
    preprocessors: {
      'src/html/*.html': ['html2js'],
      'src/js/*.js': ['coverage']
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity,
    coverageReporter: {
      reporters: [
        { type: 'lcovonly', subdir: '.' },
        { type: 'json', subdir: '.' },
        ]
    }, 
  })
}
