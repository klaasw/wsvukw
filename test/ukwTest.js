/**
 * Created by rwild on 12.01.2017.
 */

var expect    = require("chai").expect;
var assert = require('assert');
const ukw = require('../ukw.js');


describe("Auswertung/Weiterleitung der SIP Meldungen vom RFD", function() {
    it("prüfe Erreichbarkeit des RFD WebServices", function() {
        var rfdWS = ukw.pruefeRfdWS();
        expect(ukw.pruefeRfdWS()).to.be.true;
    });


    it("sende SIP Nachricht", function() {
        var res = ukw.sendeSipNachricht("OK", function (result, error) {
            if (result == 'OK') {
                return 'Abgesendet';
            }
            else {
                return 'Fehler';
            }
            });

        expect(res).equals('Abgesendet');
    });


});