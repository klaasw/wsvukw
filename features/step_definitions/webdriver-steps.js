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
        console.log("\t\tteste Hintergrundfarbe " + color + " fuer Button: " + button);
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
        console.log("\t\tsuche nach Element: " + styleExists);
        browser.waitForExist(styleExists, 15000);
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, id) {
        var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "'/>";
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var url = "http://" + ip + ":" + port + "/mockmessage?messageText=" + message;
        console.log("\t\tURL : " + JSON.stringify(url));
        // yield
            request(url).then(function (error, response, body) {
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


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID von "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, button) {
        // Write the automation code here
        // FunkstellenID aus der Arbeitsplatzkonfig heraus bestimmen (Hauptanalgen-ID), NebenanlagenID
        pending();
    });

    this.When(/^Mehrkanalanlage "([^"]*)" auf Kanal "([^"]*)" umgeschaltet wird$/, function (button, channel) {
        // Write the automation code here
        pending();
        // html body.fuelux div.container-fluid div.content div.col-md-12 div.row div#Button22panel.col-md-2 div.panel.panel-default div#Button22 h2#Button22.text-right button.btn.btn-default.btn-lg.dropdown-toggle
        browser.click("h2#"+ button+ ".text-right button.btn.btn-default.btn-lg.dropdown-toggle");
        // html body.fuelux.modal-open div.container-fluid div.content div.col-md-12 div#mkaModal.modal.fade.in div.modal-dialog div.modal-content div.modal-body p button.btn.btn-default.btn-lg

        browser.waitForExist(styleExists, 15000);
    });


    this.Then(/^wird in "([^"]*)" der Kanal "([^"]*)" angezeigt$/, function (button, channel) {
        browser.getText("h2#" + button).toEqual(channel);
    });


    this.When(/^Mehrkanalanlage "([^"]*)" auf Kanaleingabefeld "([^"]*)" eingegeben wird$/, function (arg1, arg2) {
        // Write the automation code here
        pending();
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

    this.Then(/^Test jetzt beenden.$/, function (){
       browser.end();
    });
};
module.exports = myStepDefinitionsWrapper;
