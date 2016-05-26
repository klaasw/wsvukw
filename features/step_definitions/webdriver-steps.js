var myStepDefinitionsWrapper = function () {
    var cfg = require('../../cfg.js');

    this.When(/^Webseite "([^"]*)" aufgerufen wird$/, function (url) {
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay",""); 
        browser.url(openUrl);
    });

    this.Then(/^lautet der Titel "([^"]*)"$/, function (title) {
        expect(browser.getTitle()).toEqual(title);
    });

    this.When(/^Button "([^"]*)" geschaltet wird$/, function (button) {
        //assert("Button11" === button);
        browser.click("div#" + button);
    });

    this.Then(/^wird in "([^"]*)" der Hintergrund "([^"]*)"$/, function (button, color) {
        console.log("teste Hintergrundfarbe "+ color+" fuer Button: "+button);
        var styleExists = '#' + button + 'panel div.panel.panel-default';
        switch (color) {
            case "weiss":
                styleExists = styleExists;
                break;
            case "blau":
                styleExists = styleExists+ ".panel-primary";
                break;
            case "gruen":
                styleExists = "div#" + button + ".bg-success";
                break;
            case "rot":
                styleExists = "div#" + button + ".bg-danger";
                break;
        }
        console.log("suche nach Element: "+styleExists);
        browser.waitForExist(styleExists, 15000);
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, id) {
        var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "'/>";
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var url = "http://" + ip + ":" + port + "/mockmessage?messageText=" + message;
        console.log(" URL : " + JSON.stringify(url));
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = body;
                console.log(" REST response: " + response);
                //expect(response).toEqual("Abgesendet: " + nachrichtentyp + " id='" + id + "' state='" + state + "'");
                console.log("fertig2");
            } else {
                console.log("Fehler. " + error);
                console.log("fertig3");
            }
        });
        console.log("fertig1");
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" und Kanal gesendet wird$/, function (nachrichtentyp, state, id, channel) {
        var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "' channel='" + channel + "'/>";
        console.log("message: " + message);
        request("http://10.22.30.1:3000/mockmessage?messageText=" + message, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body);
                console.log(" REST response: " + JSON.stringify(response));
            } else {
                console.log("Fehler. " + JSON.stringify(error));
            }
        });
    });


};
module.exports = myStepDefinitionsWrapper;
