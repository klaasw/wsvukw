var JsSIP = require('jssip'); //Javascript SIP Uaser Agent

var request = require('request'); //Modul zu Abfrage von WebServices
var xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({explicitRoot: true});// Parserkonfiguration
var log = require('./log.js');

var cfg = require('./cfg.js');

var io = require('./socket.js');


FILENAME = __filename.slice(__dirname.length + 1);

/* ToDo
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
            exports.sendeWebsocketNachrichtStatus({RfdStatus: {URL: cfg.urlRFDWebservice, Status: 'OK'}})
        }
        else {
            log.error(FILENAME + ' Funktion: pruefeRfdWS URL: ' + cfg.urlRFDWebservice + ' ' + error);
            exports.sendeWebsocketNachrichtStatus({RfdStatus: {URL: cfg.urlRFDWebservice, Status: 'Error'}})
        }
    })
};


/*Block zur Implementierung der WebService Abfragen an RFD
 *
 *
 *
 *
 */
exports.sendeWebServiceNachricht = function (Fst, Span_Mhan, aktion, Kanal) {
    var parameterRfdWebService = {
        url: cfg.urlRFDWebservice,
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml;charset=UTF-8;',
            'SOAPAction': 'PLATZHALTER'                      //NOch beachten in WS Aufrufen
        },
        body: ''
    };

    var antwortFuerWebsocket;


    if (aktion == 'trennenEinfach') {
        //Variable fuer RFD Request
        var msg_TrennenEinfach = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><trennenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">' + Span_Mhan + '</vonId><nachId xmlns="">' + Fst + '</nachId></trennenEinfach></s:Body></s:Envelope>';
        //Variable fuer true Rueckmeldung vom RFD
        antwortFuerWebsocket = {getrennt: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
        parameterRfdWebService.headers.SOAPAction = 'trennenEinfach';
        parameterRfdWebService.body = msg_TrennenEinfach
    }

    if (aktion == 'schaltenEinfach') {
        //Variable fuer RFD Request
        var msg_SchaltenEinfach = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><schaltenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">' + Span_Mhan + '</vonId><nachId xmlns="">' + Fst + '</nachId><duplex xmlns="">true</duplex></schaltenEinfach></s:Body></s:Envelope>';
        //Variable fuer true Rueckmeldung vom RFD
        antwortFuerWebsocket = {geschaltet: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
        parameterRfdWebService.headers.SOAPAction = 'schaltenEinfach';
        parameterRfdWebService.body = msg_SchaltenEinfach
    }

    if (aktion == 'setzeKanal') {
        //Variable fuer RFD Request
        var msg_setzeKanal = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><setzeKanal xmlns="http://strg.rfd.dma.schnoor.de/"><fstid xmlns="">' + Fst + '</fstid><channel xmlns="">' + Kanal + '</channel></setzeKanal></s:Body></s:Envelope>';
        //Variable fuer true Rueckmeldung vom RFD

        //Websocket Antwort kann entfallen. Bestaetigung wird als SIP NAchricht vom RFD DM versendet
        antwortFuerWebsocket = {setzeKanal: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
        parameterRfdWebService.headers.SOAPAction = 'setzeKanal';
        parameterRfdWebService.body = msg_setzeKanal
    }

    if (aktion == 'SetzeAudioPegel') {
        //Variable fuer RFD Request
        var msg_setzeAudioPegel = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><SetzeAudioPegel xmlns="http://strg.rfd.dma.schnoor.de/"><apid xmlns="">' + Span_Mhan + '</apid><fstid xmlns="">' + Fst + '</fstid><level xmlns="">' + Kanal + '</level></SetzeAudioPegel></s:Body></s:Envelope>';
        //Variable fuer true Rueckmeldung vom RFD

        //Variable fuer true Rueckmeldung vom RFD
        antwortFuerWebsocket = {SetzeAudioPegel: {'$': {id: Fst, Ap: Span_Mhan, state: '1'}}};
        parameterRfdWebService.headers.SOAPAction = 'SetzeAudioPegel';
        parameterRfdWebService.body = msg_setzeAudioPegel
    }

    log.debug("parameterRfdWebService.headers.SOAPAction: " + parameterRfdWebService.headers.SOAPAction);

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

                        erfolgreich = result['S:Envelope']['S:Body'][0]['ns2:' + aktion + 'Response'][0]['return'][0];
                        if (erfolgreich === 'true') {
                            exports.sendeWebSocketNachricht(antwortFuerWebsocket)
                        }
                        else {
                            log.error('RFD ' + aktion + ' fehlgeschlagen');
                            exports.sendeWebSocketNachricht('RFD ' + aktion + ' fehlgeschlagen');
                            exports.sendeWebsocketNachrichtStatus({
                                RfdStatus: {
                                    URL: cfg.urlRFDWebservice,
                                    Status: 'Error'
                                }
                            });
                        }
                    } else{
                        // TODO: Client ggf. informieren, dass der letzte Request nicht verarbeitet werden konnte - anders als der healthcheck ist die Ursache aber vielfaeltiger
                        log.error(FILENAME + ' no envelope');
                    }
                } else{
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


/*
 zum Testen
 */
//var Intervall=setInterval(function() {sendeWebSocketNachricht()},1000)


// Erstelle SIP User-Agent var ua. Hier mit Konfiguration DUE als Empfänger für die Statusnachrichten vom RFD
//Die Übernahme aus der cfg funktioniert in der Produktivumgebung nicht. Callback? 
var ua = new JsSIP.UA(cfg.jsSipConfiguration_DUE);
ua.start();


// Register callbacks to desired message event
var eventHandlers = {
    'succeeded': function (e) {
        log.debug('SIP-Nachricht gesendet.')
    },
    'failed': function (e) {
        log.error('SIP-Nachricht NICHT gesendet, Details: ' + require('util').inspect(e));
    }
};

var options = {
    'eventHandlers': eventHandlers
};

//SIP User Agent Ereignisse
ua.on('connected', function (e) {
    log.debug(FILENAME + ' Funktion: connected mit SIP-Server: ' + cfg.jsSipConfiguration_DUE.uri)
});

ua.on('connecting', function (e) {
    log.debug(FILENAME + ' Funktion connecting zu SIP-Server: ' + cfg.jsSipConfiguration_DUE.uri)
});

ua.on('registered', function (e) {
    log.debug(FILENAME +' Funktion: registered auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri);
    //sendeNachricht('Bin jetzt Registriert')
    //anruf()
});

ua.on('registrationFailed', function (e) {
    log.error(FILENAME + ' Funktion: registrationFailed auf SIP-Server ' + cfg.jsSipConfiguration_DUE.uri)
});


ua.on('disconnected', function (e) {
    log.debug(FILENAME +' Funktion: Getrennt vom SIP-Server '+ cfg.jsSipConfiguration_DUE.uri)
});

ua.on('newMessage', function (e) {
    log.debug(FILENAME + ' Funktion: newMessage Richtung: ' + e.message.direction);
    log.info(FILENAME + ' Funktion: newMessage Inhalt: ' + e.message.request.body);
    //log.debug('SIP Body: '+e.message.request.body)
    //Sende WebSocket Nachricht beim Senden und Empfangen. Richtung noch einbauen
    exports.sendeWebSocketNachricht(e.message.request.body);
    parser.parseString(e.message.request.body, function (err, result) {
        if (err == null) {
            log.debug(FILENAME + " Funktion: newMessage sip parse result: " + JSON.stringify(result));
            exports.sendeWebSocketNachricht(result)
        }
        else {
            log.error(FILENAME + ' Funktion: newMessage keine XML in SIP Nachricht Error=' + err + ' Nachricht=' + e.message.request.body)
        }
    }); //Parser Ende
});


// Erstelle SIP User-Agent var ua. Hier mit Konfiguration RFD Mock als SENDER für die Test Statusnachrichten zum DUE
var mockRFD = new JsSIP.UA(cfg.jsSipConfiguration_mockRFD);
mockRFD.start();

// GET-Aufruf fuer SIP-Message: http://10.22.30.1:3000/mockmessage?messageText=%3CFSTSTATUS+id%3D%221-H-RFD-BHVVTA-FKEK-1%22+state%3D%220%22+channel%3D%22-1%22%2F%3E

//SIP Test Aufrufe
exports.sendeSipNachricht = function (text, callback) {
    var SIPreceiver = cfg.jsSipConfiguration_DUE.uri.replace("sip:", "");
    log.debug("sendeSipNachricht an " + SIPreceiver + " : " + text);
    try {
        mockRFD.sendMessage(SIPreceiver, text, options);
        callback('OK', text);
    } catch (e) {
        log.error("unable to call mockRFD.sendMessage()");
        //log.error(JSON.stringify(e));
        callback('ERROR', e);
    }
};
exports.anruf = function () {
    ua.call(cfg.jsSipConfiguration.testReceiverCall)
};

//SIP User Agent Ereignisse
mockRFD.on('connected', function (e) {
    log.debug(FILENAME + ' Funktion: mockRFD Verbunden mit SIP-Server '+ cfg.jsSipConfiguration_mockRFD.uri)
});

mockRFD.on('connecting', function (e) {
    log.debug(FILENAME + ' Funktion: mockRFD Verbinde zu SIP-Server... '+ cfg.jsSipConfiguration_mockRFD.uri)
});

mockRFD.on('registered', function (e) {
    log.debug(FILENAME + ' Funktion: mockRFD Registriert auf SIP-Server '+ cfg.jsSipConfiguration_mockRFD.uri);
    //sendeNachricht('Bin jetzt Registriert')
    //anruf()
});
