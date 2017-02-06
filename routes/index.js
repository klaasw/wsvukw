'use strict';

const express = require('express');
const router  = express.Router();
const util    = require('util');
const files   = require('fs'); // Zugriff auf das Dateisystem
const tools   = require('../tools.js');

const cfg = require('../cfg.js');
const log = require('../log.js'); // Modul fuer verbessertes Logging
const rfd = require('../rfd.js');

const db = require('../datenbank.js');
// db.verbindeDatenbank();

const FILENAME = __filename.slice(__dirname.length + 1);

const ukw = require('../ukw.js');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.redirect('/ukw');
});

/* GET UKW uebersicht */
router.get('/overview', function (req, res) {
	const Funkstellen = rfd.getFunkstellen();
	if (Funkstellen.length === 0) {
		log.error('Topologie nicht eingelesen, wird aber jetzt gebraucht, mit Fehler antworten!');
		res.status(404)        // HTTP status 404: NotFound
			.send('ukwKonfig konnte nicht geladen werden.');
	}
	else {
		res.render('ukwOverview', {
			'funkstellen': Funkstellen
		});
	}
});

/* GET Zuordnung */
router.get('/zuordnung', function (req, res) {
	db.findeApNachIp(req.ip, function (benutzer) {
		log.debug('Benutzer: ' + benutzer);
		if (benutzer) {
			log.info(FILENAME + ' Funktion router.get /zuordnung Arbeitsplatz gefunden! IP: ' + tools.filterIP(req.ip));

			// TODO: ueberpruefen, ob hier das Richtige uebergeben wird:
			erstelleKonfigFuerLotsenKanal(benutzer, false, function (konfig) {
				//Uebergebe Funkstellen ID an Jade Template
				log.info(FILENAME + ' Funktion router.get /zuordnung Konfig: ' + konfig);
				res.render('zuordnung', {
					'gesamteKonfig': konfig
				});
			});
		}
	});
});

/* GET UKW Test */
router.get('/testen', function (req, res) {
	res.render('testen', {
		'funkstellen': rfd.getFunkstellen()
	});
});

/* GET UKW Dokumentation */
router.get('/dokumentation', function (req, res) {
	if (req.query.dokument) {
		res.render('technik/dokumentation', {datei: req.query.dokument});
	}
	else {
		res.render('technik/dokumentation');
	}

});

/* GET UKW Status */
router.get('/status', function (req, res) {
	res.render('technik/status', {datei: req.query.dokument});

});


/* GET UKW Display */
router.get('/ukw', function (req, res) {
	const clientIP = tools.filterIP(req.ip);
	log.debug('Benutzer IP: ' + clientIP);
	db.findeApNachIp(clientIP, function (benutzer) {
		log.debug('ukw - Ermittelter Benutzer: ' + benutzer);
		if (benutzer) {
			log.debug(FILENAME + ' *** Arbeitsplatz gefunden! IP: ' + tools.filterIP(req.ip));
			erstelleKonfigFurAp(benutzer, function (konfig, errString) {
				if (konfig == 'Fehler') {
					res.render('error', {
						message: 'keine Konfiguration zu Arbeitsplatz: ' + benutzer + ' Fehler: ' + errString,
						error:   {
							status: 'kein'
						}
					});
				}
				else {
					//Uebergebe Funkstellen ID an Pug Template
					log.info('ukw - konfigfuerAP: an Pug Template uebergeben');
					//ukwDisplay --> zum Testen eines neuen Layouts
					res.render('entwicklung/ukwDisplayTest', {
						log,  // logging auch im Jade-Template moeglich!
						'gesamteKonfig': konfig

					}); //res send ende
				}
			}); //erstelleKonfigFurAp Ende
		} //if Ende

		//kein Benutzer zu IP gefunden
		else {
			res.render('error', {
				message: 'keine Benutzer konfiguriert zu IP: ' + clientIP,
				error:   {
					status: 'kein'
				}
			});
		}
	});
}); //router Ende

/* GET UKW Display */
router.get('/ukwAlt', function (req, res) {
	const clientIP = tools.filterIP(req.ip);
	log.debug('Benutzer IP: ' + clientIP);
	db.findeApNachIp(clientIP, function (benutzer) {
		log.debug('ukw - Ermittelter Benutzer: ' + benutzer);
		if (benutzer) {
			log.debug(FILENAME + ' *** Arbeitsplatz gefunden! IP: ' + tools.filterIP(req.ip));
			erstelleKonfigFurAp(benutzer, function (konfig, errString) {
				if (konfig == 'Fehler') {
					res.render('error', {
						message: 'keine Konfiguration zu Arbeitsplatz: ' + benutzer + ' Fehler: ' + errString,
						error:   {
							status: 'kein'
						}
					});
				}
				else {
					//Uebergebe Funkstellen ID an Pug Template
					log.info('ukw - konfigfuerAP: an Pug Template uebergeben');
					//ukwDisplay --> zum Testen eines neuen Layouts
					res.render('ukwDisplay', {
						log,  // logging auch im Jade-Template moeglich!
						'gesamteKonfig': konfig

					}); //res send ende
				}
			}); //erstelleKonfigFurAp Ende
		} //if Ende

		//kein Benutzer zu IP gefunden
		else {
			res.render('error', {
				message: 'keine Benutzer konfiguriert zu IP: ' + clientIP,
				error:   {
					status: 'kein'
				}
			});
		}
	});
}); //router Ende


/* GET UKW Display */
router.get('/ukwTestWue', function (req, res) {
	const clientIP = tools.filterIP(req.ip);
	log.debug('Benutzer IP: ' + clientIP);
	db.findeApNachIp(clientIP, function (benutzer) {
		log.debug('ukw - Ermittelter Benutzer: ' + benutzer);
		if (benutzer) {
			log.debug(FILENAME + ' *** Arbeitsplatz gefunden! IP: ' + tools.filterIP(req.ip));
			erstelleKonfigFurAp(benutzer, function (konfig, errString) {
				if (konfig == 'Fehler') {
					res.render('error', {
						message: 'keine Konfiguration zu Arbeitsplatz: ' + benutzer + ' Fehler: ' + errString,
						error:   {
							status: 'kein'
						}
					});
				}
				else {
					//Uebergebe Funkstellen ID an Jade Template
					log.info('ukw - konfigfuerAP: an Jade Template uebergeben');
					//ukwDisplay --> zum Testen eines neuen Layouts
					res.render('entwicklung_wuellner/ukwDisplayTest', {
						log,  // logging auch im Jade-Template moeglich!
						'gesamteKonfig': konfig

					}); //res send ende
				}
			}); //erstelleKonfigFurAp Ende
		} //if Ende

		//kein Benutzer zu IP gefunden
		else {
			res.render('error', {
				message: 'keine Benutzer konfiguriert zu IP: ' + clientIP,
				error:   {
					status: 'kein'
				}
			});
		}
	});
}); //router Ende


/* GET UKW Konfiguration
 *
 * TODO wenn die Konfiguration noch nicht eingelesen ist in Funkstellen, dann warten bis verfuegbar, nach Timeout mit Fehler antworten, Fehlerhandling clientseitig
 * */
router.get('/ukwKonfig', function (req, res) {
	log.warn(FILENAME + ' Funktion: router get /ukwKonfig von IP: ' + tools.filterIP(req.ip), +'   IP-Parameter: ' + JSON.stringify(req.query));

	let Funkstellen = rfd.getFunkstellen();
	if (Funkstellen.length === 0) {
		log.error('Topologie nicht eingelesen, wird aber jetzt gebraucht, mit Fehler antworten!');
		res.status(404)        // HTTP status 404: NotFound
			.send('ukwKonfig konnte nicht geladen werden.');
	}
	else {
		if (typeof req.query.ip == 'string') { // /ukwKonfig mit Parameter z.B. ukwKonfig?ip=1.1.1.1
			db.findeApNachIp(req.query.ip, function (benutzer) {
				if (benutzer) {
					log.debug(FILENAME + ' Benutzer zu IP  = ' + benutzer + ' ' + req.query.ip);
					//res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
					erstelleKonfigFurAp(benutzer, function (Konfig) {
						res.send(Konfig);
					});
				}
				else {
					log.error(FILENAME + ' 1 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
					res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip);
				}
			});
			// }
		}

		// /ukwKonfig mit Parameter ?zuordnung=lotse
		if (typeof req.query.zuordnung == 'string' && req.query.zuordnung == 'lotse') {
			db.findeApNachIp(req.ip, function (benutzer) {
				if (benutzer) {
					if (req.query.standard == 'true') {
						erstelleKonfigFuerLotsenKanal(benutzer, 'true', function (Konfig) {
							res.send(Konfig);
						});
					}
					if (req.query.standard == 'false') {
						erstelleKonfigFuerLotsenKanal(benutzer, 'false', function (Konfig) {
							res.send(Konfig);
						});
					}
				}
			});
		}
		else { // ukwkonfig ohne parameter
			db.findeApNachIp(req.ip, function (benutzer) {
				if (benutzer) {
					log.debug(FILENAME + ' Funktion: router get /ukwKonfig ermittelter User: ' + benutzer);
					//res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
					// TODO: testen, ob hier das richtige passiert
					erstelleKonfigFurAp(benutzer, function (Konfig) {
						if (typeof benutzer != 'string') {
							benutzer = '';
						}
						if (typeof Konfig != 'object') {
							Konfig = {};
						}

						res.send({
							'Konfigdaten':  Konfig,
							'Arbeitsplatz': benutzer
						});
					});

				}
				else {
					log.error(FILENAME + ' 2 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
					res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip);
				}
			});
		}
	} // if(Funkstellen.length==0)

});//Router /ukwKonfig Ende

// TODO: ungenutzen code entfernen?
// router.get('/liesTopologie', function (req, res) {
// 	log.info(FILENAME + ' Topologie neu einlesen.');
// 	rfd.leseRfdTopologie(function () {
// 		res.send(rfd.Funkstellen);
// 	});
// });

router.get('/mockmessage', function (req, res) {
	//log.debug(FILENAME + ' mockmessage von IP: ' + tools.filterIP(req.ip) + ", message: "+ require('util').inspect( req) );
	const msgText = req.query.messageText;
	log.debug(FILENAME + ' mockmessage messageText: ' + msgText);
	ukw.sendeSipNachricht(msgText, function (result, error) {
		if (result == 'OK') {
			res.send('Abgesendet: ' + error.replace('<', '').replace('/>', ''));
		}
		else {
			res.send('Fehler: ' + error.prototype.message);
		}

	});

});

router.get('/arbeitsplaetze', function (req, res) {
	let arbeitsplaetze; // = require(cfg.configPath + '/users/arbeitsplaetze.json')
	files.readFile('config/users/arbeitsplaetze.json', 'utf8', function (err, data) {
		if (err) {
			log.error(err);
			res.status(404).send('Fehler beim Einlesen der Arbeitsplatzkonfiguration');
		}
		else {
			arbeitsplaetze = JSON.parse(data);
			log.debug(FILENAME + ' Funktion: /arbeitplaetze Arbeitplaetze geladen: ' + JSON.stringify(arbeitsplaetze));
			res.send(arbeitsplaetze);
		}
	});
});

router.get('/lieskonfig', function (req, res) {
	let configdata;
	const configfile = req.query.configfile;
	files.readFile('config/revier/' + configfile + '.json', 'utf8', function (err, data) {
		if (err) {
			log.error(err);
			res.status(404).send('Fehler beim Einlesen der Konfiguration ' + configfile + ' ' + err);
		}
		else {
			configdata = JSON.parse(data);
			log.debug(FILENAME + 'configfile: ' + JSON.stringify(configdata));
			res.send(configdata);
		}
	});
});


rfd.leseRfdTopologie(function () {
	log.debug("Topologie eingelesen.");
});

/**
 * Konfigurationsobjekt fuer den Arbeitsplatz erstellen.
 * Einlesen der Konfig.Dateien
 * TODO: Fehlermeldung und Errorhandling wenn keine Konfig vorliegt
 * @param {string} Ap
 * @param {function} callback
 */
function erstelleKonfigFurAp(Ap, callback) {

	//Bilde temporaeres Objekt um Funkstelle als Value hinzuzufuegen
	const Konfig = {
		FunkstellenReihe:    [],
		FunkstellenDetails:  {},
		ArbeitsplatzGeraete: {},
		MhanZuordnung:       {},
		IpConfig: {
			aktuellerServer: cfg.aktuellerServer,
			alternativeIPs: cfg.alternativeIPs
			},
		KanalListe:          []
	};

	log.debug(FILENAME + ' uebergebener Arbeitsplatz: ' + Ap);
	const rev_ap = Ap.split(' ');

	//1. Funkkstellen fuer Revier einlesen
	//Dateinamen noch durch Variable ersetzen
	const revieranteil = rev_ap[0];
	db.liesAusRESTService(revieranteil, function (response1) {
		log.debug(FILENAME + ' response1: ' + JSON.stringify(response1));
		if (typeof response1 === 'string' && response1.indexOf('Fehler') > -1) {
			callback('Fehler', response1);
		}
		else {
			const fstReihe = response1;
			//Durch JA ueber Buttons iterieren
			for (const button in fstReihe) {
				log.debug(FILENAME + ' Button: ' + button + '  ' + fstReihe[button]);
				//Durch Funkstelln in Buttons iterien
				for (let t = 0; t < fstReihe[button].length; t++) {

					//Funkstellendetails schreiben
					if (fstReihe[button][t] != '') {
						Konfig.FunkstellenDetails[fstReihe[button][t]] = rfd.findeFstNachId(fstReihe[button][t]);

						//Kanalnummern in Array schreiben. Dient zur dynamischen Befüllung im MKA Dialog
						const kanalNummer = Konfig.FunkstellenDetails[fstReihe[button][t]].channel;
						if (kanalNummer != undefined && kanalNummer !== null) {
							Konfig.KanalListe.push(kanalNummer);
						}
					}
				}
			}
			//KanalListe sortieren und Doppel entfernen. Hilfsfunktionen siehe weiter unten.
			Konfig.KanalListe.sort(tools.vergleicheZahlen);
			Konfig.KanalListe       = tools.entferneDoppel(Konfig.KanalListe);
			Konfig.FunkstellenReihe = fstReihe;

			//2. Geraete fuer Arbeitsplatz einlesen
			//Dateinamen noch durch Variable ersetzen
			// log.debug(' -- 1');
			db.liesAusRESTService(rev_ap[0] + '_' + rev_ap[1], function (response2) {
				if (typeof response2 === 'string' && response2.indexOf('Fehler') > -1) {
					callback('Fehler', response2);
				}
				else {
					// log.debug(' -- 2');
					Konfig.ArbeitsplatzGeraete = response2;
					if (response2.hasOwnProperty('Funkstellen')) {
						Konfig.FunkstellenReihe = response2.Funkstellen;
					}

					//3. MHAN Zuordnung fuer Arbeitsplatz einlesen
					//Dateinamen noch durch Variable ersetzen
					db.liesAusRESTService(rev_ap[0] + '_' + rev_ap[1] + '_mhan_zuordnung', function (response3) {
						if (typeof response3 === 'string' && response3.indexOf('Fehler') > -1) {
							callback('Fehler', response3);
						}
						else {
							// log.debug(' -- 3');
							Konfig.MhanZuordnung = response3;
							//----------------------------------------------------------------------------------------
							//Hier die Callback fuer die Res.send einbauen, die die Rueckmeldung aus Konfig benoetigt

							callback(Konfig);
						}//Else Ende
					});
				}//Else Ende
			});
		}//Else Ende
	});
} //Funktion Ende

/**
 *
 * @param {string} Ap
 * @param {boolean} standard
 * @param {function} callback
 */
function erstelleKonfigFuerLotsenKanal(Ap, standard, callback) {
	const Konfig = {
		FunkstellenReihe:   [],
		FunkstellenDetails: {},
		LotsenAp:           {},
		MhanZuordnung:      {},
		IpConfig:           cfg
	};

	log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal erhaltener Arbeitsplatz: ' + Ap);
	const rev_ap           = Ap.split(' ');
	const standardbenutzer = standard ? '' : '_benutzer';  // wenn standard == true, dann default Einstellungen laden, wenn false dann _benutzer Einstellungen laden

	//1. Funkkstellen fuer Revier einlesen
	//Dateinamen noch durch Variable ersetzen, hier zum Lesen der VTA fuer das Revier
	const revieranteil = rev_ap[0];
	db.liesAusRESTService(revieranteil, function (response) {
		const fstReihe = response;
		log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + revieranteil + ') gelesene Daten: ' + fstReihe);
		//Durch JA ueber Buttons iterieren
		for (const button in fstReihe) {
			log.debug(button + '  ' + fstReihe[button]);
			//Durch Funkstelln in Buttons iterien
			for (let t = 0; t < fstReihe[button].length; t++) {
				// TODO Funkstellendetails schreiben HIER MEHR ERKLAEREN
				Konfig.FunkstellenDetails[fstReihe[button][t]] = rfd.findeFstNachId(fstReihe[button][t]);
			}
		}

		//Alle LotsenAP einlesen
		//ueber alle Lotsendateien //JA_Lotse1.json usw. gehen und Inhalt in die Konfig schreiben

		let i            = 1;
		let weitereDatei = true;  //solange true bis keine weitere Datei vorliegt
		while (weitereDatei === true) {
			try {
				weitereDatei = files.statSync(cfg.configPath + rev_ap[0] + '_Lotse' + i + '.json').isFile();
				const tmp    = files.readFileSync(cfg.configPath + rev_ap[0] + '_Lotse' + i + standardbenutzer + '.json', 'utf8');
				log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal gelesene Daten: ' + util.inspect(tmp));
				Konfig.LotsenAp[rev_ap[0] + '_Lotse' + i] = JSON.parse(tmp);

			}
			catch (error) {
				//log.debug(error)
				log.debug(FILENAME + ' keine weitere Datei ' + cfg.configPath + rev_ap[0] + '_Lotse' + i + '.json');
				callback(Konfig);
				return;
			}
			i++; //pruefen ob noch benoetigt!
		} //While Ende
	});
} //Funktion Ende

module.exports = router;
