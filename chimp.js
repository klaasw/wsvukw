module.exports = {
    // in current chimp version, selenium installation and use works out of the box, so port and host are obsolte:
	//port: 4444,
    //host: "10.22.30.1",


    browser: "chrome",

    //mocha: true,
    //mochaReporter: "progress",  // https://chimp.readme.io/docs/reporting

    // '- - - - DEBUGGING  - - - -
    log: 'debug',
    screenshotsOnError: true,
    jsonOutput: 'cucumber_output.json',

    debug: false,
    seleniumDebug: false,
    webdriverLogLevel: false
    // debugBrkCucumber: 5858,
};