/**
 * Created by rwild on 12.01.2017.
 */


var expect    = require("chai").expect;
const app = require('../app.js');


describe("Prüfe Funktionen app.js", function() {
    it("Erreichbarkeit des Ports", function() {
        var port = app.normalizePort(123)

        expect(port).to.be.false;
    });
});