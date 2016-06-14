var log = require('./log.js');
var ukw = require('./ukw.js');
var files = require('fs'); // Zugriff auf das Dateisystem
var request = require('request'); //Modul zu Abfrage von WebServices

FILENAME = __filename.slice(__dirname.length + 1);

var io = require('socket.io');
var socketClient = require('socket.io/node_modules/socket.io-client')

var socketGlobal;

var cfg = require('./cfg.js');

log.debug(FILENAME+ " socket.js geladen.");


exports.socket = function (server) {
    log.debug(FILENAME + " Socket Server established");
    log.debug(FILENAME + " server: " +server); //Log ggf. wieder weg, da Server Objekt keine relevanten Info enthält
        
        io.listen(server).on('connect', function (socket) {
            log.debug(FILENAME + ' Funktion connect: Benutzer hat Websocket-Verbindung mit ID '+ socket.id + ' hergestellt. IP: ' + socket.request.connection.remoteAddress);
            // TODO: Pruefung Berechtigung !
            socketGlobal = socket;
            leseSchaltzustand(socket.id, socket.request.connection.remoteAddress)

        socket.on('*', function(msg) {
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
            ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Sende WebServiceNachricht an RFD
        });

        //Speichern der Kanal Lotsenzuordnung
        socket.on('clientMessageSpeichern', function (msg) {
            log.info(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessageSpeichern: WebSocket Nachricht: ' + JSON.stringify(msg));

            //Speichern
            for (var LotsenAp in msg.LotsenApBenutzer) {
                ukw.speichereLotsenZuordnung(LotsenAp, JSON.stringify(msg.LotsenApBenutzer[LotsenAp]))
            }
        });

        //Speichern der Schaltzustände der Clients
        socket.on('clientMessageSchaltzustand', function (msg) {

            ApID = msg.Arbeitsplatz.replace(/ /g, "_");
            Zustand = JSON.stringify(msg.Zustand);

            log.info(FILENAME + ' Funktion: empfangeWebNachricht ' + 'clientMessageSchaltzustand: WebSocket Nachricht: ' + JSON.stringify(msg));

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
            log.warn(FILENAME + ' Funktion disconnect: Benutzer hat Websocket-Verbindung mit ID '+ socket.id + ' getrennt. IP: ' + socket.request.connection.remoteAddress);
            socketGlobal = undefined;
        });


    });
};

exports.emit = function emit(messagetype, message, socketID) {
    log.debug(FILENAME + " Funktion: socket.emit MessageType: " + messagetype + "  message: " + JSON.stringify(message));
    if (socketGlobal == undefined) {
        log.error(FILENAME + " Funktion emit: no client connected, not able to send message "+ messagetype);
    } else {
        log.debug(FILENAME + " Funktion emit: emitting messages to clients...");
        return socketGlobal.emit(messagetype, message);
    }
    if (socketID){
        log.debug(FILENAME + " Funktion emit: emitting messages to client: "+ socketID);
        return socketGlobal.broadcast.to(socketID).emit(messagetype, message);
    }

};


//in Arbeit
//Einlesen des Schaltzustands und übermittlung bei connect

function leseSchaltzustand(socketID, IP){
    var zustand='';

    findeApNachIp(IP, function(benutzer){
        
        benutzer = benutzer.replace(/ /g, "_");

        files.readFile(benutzer+'_Zustand.json', 'utf8', function (err, data) {
            if (err){
                log.error(FILENAME + ' Funktion: leseSchaltzustand: ' + benutzer + '_Zustand.json konnte nicht gelesen werden' + err)
            }
            else{
                zustand = JSON.parse(data)
                log.debug(FILENAME + ' Funktion: leseSchaltzustand: ' + benutzer + '_Zustand.json gelesen, Inhalt: '+ JSON.stringify(zustand))
                exports.emit('zustandsMessage', zustand, socketID)
            }
        })
    })
}


function findeApNachIp(ip, callback) {
    var Ap = '';
    //var alle_Ap = require(cfg.configPath + '/users/arbeitsplaetze.json');
    log.debug(FILENAME + " function findeNachIp: " + ip);
    // TODO: auf Datenbank-Abfrage umstellen: erster Schritt REST-Service nutzen
    var url = "http://" + cfg.cfgIPs.httpIP + ":" + cfg.port + "/arbeitsplaetze";
    log.debug(FILENAME + " function findeNachIp " + url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //log.debug("body: " + body);
            var alle_Ap = JSON.parse(body);
            log.debug(FILENAME + ' function findeNachIp: ' + alle_Ap);

            if(alle_Ap.hasOwnProperty(ip)){
                Ap = alle_Ap[ip].user;
                log.debug(FILENAME + ' function findeNachIp: ermittelter Benutzer: ' + JSON.stringify(Ap));
                callback(Ap);
            }
            
            else{
                log.error(FILENAME + ' function findeNachIp: Benutzer NICHT gefunden zu IP: ' + ip);
                callback('')
            }
        }
        else {
            log.error("Fehler. " + JSON.stringify(error));
        }
    });
}





//TODO: Gegenseitige Serverüberwachung
//Funktioniert noch nicht richt. Test mit Namespace oder Rooms
var client_bei_serverA = socketClient.connect('http://10.162.1.74:3000')
client_bei_serverA.on('connect',function() {
    log.debug("Verbunden mit..........................A");
}); 

client_bei_serverA.on('disconnect', function() {
    log.debug("Getrennt von...........................A")
});

var client_bei_serverB = socketClient.connect('http://10.162.1.84:3000')
client_bei_serverB.on('connect',function() {
    log.debug("Verbunden mit..........................B");
}); 

client_bei_serverB.on('disconnect', function() {
    log.debug("Getrennt von...........................B")

});


client_bei_serverB.on('statusMessage', function (msg) {
    log.debug('Status von Server B: '+ JSON.stringify(msg))
    exports.emit('statusMessage', msg)
});




