'use strict';
/* Modul zur Benutzerverwaltung und Bereitstellung von REST Services
 *
 *
 * @Author: Klaas Wuellner
 * @Create: Juli 2016
 */

const express = require('express');
const router  = express.Router();
const util    = require('util');
const tools   = require('../tools.js');

const cfg = require('../cfg.js');
const db  = require('../datenbank.js');

const log      = require('../log.js'); // Modul fuer verbessertes Logging
const FILENAME = __filename.slice(__dirname.length + 1);

router.get('/zeigeWindowsBenutzer/selectip', function (req, res) {
	const remoteAddress = tools.filterIP(req._remoteAddress);
	db.findeElement('windowsBenutzer', {ip: remoteAddress}, function (doc) {
		res.send(doc[0]);
	})
});

router.get('/zeigeWindowsBenutzer', function (req, res) {
	const arbeitsplaetze = {};
	db.findeElement('windowsBenutzer', {}, function (doc) {
		for (const ap of doc) {
			arbeitsplaetze[ap._id] = ap
		}
		res.send(arbeitsplaetze)
	})
});

router.put('/schreibeWindowsBenutzer', function (req, res) {
	log.debug(FILENAME + ' /schreibeWindowsBenutzer Benutzer: ' + JSON.stringify(req.body));

	const schreibeLokal   = false; // es wird auf jeden Fall in DB geschrieben
	const benutzer        = req.body;
	let schreibeParameter = {};
	log.info(benutzer);

	if (benutzer.angemeldet === true) {
		schreibeParameter = {
			$set: {
				_id:         benutzer.ip,
				user:       benutzer.user.toLowerCase(),
				loginZeit:  new Date(),
				angemeldet: benutzer.angemeldet
			}
		}
	}
	if (benutzer.angemeldet === false) {
		schreibeParameter = {
			$set: {
				_id:         benutzer.ip,
				user:       benutzer.user.toLowerCase(),
				logoutZeit: new Date(),
				angemeldet: benutzer.angemeldet
			}
		}
	}

	const benutzerId = {'_id': benutzer.ip};

	// db.schreibeInDb('windowsBenutzer', benutzerId, schreibeParameter, schreibeLokal);
	res.send({message: 'Benutzer hinzugefuegt oder geaendert'});
});

router.post('/schreibeBenutzer', function (req, res) {
	log.debug(FILENAME + ' /schreibeBenutzer Benutzer: ' + JSON.stringify(req.body));

	const benutzer = req.body;

	if (typeof benutzer._id == 'string') {

		if (typeof benutzer.einzel == 'string') {
			benutzer.einzel = (benutzer.einzel === 'true');
		}

		if (typeof benutzer.angemeldet == 'string') {
			benutzer.angemeldet = (benutzer.angemeldet === 'true');
		}
		else {
			benutzer.angemeldet = true;
		}

		const benutzerId        = {'_id': benutzer._id};
		const schreibeParameter = {
			$set: benutzer
		};
		db.schreibeInDb('windowsBenutzer', benutzerId, schreibeParameter, false);
		res.send({message: 'Benutzer erfolgreich gespeichert.'});
	}
	else {
		res.status('500').send({error: 'Benutzer wurde nicht gespeichert.'});
	}
});

module.exports = router;
