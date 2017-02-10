/**
 * Created by rwild on 02.02.2017.
 */

'use strict';

module.exports = function() {

    this.Given(/^ist der Arbeitsplatz "([^"]*)" NvD$/, function (url) {
        widgets.open.openSite(url);
    });

    this.Given(/^ "([^"]*)" ist aktiviert$/, function () {
        widgets.header.setSchaltung(arg1);
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


    this.When(/^ich auf die Standardschaltfläche klicke$/, function () {
        //widgets.content.clickOnSchaltfläche(11);
        return 'pending';
    });

    this.When(/^einen Kanal auswähle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine Mehrkanalschaltfläche anklicke$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ein Teilnehmer ohne ATIS Kennung eine Nachricht sendet$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ein Teilnehmer mit ATIS Kennung eine Nachricht sendet$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
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
                widgets.header.clickFarbschema();
                break;
            case "Arbeitsplatzgeräte":
                widgets.header.clickArbeitsplatzgeraete();
                break;
            default:
                console.log('no match');
        }
    });

    this.When(/^ich von Einzelschaltung zu Gruppenschaltung und zurück wechsle$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^eine Standardschaltfläche aktiviere$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.When(/^ich das Design "([^"]*)" auswähle$/, function (arg1) {
        widgets.header.selectFarbschema(arg1);
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

    this.When(/^eine Liste mit allen Arbeitsplatzgeräten mit Status wird angezeigt$/, function () {
        widgets.header.stateArbeitsplatzgerate();
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

    this.Then(/^sind alle Funkstellen betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ist diese Funkstelle nicht betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^ist die Schaltfläche "([^"]*)" aktiviert$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
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

    this.Then(/^sind alle Anlagen betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^zeigen alle Geräte den Status "([^"]*)", d.h. sie sind betriebsbereit$/, function (state) {
        var app_state = widgets.header.stateArbeitsplatzgerate();
        for (var i in app_state){
            expect(app_state[i]).toEqual("OK");
            i++
        };
    });

    this.Then(/^dann sind nicht alle Server betriebsbereit$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });

    this.Then(/^kann ich in den nächsten "([^"]*)" Sekunden keine Kommunikation aufschalten$/, function (arg1) {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
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
        widgets.header.clickFarbschema();
        widgets.header.selectFarbschema("Standard");

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