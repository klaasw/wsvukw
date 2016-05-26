var myStepDefinitionsWrapper = function () {

    if (false){
        var cfg = require('../../cfg.js');
    }

    this.When(/^Webseite "([^"]*)" aufgerufen wird$/, function (url) {
        browser.url(url);
    });

    this.Then(/^lautet der Titel "([^"]*)"$/, function (title) {
        expect(browser.getTitle()).toEqual(title);
    });

    this.When(/^Button "([^"]*)" geschaltet wird$/, function (button) {
        //assert("Button11" === button);
        browser.click("div#"+button);
    });

    this.Then(/^wird in "([^"]*)" der Hintergrund "([^"]*)"$/, function (button, color) {
        var styleExists;
        switch(color) {
            case "gruen":
                styleExists = "panel-success";
                break;
            case "blau":
                styleExists = "panel-primary";
                break;
        }
        // Warten auf Reaktion (notify)
        browser.waitForExist("div.alert", 15000);
            //expect(browser.getElement(button)).getStyle().toEqual(styleExists);


        //browser.getCssProperty('#someElement', 'color').then(function(color) {console.log(color);});

        expect(browser.getCssProperty('div#'+button+'panel.div', 'background-color').parsed.hex).toEqual('#D9EDF7');
    });


    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" gesendet wird$/, function (nachrichtentyp, state, id) {
        var message="<"+ nachrichtentyp +" id='"+ id +"' state='"+ state +"'/>";
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var url = "http://"+ ip +":"+ port +"/mockmessage?messageText="+message;
        console.log(" URL : "+ url);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body);
                console.log(" REST response: " + JSON.stringify(response));
            } else {
                console.log("Fehler. " + JSON.stringify(error));
            }
        });
    });

    this.When(/^SIPNachricht "([^"]*)" mit state "([^"]*)" an FunkstellenID "([^"]*)" und Kanal gesendet wird$/, function (nachrichtentyp, state, id, channel) {
        var message="<"+ nachrichtentyp +" id='"+ id +"' state='"+ state +"' channel='"+channel +"'/>";
        console.log("message: "+ message);
        request("http://10.22.30.1:3000/mockmessage?messageText="+message, function (error, response, body) {
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
