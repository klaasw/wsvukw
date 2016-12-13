'use strict';
/* Modul zur Auswertung und Weiterleitung der SIP Meldungen vom RFD
 *
 *
 *
 * @Author: Klaas Wuellner
 */


//TODO: in xml2js attrkey: 'attribute' aendern statt $ Zeichen. Dies muss aber in allen Modulen berücksichtigt werden.
// Uebergangsweise Ersaetzen wo in Datenbank gelesen und geschrieben wird.

const JsSIP = require('jssip'); //Javascript SIP Uaser Agent
const request = require('request'); //Modul zu Abfrage von WebServices
const xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
const parser = new xml2js.Parser({explicitRoot: true});// Parserkonfiguration
const log = require('./log.js');

const cfg = require('./cfg.js');

const io = require('./socket.js');

const db = require('./datenbank.js'); // Module zur Verbindung zur Datenbank
db.verbindeDatenbank();

const FILENAME = __filename.slice(__dirname.length + 1);

/* TODO:
 *  - Ungueltige Nutzer abfangen
 *  - Timeout oder Zustand der Server darstellen und Bedienung verhindern
 *  - Mithoeren darstellen
 *  - Freigeben
 *  - Kanalwahl
 *  - RFD Server in UKW und index.js (Topologie) generalisieren
 *
 */



/*Funktion zur Erreichbarkeit des RFD WebServices
 *
 *
 *
 *
 */
exports.pruefeRfdWS = function () {
	//Pruefung lokaler VTR
	request(cfg.urlRFDWebservice, {timeout: 2000}, function (error, response, body) {

		if (!error && response.statusCode == 200) {
			log.debug(FILENAME + ' Funktion: pruefeRfdWS URL: ' + cfg.urlRFDWebservice + ' ' + response.statusCode + ' OK');
			exports.sendeWebsocketNachrichtStatus({dienst: 'RFD', status: {URL: cfg.urlRFDWebservice, Status: 'OK'}});
			exports.sendeWebsocketNachrichtServer({dienst: 'RFD', status: {URL: cfg.urlRFDWebservice, Status: 'OK'}});
		}
		else {
			log.error(FILENAME + ' Funktion: pruefeRfdWS URL: ' + cfg.urlRFDWebservice + ' ' + error);
			exports.sendeWebsocketNachrichtStatus({
				dienst: 'RFD',
				status: {URL: cfg.urlRFDWebservice, Status: 'Error'}
			});
			exports.sendeWebsocketNachrichtServer({
				dienst: 'RFD',
				status: {URL: cfg.urlRFDWebservice, Status: 'Error'}
			});
		}
	})
};


/*Block zur Implementierung der WebService Abfragen an RFD
 * TODO: noch erforderlich? ApID in Client ergaeznen damit schaltzustand zum AP geschrieben werden kann
 *
 *
 *
 */
exports.sendeWebServiceNachricht = function (Fst, Span_Mhan, aktion, Kanal, span_mhanApNr, ApID) {
	const parameterRfdWebService = {
		url: cfg.urlRFDWebservice,
		method: 'POST',
		headers: {
			'Content-Type': 'text/xml;charset=UTF-8;',
			'SOAPAction': 'PLATZHALTER'                      //NOch beachten in WS Aufrufen
		},
		body: ''
	};

	let antwortFuerWebsocket;


	if (aktion == 'trennenEinfach') {
		//Variable fuer RFD Request
		const msg_TrennenEinfach = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><trennenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">' + Span_Mhan + '</vonId><nachId xmlns="">' + Fst + '</nachId></trennenEinfach></s:Body></s:Envelope>';
		//Variable fuer true Rueckmeldung vom RFD
		antwortFuerWebsocket = {getrennt: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
		parameterRfdWebService.headers.SOAPAction = 'trennenEinfach';
		parameterRfdWebService.body = msg_TrennenEinfach
	}

	if (aktion == 'schaltenEinfach') {
		//Variable fuer RFD Request
		const msg_SchaltenEinfach = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><schaltenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">' + Span_Mhan + '</vonId><nachId xmlns="">' + Fst + '</nachId><duplex xmlns="">true</duplex></schaltenEinfach></s:Body></s:Envelope>';
		//Variable fuer true Rueckmeldung vom RFD
		antwortFuerWebsocket = {geschaltet: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
		parameterRfdWebService.headers.SOAPAction = 'schaltenEinfach';
		parameterRfdWebService.body = msg_SchaltenEinfach
	}

	if (aktion == 'setzeKanal') {
		//Variable fuer RFD Request
		const msg_setzeKanal = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><setzeKanal xmlns="http://strg.rfd.dma.schnoor.de/"><fstid xmlns="">' + Fst + '</fstid><channel xmlns="">' + Kanal + '</channel></setzeKanal></s:Body></s:Envelope>';
		//Variable fuer true Rueckmeldung vom RFD

		//Websocket Antwort kann entfallen. Bestaetigung wird als SIP NAchricht vom RFD DM versendet
		antwortFuerWebsocket = {setzeKanal: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
		parameterRfdWebService.headers.SOAPAction = 'setzeKanal';
		parameterRfdWebService.body = msg_setzeKanal
	}

	if (aktion == 'SetzeAudioPegel') {
		//Variable fuer RFD Request
		const msg_setzeAudioPegel = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><SetzeAudioPegel xmlns="http://strg.rfd.dma.schnoor.de/"><apid xmlns="">' + Span_Mhan + '</apid><fstid xmlns="">' + Fst + '</fstid><level xmlns="">' + Kanal + '</level></SetzeAudioPegel></s:Body></s:Envelope>';
		//Variable fuer true Rueckmeldung vom RFD

		//Variable fuer true Rueckmeldung vom RFD
		antwortFuerWebsocket = {SetzeAudioPegel: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
		parameterRfdWebService.headers.SOAPAction = 'SetzeAudioPegel';
		parameterRfdWebService.body = msg_setzeAudioPegel
	}

	log.debug('parameterRfdWebService.headers.SOAPAction: ' + parameterRfdWebService.headers.SOAPAction);

	request(parameterRfdWebService, function (error, response, body) {
		log.debug(FILENAME + ' Funktion: sendeWebServiceNachricht request mit Parameter: ' + JSON.stringify(parameterRfdWebService));
		if (error) {
			log.error(FILENAME + ' Funktion: sendeWebServiceNachricht request ' + 'Msg: RFD WebService nicht erreichbar. Aktion: ' + aktion, {
				uebergabe: parameterRfdWebService,
				nodeMsg: error
			});
			//log.info('RFD '+aktion+' fehlgeschlagen')

			exports.sendeWebSocketNachricht('RFD ' + aktion + ' fehlgeschlagen')

		}
		else {
			log.debug(FILENAME + ' parsing response');
			parser.parseString(body, function (err, result) {
				//log.debug(FILENAME + ' result  ' + JSON.stringify(result));
				if (result !== undefined && result !== null && typeof result === 'object') {
					if (result['S:Envelope'] !== undefined) {
						log.info(FILENAME + ' Funktion: sendeWebServiceNachricht response: ' + JSON.stringify(result));
						//console.log(result['S:Envelope'])
						//console.log(result['S:Envelope']['S:Body'][0]['ns2:'+aktion+'Response'][0])

						const erfolgreich = result['S:Envelope']['S:Body'][0]['ns2:' + aktion + 'Response'][0]['return'][0];
						if (erfolgreich === 'true') {
							exports.sendeWebSocketNachricht(antwortFuerWebsocket);

							if (aktion == 'schaltenEinfach' || aktion == 'trennenEinfach') {
								schreibeSchaltzustand(Fst, Span_Mhan, aktion, span_mhanApNr, ApID)
							}

						}
						else {
							log.error('RFD ' + aktion + ' fehlgeschlagen');
							exports.sendeWebSocketNachricht('RFD ' + aktion + ' fehlgeschlagen');

							//TODO: Bei False Verarbeitung muss RFD muss nicht gestört sein. Abfangen
							//exports.sendeWebsocketNachrichtStatus({
							//    RfdStatus: {
							//        URL: cfg.urlRFDWebservice,
							//        Status: 'Error'
							//    }
							//});
						}
					}
					else {
						// TODO: Client ggf. informieren, dass der letzte Request nicht verarbeitet werden konnte - anders als der healthcheck ist die Ursache aber vielfaeltiger
						log.error(FILENAME + ' no envelope');
					}
				}
				else {
					// TODO: Client ggf. informieren, dass der letzte Request nicht verarbeitet werden konnte - anders als der healthcheck ist die Ursache aber vielfaeltiger
					log.error(FILENAME + ' result undefined or unexpected');
				}
			}); // Parser ende
		}// ELse ende
	}); // Request ende
};


//Zum Senden von UKW bezogenen Nachrichten
exports.sendeWebSocketNachricht = function (Nachricht) {
	log.info(FILENAME + ' Funktion: sendeWebSocketNachricht ' + 'ukwMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	io.emit('ukwMessage', Nachricht);
};

//Zum Senden von Status-Meldungen
exports.sendeWebsocketNachrichtStatus = function (Nachricht) {
	log.debug(FILENAME + ' Funktion: sendeWebsocketNachrichtStatus ' + 'statusMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	io.emit('statusMessage', Nachricht);
};

//Zum Senden von Status-Meldungen
exports.sendeWebsocketNachrichtServer = function (Nachricht) {
	log.debug(FILENAME + ' Funktion: sendeWebsocketNachrichtServer ' + 'ServerMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	io.emit('serverMessage', Nachricht);
};

//Zum Senden von Status-Meldungen
exports.sendeWebsocketNachrichtServer = function (Nachricht) {
    log.debug(FILENAME + ' Funktion: sendeWebsocketNachrichtServer ' + 'ServerMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
    io.emit('serverMessage', Nachricht);
};


/*
 zum Testen
 */
//var Intervall=setInterval(function() {sendeWebSocketNachricht()},1000)


//schreibe Schaltzzustand in DB
function schreibeSchaltzustand(fst, Span_Mhan, aktion, span_mhanApNr, ApID) {
	const schreibeLokal = false; //es wird auf jeden Fall geschrieben
	const selector = {ApID, 'funkstelle': fst, 'span_mhan': Span_Mhan};
	let aufgeschaltet = true;

	if (aktion == 'trennenEinfach') {
		aufgeschaltet = false
	}

	const schaltZustand = {
		ApID, // z.B. JA NvD
		'funkstelle': fst, // z.B. 1-H-RFD-WHVVTA-FKEK-1
		'span_mhan': Span_Mhan, // z.B. 1-H-RFD-WHVVKZ-SPAN-01
		span_mhanApNr, // z.B. MHAN05
		'zustand': {
			aufgeschaltet, // true - false
			'letzterWechsel': new Date().toJSON()
		}
	};

	db.schreibeInDb('schaltZustaende', selector, schaltZustand, schreibeLokal)
}


//schreibe Zustandsmeldungen in zustandKomponenten
//{"FSTSTATUS":{"$":{"id":"1-H-RFD-WEDRAD-FKHK-1","state":"0","connectState":"OK","channel":"-1"}}}
//TODO:
function schreibeZustand(Nachricht) {
	if (Nachricht.hasOwnProperty('FSTSTATUS')) {
		const schreibeLokal = true; //es wird nur geschrieben wenn die aktuelle Instanz und Mongo Primary in einem VTR sind
		let zustand;

		//entfernen da dieser sonst den Kanal im DUE wieder mit -1 ueberschreibt
		if (Nachricht.FSTSTATUS.$.channel == '-1') {
			zustand = {
				$set: {
					letzteMeldung: new Date(),
					'status.connectState': Nachricht.FSTSTATUS.$.connectState,
					'status.state': Nachricht.FSTSTATUS.$.state,
				},
				$setOnInsert: {
					'status.id': Nachricht.FSTSTATUS.$.id
				}
			}
		}
		else {
			zustand = {
				$set: {
					letzteMeldung: new Date(),
					'status.connectState': Nachricht.FSTSTATUS.$.connectState,
					'status.state': Nachricht.FSTSTATUS.$.state,
					'status.channel': Nachricht.FSTSTATUS.$.channel
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


// Register callbacks to desired message event
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
});

ua.on('connecting', function (e) {
	log.debug(FILENAME + ' Funktion connecting zu SIP-Server: ' + cfg.jsSipConfiguration_DUE.uri)
});

ua.on('registered', function (e) {
	log.debug(FILENAME + ' Funktion: registered auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri);
	// sendeNachricht('Bin jetzt Registriert');
	// anruf();
});

ua.on('registrationFailed', function (e) {
	log.error(FILENAME + ' Funktion: registrationFailed auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri)
});


ua.on('disconnected', function (e) {
	log.debug(FILENAME + ' Funktion: Getrennt vom SIP-Server ' + cfg.jsSipConfiguration_DUE.uri)
});

ua.on('newMessage', function (e) {
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
			exports.sendeWebSocketNachricht(result);
			schreibeZustand(result)
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

//SIP Test Aufrufe
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
 *
 */
exports.anruf = function () {
	ua.call(cfg.jsSipConfiguration_mockRFD.testReceiverCall)
};

//SIP User Agent Ereignisse
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
