'use strict';
/* Modul zur Auswertung und Weiterleitung der SIP Meldungen vom RFD
 *
 *
 *
 * @Author: Klaas Wuellner
 */


//TODO: in xml2js attrkey: 'attribute' aendern statt $ Zeichen. Dies muss aber in allen Modulen berücksichtigt werden.
// Uebergangsweise Ersaetzen wo in Datenbank gelesen und geschrieben wird.

const JsSIP   = require('jssip'); //Javascript SIP Uaser Agent
const request = require('request'); //Modul zu Abfrage von WebServices
const xml2js  = require('xml2js'); // zum Konvertieren von XML zu JS
const parser  = new xml2js.Parser({explicitRoot: true});// Parserkonfiguration
const probe   = require('pmx').probe(); //Modul zum Monitoren von Leistungsdaten

const log    = require('./log.js');
const cfg    = require('./cfg.js');
const socket = require('./socket.js');
const db     = require('./datenbank.js');
const tools  = require('./tools.js');

const FILENAME = __filename.slice(__dirname.length + 1);

const meterSip = probe.meter({
	name      : 'SIP Messages/sek',
	samples   : 1  // This is per second. To get per min set this value to 60
});

/* TODO:
 *  - Ungueltige Nutzer abfangen
 *  - Timeout oder Zustand der Server darstellen und Bedienung verhindern
 *  - Mithoeren darstellen
 *  - Freigeben
 *  - Kanalwahl
 *  - RFD Server in UKW und index.js (Topologie) generalisieren
 *
 */

/*
 zum Testen
 */
//var Intervall=setInterval(function() {sendeWebSocketNachricht()},1000)

/**
 * schreibe Zustandsmeldungen in zustandKomponenten
 * @param {Object} Nachricht - {"FSTSTATUS":{"$":{"id":"1-H-RFD-WEDRAD-FKHK-1","state":"0","connectState":"OK","channel":"-1"}}}
 */
function schreibeZustand(Nachricht) {
	if (Nachricht.hasOwnProperty('FSTSTATUS')) {
		const schreibeLokal = true; //es wird nur geschrieben wenn die aktuelle Instanz und Mongo Primary in einem VTR sind
		let zustand;

		//entfernen da dieser sonst den Kanal im DUE wieder mit -1 ueberschreibt
		if (Nachricht.FSTSTATUS.$.channel == '-1') {
			zustand = {
				$set:         {
					letzteMeldung:         new Date(),
					'status.connectState': Nachricht.FSTSTATUS.$.connectState,
					'status.state':        Nachricht.FSTSTATUS.$.state,
				},
				$setOnInsert: {
					'status.id': Nachricht.FSTSTATUS.$.id
				}
			}
		}
		else {
			zustand = {
				$set:         {
					letzteMeldung:         new Date(),
					'status.connectState': Nachricht.FSTSTATUS.$.connectState,
					'status.state':        Nachricht.FSTSTATUS.$.state,
					'status.channel':      Nachricht.FSTSTATUS.$.channel
				},
				$setOnInsert: {
					'status.id': Nachricht.FSTSTATUS.$.id
				}
			}
		}

		//console.log(Nachricht.FSTSTATUS.$.id)
		const selector = {'_id': Nachricht.FSTSTATUS.$.id};

		db.schreibeInDb('zustandKomponenten', selector, zustand, schreibeLokal);
	}
	else {
		//nichts machen
	}
}


// Erstelle SIP User-Agent var ua. Hier mit Konfiguration DUE als Empfänger für die Statusnachrichten vom RFD
//Die Übernahme aus der cfg funktioniert in der Produktivumgebung nicht. Callback?
const ua = new JsSIP.UA(cfg.jsSipConfiguration_DUE);
ua.start();


/**
 * Register callbacks to desired message event
 * @type {Object} eventHandlers
 * @type {function} eventHandlers.succeeded
 * @type {function} eventHandlers.failed
 */
const eventHandlers = {
	succeeded(e) {
		log.debug('SIP-Nachricht gesendet.')
	},
	failed(e) {
		log.error('SIP-Nachricht NICHT gesendet, Details: ' + require('util').inspect(e));
	}
};

const options = {
	eventHandlers
};

//SIP User Agent Ereignisse
ua.on('connected', function (e) {
	log.debug(FILENAME + ' Funktion: connected mit SIP-Server: ' + cfg.jsSipConfiguration_DUE.uri)
	db.schreibeZustand({dienst: 'SIP-Server', status: {URL: cfg.jsSipConfiguration_DUE.uri, Status: 'WARN', StatusMsg: 'nur connected'}})
});

ua.on('connecting', function (e) {
	log.debug(FILENAME + ' Funktion connecting zu SIP-Server: ' + cfg.jsSipConfiguration_DUE.uri)
});

ua.on('registered', function (e) {
	log.debug(FILENAME + ' Funktion: registered auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri);
	db.schreibeZustand({dienst: 'SIP-Server', status: {URL: cfg.jsSipConfiguration_DUE.uri,
	                                                       Status: 'OK',
																												 StatusMsg: 'connected und registriert'}})
	// sendeNachricht('Bin jetzt Registriert');
	// anruf();
});

ua.on('registrationFailed', function (e) {
	log.error(FILENAME + ' Funktion: registrationFailed auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri)
	db.schreibeZustand({dienst: 'SIP-Server', status: {URL: cfg.jsSipConfiguration_DUE.uri,
																												 Status: 'Error',
																												 StatusMsg: 'registrationFailed'}})
});


ua.on('disconnected', function (e) {
	log.debug(FILENAME + ' Funktion: Getrennt vom SIP-Server ' + cfg.jsSipConfiguration_DUE.uri)
	db.schreibeZustand({dienst: 'SIP-Server', status: {URL: cfg.jsSipConfiguration_DUE.uri,
																												 Status: 'Error',
																												 StatusMsg: 'disconnected'}})
});

ua.on('newMessage', function (e) {
	meterSip.mark();
	log.info(FILENAME + ' Funktion: newSipMessage Richtung: ' + e.message.direction + ' Inhalt: ' + e.message.request.body);
	//log.debug('SIP Body: '+e.message.request.body)
	//Sende WebSocket Nachricht beim Senden und Empfangen. Richtung noch einbauen
	parser.parseString(e.message.request.body, function (err, result) {
		if (err == null) {
			log.debug(FILENAME + ' Funktion: newMessage sip parse result: ' + JSON.stringify(result));
			//setze Zeitstempel in Status Meldungen vom RFD
			if ('FSTSTATUS' in result) {
				result.FSTSTATUS.letzteMeldung = new Date();
			}
			socket.sendeWebSocketNachricht(result);
			db.schreibeZustand(result)
		}
		else {
			log.error(FILENAME + ' Funktion: newMessage keine XML in SIP Nachricht Error=' + err + ' Nachricht=' + e.message.request.body)
		}
	}); //Parser Ende
});


// Erstelle SIP User-Agent var ua. Hier mit Konfiguration RFD Mock als SENDER für die Test Statusnachrichten zum DUE
const mockRFD = new JsSIP.UA(cfg.jsSipConfiguration_mockRFD);
mockRFD.start();

// GET-Aufruf fuer SIP-Message: http://10.22.30.1:3000/mockmessage?messageText=%3CFSTSTATUS+id%3D%221-H-RFD-BHVVTA-FKEK-1%22+state%3D%220%22+channel%3D%22-1%22%2F%3E

/**
 * SIP Test Aufrufe
 * @param {string} text
 * @param {function} callback
 */
exports.sendeSipNachricht = function (text, callback) {
	const SIPreceiver = cfg.jsSipConfiguration_DUE.uri.replace('sip:', '');
	log.debug('sendeSipNachricht an ' + SIPreceiver + ' : ' + text);
	try {
		mockRFD.sendMessage(SIPreceiver, text, options);
		callback('OK', text);
	}
	catch (e) {
		log.error('unable to call mockRFD.sendMessage()');
		//log.error(JSON.stringify(e));
		callback('ERROR', e);
	}
};

/**
 * TODO: ungenutzte Funktion löschen?
 */
exports.anruf = function () {
	ua.call(cfg.jsSipConfiguration_mockRFD.testReceiverCall)
};

/**
 * SIP User Agent Ereignisse
 */
mockRFD.on('connected', function (e) {
	log.debug(FILENAME + ' Funktion: mockRFD Verbunden mit SIP-Server ' + cfg.jsSipConfiguration_mockRFD.uri)
});

mockRFD.on('connecting', function (e) {
	log.debug(FILENAME + ' Funktion: mockRFD Verbinde zu SIP-Server... ' + cfg.jsSipConfiguration_mockRFD.uri)
});

mockRFD.on('registered', function (e) {
	log.debug(FILENAME + ' Funktion: mockRFD Registriert auf SIP-Server ' + cfg.jsSipConfiguration_mockRFD.uri);
	//sendeNachricht('Bin jetzt Registriert')
	//anruf()
});
