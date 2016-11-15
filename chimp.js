module.exports = {
    port: 4444,
    host: "10.161.9.42",
    browser: "firefox",  // ab Firefox Version 47: "marionette" statt "firefox"   https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver

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