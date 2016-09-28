/* Modul zur Benutzerverwaltung und Bereitstellung von REST Services
*
*
* @Author: Klaas Wuellner
* @Create: Juli 2016
*/


var express = require('express');
var router = express.Router();
var util = require('util');


var cfg = require('../cfg.js'); //

var db = require('../datenbank.js')

var log = require('../log.js'); // Modul fuer verbessertes Logging
FILENAME = __filename.slice(__dirname.length + 1);



/* Erster Test */
router.get('/zeigeWindowsBenutzer', function (req, res) {


    db.findeElement('windowsBenutzer', {}, function(doc){
        res.send(doc)
    })
});

// englische Bezeichnung nicht mehr verwenden
//router.put('/addWindowsUser', function(req, res){
//	log.debug(FILENAME + ' /addWindowsUser Benutzer: ' + JSON.stringify(req.body))
//	var schreibeLokal = false // es wird auf jeden Fall in DB geschrieben
//	var benutzer = req.body
//	benutzer.loginZeit = new Date().toJSON()
//
//
//	var benutzerId = {'_id':benutzer.ip}
//    console.log(benutzer)
//	db.schreibeInDb('windowsBenutzer', benutzerId, benutzer, schreibeLokal);
//	res.send({ message: 'Benutzer hinzugefuegt oder geaendert' });
//})


router.put('/schreibeWindowsBenutzer', function(req, res){
	log.debug(FILENAME + ' /schreibeWindowsBenutzer Benutzer: ' + JSON.stringify(req.body))

    var schreibeLokal = false // es wird auf jeden Fall in DB geschrieben
	var benutzer = req.body
    var schreibeParameter = {}

    if (benutzer.angemeldet === true) {
        schreibeParameter = {
            $set: {
                ip: benutzer.ip,
                user: benutzer.user,
                loginZeit : new Date(),
                angemeldet : benutzer.angemeldet
            }
        }
    }
    if (benutzer.angemeldet === false) {
        schreibeParameter = {
            $set: {
                ip: benutzer.ip,
                user: benutzer.user,
                logoutZeit : new Date(),
                angemeldet : benutzer.angemeldet
            }
        }
    }

	var benutzerId = {'_id':benutzer.ip}

	db.schreibeInDb('windowsBenutzer', benutzerId, schreibeParameter, schreibeLokal);
	res.send({ message: 'Benutzer hinzugefuegt oder geaendert' });
})





module.exports = router;
