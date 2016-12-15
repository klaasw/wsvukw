'use strict';

const log = require('./log.js');
const ukw = require('./ukw.js');
const files = require('fs'); // Zugriff auf das Dateisystem
const request = require('request'); //Modul zu Abfrage von WebServices

//FILENAME = __filename.slice(__dirname.length + 1);
const FILENAME = __filename;

const io = require('socket.io');
const socketClient = require('socket.io-client');

let socketServer; //Variable um die Sockets ausserhalb der Funktion "on.connect" aufzurufen

const cfg = require('./cfg.js');
const db = require('./datenbank.js');

log.debug(FILENAME + ' socket.js geladen.');

let dueStatusServerA = null;
let dueStatusServerB = null;

exports.socket = function (server) {
	log.debug(FILENAME + ' Socket Server established');
	log.debug(FILENAME + ' server: ' + server); //Log ggf. wieder weg, da Server Objekt keine relevanten Info enthält

	socketServer = io.listen(server);
	socketServer.on('connect', function (socket) {
		log.debug(FILENAME + ' Funktion connect: Benutzer hat Websocket-Verbindung mit ID ' + socket.id + ' hergestellt. IP: ' + socket.request.connection.remoteAddress);
		// TODO: Pruefung Berechtigung !

        // nur einmal beim Start: Zeitpunkt der Benutzung in DB schreiben
        schreibeApConnect(socket.request.ip, socket.id);

		leseZustand(socket.id); //Status der Funkstellen übertragen
		leseSchaltzustand(socket.id, socket.request.connection.remoteAddress); //letzten Schaltzustandübertragen
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
			ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurueckgesendet wird
		});

		//'Standardnachrichten für Weiterleitung an RFD schalten,trennen, MKA'
		socket.on('clientMessage', function (msg) {
			log.debug(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessage: WebSocket Nachricht: ' + JSON.stringify(msg));
			ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal, msg.span_mhanApNr, msg.ApID);//Sende WebServiceNachricht an RFD
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
			schreibeSocketInfo('false', ip);

		});


	});


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


//in Arbeit
//Einlesen des Schaltzustands und übermittlung bei connect
function leseSchaltzustand(socketID, IP) {
	const zustand = {};

	findeApNachIp(IP, socketID, function (benutzer) {
		const url = 'http://' + cfg.cfgIPs.httpIP + ':' + cfg.port + '/verbindungen/liesVerbindungen?arbeitsplatz=' + benutzer + '&aktiveVerbindungen=true';
		log.debug(FILENAME + 'leseSchaltzustand '+ url);
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				body = JSON.parse(body);
				for (const verbindung of body) {
					//erstelle Objekt nach Muster 1-H-RFD-WHVVTA-FKEK-1:MHAN01
					//In Verbindung mit der AP Konfuguration der Geaete kann der Client die Verbindungen wieder schalten
					zustand[verbindung.funkstelle] = verbindung.span_mhanApNr
				}
				log.debug(FILENAME + 'leseSchaltzustand ' + JSON.stringify(zustand));
				exports.emit('zustandsMessage', zustand, socketID)
			}
			else {
				log.error(FILENAME + ' Funktion: leseSchaltzustand aus REST Service Fehler: ' + error)
			}
		})
	})
}


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

function schreibeApConnect(ip, socketId) {
	//SocketID und Verbindungszeit in DB schreiben
	const ApInfo = ip;
	ApInfo.socketID = socketID;
	ApInfo.connectTime = new Date();
	ApInfo.aktiv = true;

	//Schreiben in aktiveArbeitsplaetze
	schreibeSocketInfo(ApInfo, ip);
}

//schreibe Verbindungsinfo socketID und Zeitstempel in aktiveArbeitsplaetze
function schreibeSocketInfo(socketInfo, ip) {
	const schreibeLokal = false; //auf jeden Fall schreiben in Primary Datenbank schreiben
	socketInfo._id = ip;

	if (socketInfo === 'false') {
		socketInfo = {
			$set: {
				aktiv: false,
				disconnectTime: new Date()
			}
		}
	}
	const selector = {'_id': ip};
	// TODO: lieber separate Datenbank: Bewegungsdaten / Monitoring / Audit von Stammdaten trennen
	db.schreibeInDb('aktiveArbeitsplaetze', selector, socketInfo, schreibeLokal);
}

if(cfg.intervall !== 0 ) {
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
