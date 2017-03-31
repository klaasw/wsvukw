'use strict';

module.exports = {

	//browser: 'phantomjs',

	//mocha: true,
	//mochaReporter: "progress",  // https://chimp.readme.io/docs/reporting
    framework: 'cucumber',
    cucumberOpts: {
        saveScreenshotsToReport: true,
        timeout: 20000
    },
	// '- - - - DEBUGGING  - - - -
	log:                'debug',
	screenshotsOnError: true,
	jsonOutput:         'cucumber_output.json',

	debug:             false,
	seleniumDebug:     false,
	webdriverLogLevel: false
	// debugBrkCucumber: 5858,
};
