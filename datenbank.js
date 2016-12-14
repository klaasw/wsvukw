'use strict';
/* Modul zur Herstellung der Verbindung zur Mongo Datenbank
 * In Bearbeitung....
 *
 * @Author: Klaas Wuellner
 *
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const cfg = require('./cfg.js');
const log = require('./log.js');

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
		//exports.verbindeDatenbank( function(){
		// Insert a single document
		//	schreibeInDb2(collection, selector, inhalt)
		//})
	}
	else {
		if (verbundenMitPrimary === true && schreibeLokal === true) {
			schreibeInDb2(collection, selector, inhalt);
		}
		else {
			schreibeInDb2(collection, selector, inhalt);
		}
	}
};


//finde Dokumente
exports.findeElement = function (collection, element, callback) {
	if (dbVerbindung === undefined) {
		// exports.verbindeDatenbank( function(){
		// Insert a single document
		//	findeElement2(collection, element, function(doc){
		//	    callback(doc)
		//  })
		// })
	}
	else {
		findeElement2(collection, element, function (doc) {
			callback(doc);
		});
	}
};


function findeElement2(collection, element, callback) {
	const tmp = dbVerbindung.collection(collection);
	let selector = {};
	log.debug(FILENAME + ' Funktion: findeElement2, element: ' + JSON.stringify(element));

	if (element !== undefined) {
		selector = element;
	}


	tmp.find(selector).toArray(function (err, docs) {
		assert.equal(err, null);
		log.debug(FILENAME + ' Funktion: findeElement2 aus DB gelesen');
		callback(docs);
	});
}

// tatsächlich in DB schreiben, Ausführung als Upsert
function schreibeInDb2(collection, selector, inhalt) {
	log.debug('TEST in DB ' + collection + ' -- ' + selector + ' -- ' + inhalt);

	const tmp = dbVerbindung.collection(collection);
	tmp.updateOne(selector, inhalt, {upsert: true, w: 1}).then(function (result) {
		assert.equal(1, result.result.n);
		log.debug(FILENAME + ' Funktion: schreibeInDb2 in DB geschrieben');
	});

	/*
	 // Insert a single document
	 dbVerbindung.collection(collection).insertOne(element, function(err, r) {
	 assert.equal(null, err);
	 assert.equal(1, r.insertedCount);
	 })
	 */
}


// Verbindung zur DB aufbauen. Dies wird beim ersten Aufruf von finde oder schreibe aufgerufen
exports.verbindeDatenbank = function (aktion) {
	log.debug(url);
	MongoClient.connect(url, {
		connectTimeoutMS: 2000,
		socketTimeoutMS: 2000
	}, function (err, db) {

		if (err) {
			log.error(err);
		}

		assert.equal(null, err);
		log.debug(FILENAME + err);
		log.info(FILENAME + ' Funktion: verbindeDatenbank Verbindung erfolgreich hergestellt');
		log.debug(FILENAME + ' Funktion: verbindeDatenbank' + JSON.stringify(db.topology.isMasterDoc));
		log.debug(db.topology.isMasterDoc.primary);

		dbVerbindung = db;
		pruefeLokaleVerbindung(dbVerbindung.topology.isMasterDoc.primary);

		if (err) throw err;

		if (typeof aktion === 'function') {
			aktion();
		}

		log.debug(FILENAME + db.topology);

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
