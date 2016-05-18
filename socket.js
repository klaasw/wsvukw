var log = require('./log.js');
var ukw = require('./ukw.js');
var files = require('fs'); // Zugriff auf das Dateisystem

FILENAME = __filename.slice(__dirname.length + 1);

var io = require('socket.io');
var socketClient = require('socket.io/node_modules/socket.io-client')

var socketGlobal;

log.debug("socket.js geladen.");


exports.socket = function (server) {
    log.debug("Socket established");
    log.debug("server: " + server);

    io.listen(server).on('connect', function (socket) {
        log.debug('Benutzer hat sich per Websocket verbunden. IP: ' + socket.request.connection.remoteAddress);
        // TODO: Pruefung Berechtigung !
        socketGlobal = socket;

        socket.on('mock message', function (msg) {
            socket.broadcast.emit('mock message', msg);
            log.debug('mock message: ' + JSON.stringify(msg))
        });
        socket.on('chat message', function (msg) {
            //io.emit('chat message', msg);
            log.debug('chat message: ' + JSON.stringify(msg));
            ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurueckgesendet wird
        });

        //'Standardnachrichten für Weiterleitung an RFD schalten,trennen, MKA'
        socket.on('clientMessage', function (msg) {
            log.debug(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessage: WebSocket Nachricht: ' + JSON.stringify(msg))
            ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Sende WebServiceNachricht an RFD
        });

        //Speichern der Kanal Lotsenzuordnung
        socket.on('clientMessageSpeichern', function (msg) {
            log.info(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessageSpeichern: WebSocket Nachricht: ' + JSON.stringify(msg))

            //Speichern
            for (var LotsenAp in msg.LotsenApBenutzer) {
                ukw.speichereLotsenZuordnung(LotsenAp, JSON.stringify(msg.LotsenApBenutzer[LotsenAp]))
            }
        });

        //Speichern der Schaltzustände der Clients
        socket.on('clientMessageSchaltzustand', function (msg) {

            ApID = msg.Arbeitsplatz.replace(/ /g, "_")
            Zustand = JSON.stringify(msg.Zustand)

            log.info(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessageSchaltzustand: WebSocket Nachricht: ' + JSON.stringify(msg))

            files.writeFile(ApID + '_Zustand.json', Zustand, 'utf8', function (err, data) {
                if (err) {
                    log.error(FILENAME + ' Funktion: speichereSchaltzustand: ' + ApID + '_Zustand.json konnte nicht geschrieben werden' + err)
                }
                else {
                    log.info(FILENAME + ' Funktion: speichereSchaltzustand: konfig.json ' + ApID + '_Zustand.json geschrieben')
                }

            })

        });

        // Client hat Verbindung unterbrochen:
        socket.on('disconnect', function (msg) {
            socketGlobal = undefined;
        });


    });
};

exports.emit = function emit(messagetype, message) {
    log.debug(FILENAME + " Funktion: socket.emit MessageType: " + messagetype + "  message: " + JSON.stringify(message));
    if (socketGlobal == undefined) {
        log.debug("no client connected, not able to send message "+ messagetype);
    } else {
        return socketGlobal.emit(messagetype, message);
    }
};

//TODO: Gegenseitige Serverüberwachung
var client = socketClient.connect('http://10.162.1.84:3000')
client.on('connect',function() {
    log.debug("Verbunden mit..........................");
}); 

client.on('disconnect', function() {
    log.debug("Getrennt von...........................")
});


