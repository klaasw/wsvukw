/**
 * Created by rwild on 02.02.2017.
 */

'use strict';

module.exports = function() {
    var cfg = require('../../cfg.js');
    var devices;
    var funkPanel;

    this.Given(/^ist der Arbeitsplatz "([^"]*)" NvD$/, function (url) {
        widgets.open.openSite(url);
    });

    this.Given(/^"([^"]*)" ist aktiviert$/, function (mode) {
        widgets.header.setMode(mode);
    });

    this.Given(/^alle Schaltflächen sind deaktiviert$/, function () {
        widgets.content.setAllPanelInactive();
    });

    this.Given(/^das Design "([^"]*)" ist ausgewählt$/, function (design) {
        widgets.header.clickColor();
        widgets.header.selectColor(design);
        widgets.header.clickColor();
    });

    this.Given(/^ausgewählt ist die defekte Serveranlage "([^"]*)"$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Given(/^eine Funkstelle nicht betriebsbereit ist$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Given(/^Einzelschaltung und Standardschaltfläche ist aktiv$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Given(/^die Standardschaltfläche Zeile "([^"]*)", Spalte "([^"]*)" ist aktiviert$/, function (row,column) {
        widgets.content.clickOnPanel(row,column);
    });


    this.When(/^ich auf die Standardschaltfläche Zeile "([^"]*)", Spalte "([^"]*)" klicke$/, function (row,column) {
        widgets.content.clickOnPanel(row,column);
    });

    this.When(/^ich auf die Standardschaltflächen klicke$/, function (datatable) {
        widgets.content.clickOnPanels(datatable);
    });

    this.When(/^ich auf die Funkstellen der Standardschaltfläche Zeile "([^"]*)", Spalte "([^"]*)" klicke$/, function (row,column) {
       funkPanel = widgets.content.clickOnFunkPanel(row,column);
    });

    this.When(/^einen Kanal auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich eine Mehrkanalschaltfläche anklicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ein Teilnehmer ohne ATIS Kennung eine Nachricht sendet$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ein Teilnehmer eine SIPNachricht "([^"]*)" mit Status "([^"]*)" an die Funkstelle "([^"]*)" sendet$/, function (nachrichtentyp, state, id){
            var message = "<" + nachrichtentyp + " id='" + id + "' state='" + state + "'/>";
            var ip = cfg.cfgIPs.httpIP;
            var port = cfg.port;
            var url = "http://" + ip + ":" + port + "/mockmessage?messageText=" + message;
            console.log(message);
        console.log(ip);
        console.log(port);
        console.log(url);
            request(url);
    });

    this.When(/^ein Teilnehmer eine SIPNachricht "([^"]*)" mit Status "([^"]*)" an die Funkstelle "([^"]*)" mit Kanal "([^"]*)" sendet$/, function (nachrichtentyp, state, id, channel) {
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

    this.When(/^eine Kommunikation über eine Gleichwellenanlage stattfindet$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich die "([^"]*)" aktiviere$/, function (arg1) {
        widgets.header.setSchaltung(arg1);
    });

    this.When(/^ich auf den Button "([^"]*)" klicke$/, function (arg1) {
        switch(arg1) {
            case "Farbschema":
                widgets.header.clickColor();
                break;
            case "Arbeitsplatzgeräte":
                widgets.header.clickDevices();
                break;
            case "Serveranlagen":
                widgets.header.clickServer();
                break;
            case "Display sperren":
                widgets.header.clickUkwDisplay();
                break;
            default:
                console.log('no match for ' + arg1);
        }
    });


    this.When(/^eine Standardschaltfläche aktiviere$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich das Design "([^"]*)" auswähle$/, function (arg1) {
        widgets.header.selectColor(arg1);
    });

    this.When(/^ein Gerät den Status "([^"]*)" anzeigt$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^alle Serveranlagen den Status "([^"]*)" anzeigen$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ein Server den Status "([^"]*)" anzeigt$/, function (arg1) {
        // Wriggte code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich auf die Serveranlage "([^"]*)" klicke$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine alternative Funkstelle auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^alle Funkstellenanzeigen der Schaltflächen den Status "([^"]*)" anzeigen$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine Funkstellenanzeige der Schaltflächen den Status "([^"]*)" anzeigt$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich einen ungültigen Kanal auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich eine Mehrkanalschaltfläche anklicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich einen auf diesen Kanal aufgeschalteten Arbeitsplatz auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich einen gültigen Kanal auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich auf die MHAN einer nicht aktiven Schaltfläche klicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich einen Kanal auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich eine aktive Standardschaltfläche anklicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich eine inaktive Standardschaltfläche anklicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });
    this.When(/^ich auf "([^"]*)" klicke$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine weitere Standardschaltflächen aufschalte$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine Standardschaltflächen aufschalte$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^alle Geräte den Status "([^"]*)" anzeigen$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich Gruppenschaltung aktiviere$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^die inaktive Funkstelle "([^"]*)" auswähle$/, function (station_id) {
        widgets.content.setFunkstation(station_id);
    });

    this.When(/^eine Liste mit allen Arbeitsplatzgeräten mit Status wird angezeigt$/, function () {
        devices = widgets.header.getStateDevices();
    });

    this.When(/^alle Serveranlagen mit ihrem Status angezeigt werden$/, function () {
        widgets.header.stateServer();
    });


    this.Then(/^ist der Status der Schaltfläche "([^"]*)"$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^sind die in der Konfiguartion derfinierten Standardeinstellungen wiederhergestellt$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ist der Status aller Schaltflächen "([^"]*)"$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^sehe ich den ausgewählten Kanal in der Mehrkanalschaltfläche$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^kann ich bei der Kommunikation mithören$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^sehe ich die neue Kanalnummer in der Mehrkanalschaltfläche$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^die bestehende Aufschaltung bleibt$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^dann wird die Kanalnummer nicht geändert$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ist keine Schaltfläche aktiv$/, function () {
        expect(widgets.content.getAllActivePanel()).toBe(0);
    });

    this.Then(/^wird die Schaltfläche Zeile "([^"]*)", Spalte "([^"]*)" auf die Funkstelle "([^"]*)" umgeschaltet$/, function (row, column,station_id) {
        var activeStation = widgets.content.getActiveFunkstation(row,column);
        expect(activeStation).toContain(station_id);
    });

    this.Then(/^werden alle Funkstellen mit Status "([^"]*)" angezeigt$/, function (state) {
        for (const element of funkPanel.value) {
            var message = browser.elementIdText(element.ELEMENT).value;
            expect(message).toContain(state);
        }
        widgets.content.setAllPanelInactive();
    });

    this.Then(/^ist diese Funkstelle nicht betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ist die Schaltfläche Zeile "([^"]*)", Spalte "([^"]*)" aktiviert$/, function (row,column) {
        expect(widgets.content.isPanelActive(row,column)).toEqual(true);
    });

    this.Then(/^ist die Schaltfläche Zeile "([^"]*)", Spalte "([^"]*)" nicht aufgeschaltet$/, function (row,column) {
        expect(widgets.content.isPanelActive(row,column)).toEqual(false);
    });

    this.Then(/^wird die ATIS Kennung in der Schaltfläche angezeigt$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^wird die ATIS Kennung nicht in der Schaltfläche angezeigt$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^kann ich nur eine Schaltfläche aktivieren$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^zeigt dies der Button Gleichwellenanlage in der Schlatfläche an$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });
    this.Then(/^dann wird auf diese Funkstelle umgeschaltet$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^der Status zeigt "([^"]*)"$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^wird die Serveranlage umgeschaltet von "([^"]*)" auf "([^"]*)"$/, function (arg1, arg2) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^hat der aktuelle Server "([^"]*)" den Status der DUE "([^"]*)" und RDF "([^"]*)"$/, function (arg1, arg2, arg3) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^zeigen alle Geräte den Status "([^"]*)", d.h. sie sind betriebsbereit$/, function (state) {
        var devices = widgets.header.getStateDevices();
        for (const element of devices.value) {
            var message = browser.elementIdText(element.ELEMENT).value;
            expect(message).toContain("OK");
        }
    });

    this.Then(/^dann sind nicht alle Server betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^kann ich in den nächsten "([^"]*)" Sekunden keine Kommunikation aufschalten$/, function (arg1) {
        expect(widgets.header.checkIfDisplayBlocked()).toBe(true);
        while (widgets.header.checkIfDisplayBlocked()){
            // wait for unblocked display
        }
       expect(widgets.header.checkIfDisplayBlocked()).toBe(false);
    });

    this.Then(/^sind nicht alle Arbeitsplatzgeräte betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^sehe ich die Liste der letzten "([^"]*)" Anrufe$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ändert sich die Farbe der Navigationsleiste in "([^"]*)"$/, function (color) {
        var newColor = widgets.content.getHeaderHexColor();
        expect(newColor).toEqual(color);
      // browser.close();

    });

    this.Then(/^die neue Kanalnummer wird in der Mehrkanalschaltfläche angezeigt$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^kann ich weitere Schaltflächen aktivieren$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^stellt sich die zuletzt in diesem Modus bestehende Schaltstellung wieder her$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^sind "([^"]*)" Schaltflächen aktiv$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Given(/^todo$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });
}
