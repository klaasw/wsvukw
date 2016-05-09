var express = require('express');
var JsSIP = require('jssip'); //Javascript SIP Uaser Agent
var http = require('http');
var request = require('request'); //Modul zu Abfrage von WebServices
var inspect = require('eyes').inspector({styles: {}, maxLength: 16000}); //Inspektor fuer Variablen
var xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({explicitRoot: true});// Parserkonfiguration
var log = require('../log.js');

var cfg = require('../cfg.js');

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
    request(cfg.urlRFDWebservice, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            log.info(FILENAME + ' RFD WebService erreichbar')
        }
    })
};
// Setze Intervall fuer Pruefung
//var Intervall=setInterval(function() {pruefeRfdWS()},1000)


/*Block zur Implementierung der WebService Abfragen an RFD
 *
 *
 *
 *
 */
exports.sendeWebServiceNachricht = function (Fst, Span_Mhan, aktion, Kanal) {
    var parameterRfdWebService = {
        url: urlRFDWebservice,
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


    request(parameterRfdWebService, function (error, response, body) {
        log.info(FILENAME + ' Funktion: sendeWebServiceNachricht request mit Parameter: ' + JSON.stringify(parameterRfdWebService));
        if (error) {
            log.info(FILENAME + ' Funktion: sendeWebServiceNachricht request ' + 'Msg: RFD WebService nicht erreichbar. Aktion: ' + aktion, {
                uebergabe: parameterRfdWebService,
                nodeMsg: error
            });
            //log.info('RFD '+aktion+' fehlgeschlagen')

            sendeWebNachricht('RFD ' + aktion + ' fehlgeschlagen')

        }
        else {
            parser.parseString(body, function (err, result) {
                if (result !== undefined && result !== null && typeof result === 'object') {
                    if (result['S:Envelope'] !== undefined) {
                        log.info(FILENAME + ' Funktion: sendeWebServiceNachricht response: ' + JSON.stringify(result));
                        //console.log(result['S:Envelope'])
                        //console.log(result['S:Envelope']['S:Body'][0]['ns2:'+aktion+'Response'][0])

                        erfolgreich = result['S:Envelope']['S:Body'][0]['ns2:' + aktion + 'Response'][0]['return'][0];
                        if (erfolgreich === 'true') {
                            sendeWebNachricht(antwortFuerWebsocket)
                        }
                        else {
                            log.error('RFD ' + aktion + ' fehlgeschlagen');
                            sendeWebNachricht('RFD ' + aktion + ' fehlgeschlagen')
                        }
                    }
                }
            }); // Parser ende
        }// ELse ende
    }); // Request ende
};


exports.sendeWebNachricht = function (SIPNachricht) {
    io.emit('test', SIPNachricht);
    log.info(FILENAME + ' Funktion: sendeWebNachricht ' + 'Msg: WebSocket Nachricht: ' + util.inspect(SIPNachricht))
};

exports.sendeWebNachricht2 = function (SIPNachricht) {
    io.emit('test', SIPNachricht);
};

/*
 zum Testen
 */
//var Intervall=setInterval(function() {sendeWebNachricht()},1000)


// Create our JsSIP instance and run it:
var ua = new JsSIP.UA(cfg.jsSipConfiguration);
ua.start();


var text = 'Hello Bob!';

// Register callbacks to desired message event
var eventHandlers = {
    'succeeded': function (e) {
        log.debug('Nachricht gesendet')
    },
    'failed': function (e) {
        log.error('Nachricht NICHT gesendet')
    }
};

var options = {
    'eventHandlers': eventHandlers
};


//SIP Aufrufe
function sendeSipNachricht(text) {
    ua.sendMessage('sip:rfd@192.168.56.102:5060', text, options);
}


function anruf() {
    ua.call('sip:test@192.168.56.103')
}


//SIP User Agent Ereignisse
ua.on('connected', function (e) {
    log.debug('Verbunden mit SIP-Server')

});

ua.on('connecting', function (e) {
    log.debug('Verbinde zu SIP-Server...')

});

ua.on('registered', function (e) {
    log.debug('Registriert auf SIP-Server');
    //sendeNachricht('Bin jetzt Registriert')
    //anruf()
});

ua.on('registrationFailed', function (e) {
    log.error('Registrierungsfehler auf SIP-Server')

});


ua.on('disconnected', function (e) {
    log.debug('Getrennt vom SIP-Server')
});

ua.on('newMessage', function (e) {
    log.debug('neue SIP Nachricht');
    log.debug('SIP Richtung: ' + e.message.direction);
    log.info(FILENAME + ' Funktion: newSipMessage : ' + e.message.request.body);
    //log.debug('SIP Body: '+e.message.request.body)
    //Sende WebSocket Nachricht beim Senden und Empfangen. Richtung noch einbauen
    sendeWebNachricht(e.message.request.body);
    parser.parseString(e.message.request.body, function (err, result) {
        log.error(err);
        if (err == null) {
            log.error(result);

            sendeWebNachricht(result)
        }
        else {
            log.error('keine XML in SIP Nachricht Error=' + err + ' Nachricht=' + e.message.request.body)
        }
    }); //Parser Ende
});