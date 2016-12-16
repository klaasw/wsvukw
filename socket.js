'use strict';

const db = require('./datenbank.js'); // Module zur Verbindung zur Datenbank
db.verbindeDatenbank(function (db) {
});

const cfg = require('./cfg.js');
const log = require('./log.js');
const rfd = require('./rfd.js');
const request = require('request'); //Modul zu Abfrage von WebServices

const FILENAME = __filename.slice(__dirname.length + 1);

const io = require('socket.io');
const socketClient = require('socket.io-client');

let socketServer; //Variable um die Sockets ausserhalb der Funktion "on.connect" aufzurufen

log.debug(FILENAME + ' geladen.');

let dueStatusServerA = null;
let dueStatusServerB = null;

exports.socket = function (server) {
	log.debug(FILENAME + ' Socket Server established');

	socketServer = io.listen(server);
	socketServer.on('connect', function (socket) {
		log.debug(FILENAME + ' Funktion connect: Benutzer hat Websocket-Verbindung mit ID ' + socket.id + ' hergestellt. IP: ' + socket.request.connection.remoteAddress);
		// TODO: Pruefung Berechtigung !

		// nur einmal beim Start: Zeitpunkt der Benutzung in DB schreiben
		db.schreibeApConnect(socket.conn.remoteAddress, socket.id, true);

		leseZustand(socket.id); //Status der Funkstellen übertragen
		exports.leseSchaltzustand(socket.id, socket.request.connection.remoteAddress); //letzten Schaltzustandübertragen
		// Uebertragen der DUE Server Zustaende
		exports.emit('statusMessage', dueStatusServerA, socket.id);
		exports.emit('statusMessage', dueStatusServerB, socket.id);

		socket.on('*', function (msg) {
			log.debug(FILENAME + ' Funktion * message: ' + JSON.stringify(msg))
		});

		socket.on('mock message', function (msg) {
			socket.broadcast.emit('mock message', msg);
			log.debug(FILENAME + ' Funktion mock message: ' + JSON.stringify(msg))
		});
		socket.on('chat message', function (msg) {
			//io.emit('chat message', msg);
			log.debug('chat message: ' + JSON.stringify(msg));
			rfd.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurueckgesendet wird
		});

		//'Standardnachrichten für Weiterleitung an RFD schalten,trennen, MKA'
		socket.on('clientMessage', function (msg) {
			log.debug(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessage: WebSocket Nachricht: ' + JSON.stringify(msg));
			rfd.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal, msg.span_mhanApNr, msg.ApID);//Sende WebServiceNachricht an RFD
		});

		//Speichern der Kanal Lotsenzuordnung
		socket.on('clientMessageSpeichern', function (msg) {
			log.info(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessageSpeichern: WebSocket Nachricht: ' + JSON.stringify(msg));

			//Speichern
			for (const LotsenAp in msg.LotsenApBenutzer) {
				ukw.speichereLotsenZuordnung(LotsenAp, JSON.stringify(msg.LotsenApBenutzer[LotsenAp]))
			}
		});

		// Client hat Verbindung unterbrochen:
		socket.on('disconnect', function (msg) {
			let ip = socket.request.connection.remoteAddress;
			//IPv6 Anteil aus Anfrage kuerzen
			const ipv6Ende = ip.lastIndexOf(':');
			if (ipv6Ende > -1) {
				ip = ip.slice(ipv6Ende + 1, ip.length);
			}

			log.warn(FILENAME + ' Funktion disconnect: Benutzer hat Websocket-Verbindung mit ID ' + socket.id + ' getrennt. IP: ' + ip);
			db.schreibeApConnect(ip, socket.id, false);

		});


	});


};


//Zum Senden von UKW bezogenen Nachrichten
exports.sendeWebSocketNachricht = function (Nachricht) {
	log.info(FILENAME + ' Funktion: sendeWebSocketNachricht ' + 'ukwMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	exports.emit('ukwMessage', Nachricht);
};

//Zum Senden von Status-Meldungen
exports.sendeWebsocketNachrichtStatus = function (Nachricht) {
	log.debug(FILENAME + ' Funktion: sendeWebsocketNachrichtStatus ' + 'statusMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	exports.emit('statusMessage', Nachricht);
};

//Zum Senden von Status-Meldungen
exports.sendeWebsocketNachrichtServer = function (Nachricht) {
	log.debug(FILENAME + ' Funktion: sendeWebsocketNachrichtServer ' + 'ServerMsg: WebSocket Nachricht: ' + JSON.stringify(Nachricht));
	exports.emit('serverMessage', Nachricht);
};


exports.emit = function emit(messagetype, message, socketID) {
	log.debug(FILENAME + ' Funktion: socket.emit MessageType: ' + messagetype + '  message: ' + JSON.stringify(message));

	if (socketID == undefined) {
		log.debug(FILENAME + ' Funktion emit: emitting messages to clients...');
		return socketServer.emit(messagetype, message);
	}


	if (socketID) {
		log.debug(FILENAME + ' Funktion emit: emitting messages to client: ' + socketID);
		return socketServer.to(socketID).emit(messagetype, message);
	}

	/** Pruefung ob Clients verbunden sind
	 if () {
        log.error(FILENAME + " Funktion emit: no client connected, not able to send message "+ messagetype);
    }

	 **/
};

/**
 * Einlesen des Schaltzustands und übermittlung bei connect
 * @param socketID
 * @param IP
 */
// TODO: ersetzen durch Zugriff auf DB, Collection zustandkomponenten
exports.leseSchaltzustand = function (socketID, IP) {
	const zustand = {};

	db.findeApNachIp(IP, function (benutzer) {
		const url = 'http://' + cfg.cfgIPs.httpIP + ':' + cfg.port + '/verbindungen/liesVerbindungen?arbeitsplatz=' + benutzer + '&aktiveVerbindungen=true';
		log.debug(FILENAME + 'leseSchaltzustand ' + url);
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				body = JSON.parse(body);
				for (const verbindung of body) {
					//erstelle Objekt nach Muster 1-H-RFD-WHVVTA-FKEK-1:MHAN01
					//In Verbindung mit der AP Konfuguration der Geaete kann der Client die Verbindungen wieder schalten
					zustand[verbindung.funkstelle] = verbindung.span_mhanApNr
				}
				log.debug(FILENAME + 'leseSchaltzustand ' + JSON.stringify(zustand));
				// socket.emit('zustandsMessage', zustand, socketID)
			}
			else {
				log.error(FILENAME + ' Funktion: leseSchaltzustand aus REST Service Fehler: ' + error)
			}
		})
	})
};

//Lese Zustandsmeldungen in zustandKomponenten
//{"FSTSTATUS":{"$":{"id":"1-H-RFD-WEDRAD-FKHK-1","state":"0","connectState":"OK","channel":"-1"}}}
//TODO:
function leseZustand(socketID) {
	const selector = {};
	db.findeElement('zustandKomponenten', selector, function (doc) {
		for (let i = 0; i < doc.length; i++) {
			const zustand = {
				'FSTSTATUS': {
					'$': doc[i].status,
					'letzteMeldung': doc[i].letzteMeldung
				}
			};
			exports.emit('ukwMessage', zustand, socketID)
		}
	})
}


if (cfg.intervall !== 0) {
	//TODO: Gegenseitige Serverüberwachung
	//Funktioniert noch nicht richt. Test mit Namespace oder Rooms
	const serverA = cfg.alternativeIPs[1]; // z.B. { '0': 'WHV', '1': '10.160.1.64:3000' }

	const serverB = cfg.alternativeIPs[2];

	log.debug(serverA);

	const client_bei_serverA = socketClient.connect('http://' + serverA[1]);
	client_bei_serverA.on('connect', function () {
		log.debug('Funktion: Serverueberwachung SOCKET verbunden mit: ' + serverA);
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverA[1], Status: 'OK'}});
		dueStatusServerA = {dienst: 'DUE', status: {URL: serverA[1], Status: 'OK'}}
	});

	client_bei_serverA.on('disconnect', function () {
		log.debug('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverA);
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}});
		dueStatusServerA = {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}}
	});

	client_bei_serverA.on('error', function (err) {
		log.debug('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverA);
		log.error('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverA + ' ErrorMsg: ' + JSON.stringify(err));
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}});
		dueStatusServerA = {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}}
	});

	client_bei_serverA.on('reconnecting', function (reconnectNr) {
		log.debug('Funktion: Serverueberwachung SOCKET Verbindungsversuch zu: ' + serverA + ' Nr: ' + JSON.stringify(reconnectNr))
	});

	client_bei_serverA.on('reconnect_error', function (err) {
		log.error('Funktion: Serverueberwachung SOCKET Verbindungsversuch zu: ' + serverA + ' ErrorMsg: ' + JSON.stringify(err));
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}});
		dueStatusServerA = {dienst: 'DUE', status: {URL: serverA[1], Status: 'Error'}}
	});


	const client_bei_serverB = socketClient.connect('http://' + serverB[1]);
	client_bei_serverB.on('connect', function () {
		log.debug('Funktion: Serverueberwachung SOCKET verbunden mit: ' + serverB);
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverB[1], Status: 'OK'}});
		dueStatusServerB = {dienst: 'DUE', status: {URL: serverB[1], Status: 'OK'}}
	});

	client_bei_serverB.on('disconnect', function () {
		log.debug('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverB);
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}});
		dueStatusServerB = {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}}
	});

	client_bei_serverB.on('error', function (err) {
		log.debug('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverB);
		log.error('Funktion: Serverueberwachung SOCKET getrennt von: ' + serverB + ' ErrorMsg: ' + JSON.stringify(err));
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}});
		dueStatusServerB = {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}}
	});

	client_bei_serverB.on('reconnecting', function (reconnectNr) {
		log.debug('Funktion: Serverueberwachung SOCKET Verbindungsversuch zu: ' + serverB + ' Nr: ' + JSON.stringify(reconnectNr))
	});

	client_bei_serverB.on('reconnect_error', function (err) {
		log.error('Funktion: Serverueberwachung SOCKET Verbindungsversuch zu: ' + serverB + ' ErrorMsg: ' + JSON.stringify(err));
		exports.emit('statusMessage', {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}});
		dueStatusServerB = {dienst: 'DUE', status: {URL: serverB[1], Status: 'Error'}}
	});


	client_bei_serverA.on('serverMessage', function (msg) {
		log.debug('Status von Server A: ' + JSON.stringify(msg));
		exports.emit('statusMessage', msg)
	});

	client_bei_serverB.on('serverMessage', function (msg) {
		log.debug('Status von Server B: ' + JSON.stringify(msg));
		exports.emit('statusMessage', msg)
	});
}



