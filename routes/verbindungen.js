/* Modul zur Bereitstellung der Verbindungsdaten als REST Services
*
*
* @Author: Klaas Wuellner
* @Create: September 2016
*/


var express = require('express');
var router = express.Router();
var util = require('util');


var cfg = require('../cfg.js'); //

var db = require('../datenbank.js')

var log = require('../log.js'); // Modul fuer verbessertes Logging
FILENAME = __filename.slice(__dirname.length + 1);



/* liesVerbindungen aus Datenbank.
*  TODO: Einbindung von Abfrage Parametern
*
*
*/
router.get('/liesVerbindungen', function (req, res) {

    log.debug(FILENAME + ' /liesVerbindungen: ' + JSON.stringify(req.query))

    // variabel fuer die Abfrageparameter. Undefined lassen um ungueltige Abfragen an die Datenbank zu vermeiden
	var selector
	var aktiveVerbindungen

	if (req.query.revier) {
		var regex =  new RegExp (req.query.revier)
        selector = {ApID:{$regex: regex}}
	}

	if (req.query.arbeitsplatz) {
		selector = {'ApID':req.query.arbeitsplatz, 'zustand.aufgeschaltet' : true}
	}

	if (req.query.funkstelle) {
		selector = {'funkstelle':req.query.funkstelle}
	}

    //Selector erweitern wenn aktiveVerbindungen true oder false, sonst werden alle Verbindungen ausgegeben.
    if (req.query.aktiveVerbindungen == 'true') {
		//selector.zustand = {}
		selector['zustand.aufgeschaltet'] = true
	}
	if (req.query.aktiveVerbindungen == 'false') {
		//selector.zustand = {}
		selector['zustand.aufgeschaltet'] = false
	}


    if (selector != undefined) {
        db.findeElement('schaltZustaende', selector, function(doc){
                if (doc.length > 0){
                    res.send(doc)
                }
                else {
                	res.send('keine Verbindungen für Abfrageparameter:' + JSON.stringify(req.query))
                }

        })
    }
    else {
    	res.send('keine Verbindungen für Abfrageparameter:' + JSON.stringify(req.query) +
    		     ' gültige Abfragen sind: ?revier=Revierkürzel oder ?arbeitsplatz=Revierkürzel Leerzeichen Rolle oder ?funkstelle=Komponenten-ID'
    		)
    }
});




module.exports = router;
