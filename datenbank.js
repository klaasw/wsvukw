'use strict';
/* Modul zur Herstellung der Verbindung zur Mongo Datenbank
 * In Bearbeitung....
 *
 * @Author: Klaas Wuellner
 *
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const util = require('util');

const cfg = require('./cfg.js');
const log = require('./log.js');
const request = require('request'); //Modul zu Abfrage von WebServices

const FILENAME = __filename.slice(__dirname.length + 1);

let dbVerbindung; //Zur Nutzung der Datenbank Verbindung. Verhindert dauerndes öffen und schließen
let verbundenMitPrimary;

// Connection URL
const user_auth = (cfg.auth ? cfg.auth_user + ':' + cfg.auth_pw + '@' : '');
const replicaSet = (cfg.replicaSet !== '' ? '&replicaSet=' + cfg.replicaSet : '');
const url = 'mongodb://' + user_auth + cfg.mongodb.join(',') + '/ukw?readPreference=nearest' + replicaSet;

//TODO: Prio 2 Verbindung zu unterschiedlichen Datenbanken herstellen. Damit WindowsBenutzer von ukw Datenbank entkoppelt sind
//vor dem Schreiben prüfen ob eine Verbindung besteht:
exports.schreibeInDb = function (collection, selector, inhalt, schreibeLokal) {
	if (dbVerbindung === undefined) {
        log.error("Datenbank ist noch nicht verbunden!!!");
	} else {
		if (verbundenMitPrimary === true && schreibeLokal === true) {
			schreibeInDb2(collection, selector, inhalt);
		} else {
			schreibeInDb2(collection, selector, inhalt);
		}
	}
};


//finde Dokumente
exports.findeElement = function (collection, element, callback) {
	if (dbVerbindung === undefined) {
		log.error("Datenbank ist noch nicht verbunden!!!");
	} else {
		findeElement2(collection, element, function (doc) {
			callback(doc);
		});
	}
};


function findeElement2(collection, element, callback) {
	const tmp = dbVerbindung.collection(collection);
	let selector = {};
	log.debug(FILENAME + ' Funktion: findeElement2, collection: '+ collection + ', element: ' + JSON.stringify(element));

	if (element !== undefined) {
		selector = element;
	}
	if (isNaN(selector)){
        tmp.find(selector).toArray(function (err, docs) {
            assert.equal(err, null);
            log.debug(FILENAME + ' Funktion: findeElement2 aus DB gelesen');
            callback(docs);
        });
	} else {
        collection.findOne({id:selector}, function(err, doc) {
            assert.equal(null, err);
            callback(doc);
        });
    }
}

// tatsächlich in DB schreiben, Ausführung als Upsert
function schreibeInDb2(collection, selector, inhalt) {
	log.debug('TEST in DB ' + collection + ' -- ' + selector + ' -- ' + inhalt);

	const tmp = dbVerbindung.collection(collection);
	tmp.updateOne(selector, inhalt, {upsert: true, w: 1}).then(function (result) {
		assert.equal(1, result.result.n);
		log.debug(FILENAME + ' Funktion: schreibeInDb2 in DB geschrieben');
	});
}


// Verbindung zur DB aufbauen. Dies wird beim ersten Aufruf von finde oder schreibe aufgerufen
exports.verbindeDatenbank = function (aktion) {
	log.debug(url);
	MongoClient.connect(url, {
		connectTimeoutMS: 2000,
		socketTimeoutMS: 2000
	}, function (err, db) {

		if (err) {
            log.error(FILENAME + ' Funktion: verbindeDatenbank. err: '+ util.inspect(err));
		}

		assert.equal(null, err);
		log.debug(FILENAME + ' Funktion: verbindeDatenbank. err: '+ util.inspect(err));
		log.debug(FILENAME + ' Funktion: verbindeDatenbank. Verbindung erfolgreich hergestellt:  topology: '+ db.topology +', primary: '+db.topology.isMasterDoc.primary+', isMasterDoc:' + JSON.stringify(db.topology.isMasterDoc));
		dbVerbindung = db;
		pruefeLokaleVerbindung(dbVerbindung.topology.isMasterDoc.primary);

		if (err) throw err;

		if (typeof aktion === 'function') {
			aktion();
		}
		//Ereignislister fuer Topologie Aenderungen im ReplicaSet
		db.topology.on('serverDescriptionChanged', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverDescriptionChanged');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('serverHeartbeatStarted', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatStarted');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('serverHeartbeatSucceeded', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatSucceeded');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('serverHeartbeatFailed', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatFailed');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('serverOpening', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverOpening');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('serverClosed', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverClosed');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('topologyOpening', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyOpening');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('topologyClosed', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyClosed');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
		});

		db.topology.on('topologyDescriptionChanged', function (event) {
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyDescriptionChanged');
			log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));

			if (event.newDescription.topologyType == 'ReplicaSetWithPrimary') {
				pruefeLokaleVerbindung(event.newDescription.servers[0].address);
			}
		});
	});
};



exports.findeApNachIp = function (ip, callback) {
    let Ap = '';

    //IPv6 Anteil aus Anfrage kuerzen
    const ipv6Ende = ip.lastIndexOf(':');
    if (ipv6Ende > -1) {
        ip = ip.slice(ipv6Ende + 1, ip.length);
    }

    // TODO: Aus DB auslesen, nicht mehr den Umweg über REST nehmen, weil so oft benutzt


    //var alle_Ap = require(cfg.configPath + '/users/arbeitsplaetze.json');
    log.debug(FILENAME + ' function findeNachIp: ' + util.inspect(ip));
    // TODO: auf Datenbank-Abfrage umstellen: erster Schritt REST-Service nutzen
    const url = 'http://' + cfg.cfgIPs.httpIP + ':' + cfg.port + '/benutzer/zeigeWindowsBenutzer';
    log.debug(FILENAME + ' function findeNachIp ' + url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //log.debug("body: " + body);
            const alle_Ap = JSON.parse(body);
            log.debug(FILENAME + ' function findeNachIp: ' + alle_Ap);

            if (alle_Ap.hasOwnProperty(ip)) {
                Ap = alle_Ap[ip].user;
                log.debug(FILENAME + ' function findeNachIp: ermittelter Benutzer: ' + JSON.stringify(Ap));
	            callback(Ap);
			} else {
				log.error(FILENAME + ' function findeNachIp: Benutzer NICHT gefunden zu IP: ' + ip);
				callback('');
			}
		} else {
			log.error('Fehler. ' + JSON.stringify(error));
		}
	});
};

// Auslesen der Arbeitsplatzkonfigurationen:
// Welche MHANs mit welchen Kanälen verbunden sind,
// welche Schaltflächen existieren in welchem Revier und Arbeitsplatz
// wie heissen die Arbeitsplatzgeräte in Kurzform (MHAN01 statt z.B. "1-H-RFD-WARVKZ-MHAN-11")
exports.liesAusRESTService = function (configfile, callback) {
    // require(cfg.configPath + configfile + '.json');
    log.debug('function liesAusRESTService ' + configfile);
    // TODO: auf Datenbank-Abfrage umstellen: erster Schritt REST-Service nutzen
    const url = 'http://' + cfg.cfgIPs.httpIP + ':' + cfg.port + '/lieskonfig?configfile=' + configfile;
    log.debug(' liesAusRESTService url=' + url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const antwortImBody = JSON.parse(body);
            log.debug(' liesAusRESTService response: ' + JSON.stringify(antwortImBody));
            callback(antwortImBody);
        } else {
            if (error) {
                log.error(' liesAusRESTService Fehler: ' + JSON.stringify(error));
                callback('Fehler');//TODO: hier Fehlerhandling wenn Service nicht erreichbar
            } else {
                log.error(' liesAusRESTService Fehler: ' + JSON.stringify(body));
                //log.error(" liesAusRESTService Fehler: " + JSON.stringify(response));
                callback(body);
            }
        }
    });
};


//Prueft ob der PRIMARY der Mongo-Datenbank und die Anwendung im selben VTR laufen und
//setzt die entsprechende Variable
function pruefeLokaleVerbindung(primaryServer) {
	//Hostnamen teilen um Standort zu vergleichen
	const ukwServer = cfg.aktuellerHostname.split('-');
	const primaryDbServer = primaryServer.split('-');

	//nur den Standort in Variable schreiben
	const ukwServerVTR = ukwServer[1];
	const primaryDbServerVTR = primaryDbServer[1];

	//Standortpruefung
	verbundenMitPrimary = (ukwServerVTR == primaryDbServerVTR);

	log.info(FILENAME + ' Funktion: pruefeLokaleVerbindung');
	log.debug(FILENAME + ' Funktion: pruefeLokaleVerbindung ukwServer=' + ukwServer + ' primaryDbServer=' + primaryDbServer + ' Ergebnis=' + verbundenMitPrimary);
}
