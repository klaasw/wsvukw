var myStepDefinitionsWrapper = function () {
    var cfg = require('../../cfg.js');
    // var request  = require('co-request.js');

    this.When(/^Webseite "([^"]*)" aufgerufen wird$/, function (url) {
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay", "");
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
        //console.log("\t\tteste Hintergrundfarbe " + color + " fuer Button: " + button);
        var styleExists = '#' + button + 'panel div.panel.panel-default';
        switch (color) {
            case "weiss":
                styleExists = styleExists;
                break;
            case "blau":
                styleExists = styleExists + ".panel-primary";
                break;
            case "gruen":
                styleExists = "div#" + button + ".bg-success";
                break;
            case "rot":
                styleExists = "div#" + button + ".bg-danger";
                break;
        }
        //console.log("\t\tsuche nach Element: " + styleExists);
        browser.waitForExist(styleExists, 15000);
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, id) {
        var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "'/>";
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var url = "http://" + ip + ":" + port + "/mockmessage?messageText=" + message;
        //console.log("\t\tURL : " + JSON.stringify(url));
        request(url);
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID von "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, button) {
        // Write the automation code here
        // FunkstellenID aus der Arbeitsplatzkonfig heraus bestimmen (Hauptanalgen-ID), NebenanlagenID
        pending();
    });

    this.When(/^Mehrkanalanlage "([^"]*)" mit FunkstellenID "([^"]*)" auf Kanal "([^"]*)" umgeschaltet wird$/, function (button, funkstellenid, channel) {
        browser.click("h2#" + button + " button");
        browser.waitForExist("div#mkaModal.modal.fade.in", 65000);
        //console.log("\t\tgefunden: button#channel"+channel);

        browser.click("button#channel" + channel);

        // TODO simulieren der Kanal-Umschaltung
        var message = "<FSTSTATUS id='" + funkstellenid + "' state='0' channel='" + channel + "'/>";
        request("http://" + cfg.cfgIPs.httpIP + ":" + cfg.port + "/mockmessage?messageText=" + message);
    });


    this.When(/^wird in "([^"]*)" der Kanal "([^"]*)" angezeigt$/, function (button, channel) {
        expect(browser.getText("h2#" + button)).toEqual(channel);
    });


    this.When(/^Mehrkanalanlage "([^"]*)" mit FunkstellenID "([^"]*)" im Kanaleingabefeld "([^"]*)" eingegeben wird$/, function (button, id, channelinput) {
        if (true) {
            pending();
        } else {
            console.log("\t\ttestfür spinbox");
            browser.click("h2#" + button + " button");
            browser.waitForExist("div#mkaModal.modal.fade.in", 65000);
            console.log("\t\tzwischenzustand für spinbox");
            browser.setValue("#mySpinbox", channelinput)
                .getValue("#mySpinbox").then(function (value) {
                assert(value === channelinput); // true
            });
            browser.click("div.modal-footer button.btn-primary");

            // TODO simulieren der Kanal-Umschaltung
            var message = "<FSTSTATUS id='" + funkstellenid + "' state='0' channel='" + channel + "'/>";
            request("http://" + cfg.cfgIPs.httpIP + ":" + cfg.port + "/mockmessage?messageText=" + message);
        }
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" und Kanal gesendet wird$/, function (nachrichtentyp, state, id, channel) {
        var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "' channel='" + channel + "'/>";
        console.log("\t\tmessage: " + message);
        request("http://10.22.30.1:3000/mockmessage?messageText=" + message, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body);
                console.log(" REST response: " + JSON.stringify(response));
            } else {
                console.log("Fehler. " + JSON.stringify(error));
            }
        });
    });


    this.When(/^Navigationselement Gruppe_Einzel "([^"]*)" anzeigt$/, function (zustand) {
        // li#gruppe a
        expect(browser.getText('li#gruppe a')).toEqual(zustand);
    });

    this.When(/^Navigationselement Gruppe_Einzel aktiviert wird$/, function () {
        browser.click('li#gruppe a');
    });


    this.When(/^in Button "([^"]*)" für den Lautstärkepegel "([^"]*)" der Wert "([^"]*)" angezeigt wird$/, function (button, shipOrL, value) {
        // Write the automation code here
        pending();
    });

    this.When(/^in Button "([^"]*)" der Lautstärkepegel "([^"]*)" auf Wert "([^"]*)" geschaltet wird$/, function (button, shipOrL, value) {
        // Write the automation code here
        pending();
    });

    this.When(/^Test jetzt beenden.$/, function () {
        browser.end();
    });


};
module.exports = myStepDefinitionsWrapper;
