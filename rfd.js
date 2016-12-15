'use strict';
 /**
 *  Modul zur Herstellung der Verbindung zum Revierfunkdienst
  * @Author: Bernhard Rischke on 15.12.2016.
 */
const cfg = require('./cfg.js');
const log = require('./log.js'); // Modul fuer verbessertes Logging

const request = require('request'); //Modul zu Abfrage von WebServices
const xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
const parser = new xml2js.Parser({
    explicitRoot: false
}); // Parserkonfiguration

const FILENAME = __filename.slice(__dirname.length + 1);


var Funkstellen = [];

/* Funkstellen vom RFD einlesen
 */
exports.leseRfdTopologie = function (callback) {

    const parameterRfdWebService = {
        url: cfg.urlRFDWebservice,
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml;charset=UTF-8;',
            'SOAPAction': 'GetTopologyForRFD' //Noch beachten in WS Aufrufen
        },
        body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:strg="http://strg.rfd.dma.schnoor.de/"><soapenv:Header/><soapenv:Body><strg:GetTopologyForRFD/></soapenv:Body></soapenv:Envelope>'
    };

    request(parameterRfdWebService, function (error, response, body) {
        if (error) {
            log.error(FILENAME + ' RFD WebService Topologie nicht erreichbar ' + error);
            // TODO: Leseversuch wiederholen, muss spaetestens dann existieren, wenn ein Client sich connecten will
            setTimeout(leseRfdTopologie(function () {
            }), 1000);
        }
        //log.debug(response)
        //log.debug(body)
        //Response paarsen
        else { //Ausfuehren wenn RFD erreichbar
            parser.parseString(body, function (err, result) {
                if (result !== undefined) {
                    log.info(FILENAME + ' LeseTopologie webservice response: ' + JSON.stringify(result).substring(1, 100) + '...');
                    //log.debug(result['S:Body'][0]['ns2:GetTopologyForRFDResponse'][0]['return'][0])
                    const ergebnis1cdata = result['S:Body'][0]['ns2:GetTopologyForRFDResponse'][0]['return'][0];
                    //CDATA Objekt der Response erneut parsen
                    parser.parseString(ergebnis1cdata, function (err, result) {
                        //Einzelkanal-Anlagenauslesen und in Funkstellen variable schreiben
                        if (result['FKEK']) { //Pruefung ob Wert enthalten ist. In Referenz sind z.B. keine HK Anlagen
                            const FstEK = result['FKEK'];
                            for (let i = 0; i < FstEK.length; i++) {
                                //log.debug(FstEK[i]['$'])
                                const tmp = FstEK[i]['$'];
                                tmp.MKA = false;
                                tmp.aufgeschaltet = false; //default Zustand für Varbeitung von Schaltzuständen
                                //log.debug(tmp)
                                //unoetige Variablen entfernen
                                delete tmp.ipaddr;
                                delete tmp.portsip;
                                delete tmp.portrtp;
                                Funkstellen.push(tmp);

                            }
                        }

                        //HK-Anlagenauslesen und in Funkstellen variable schreiben
                        if (result['FKHK']) { //Pruefung ob Wert enthalten ist. In Referenz sind z.B. keine HK Anlagen
                            const FstHK = result['FKHK'];
                            for (let i = 0; i < FstHK.length; i++) {
                                //log.debug(FstEK[i]['$'])
                                const tmp = FstHK[i]['$'];
                                tmp.MKA = false;
                                tmp.aufgeschaltet = false; //default Zustand für Varbeitung von Schaltzuständen
                                //log.debug(tmp)
                                //unoetige Variablen entfernen
                                delete tmp.ipaddr;
                                delete tmp.portsip;
                                delete tmp.portrtp;
                                Funkstellen.push(tmp);

                            }
                        }

                        //Mehrkanal-Anlagenauslesen und in Funkstellen variable schreiben
                        if (result['FKMK']) { //Pruefung ob Wert enthalten ist. In Referenz sind z.B. keine HK Anlagen
                            const FstMK = result['FKMK'];
                            for (let i = 0; i < FstMK.length; i++) {
                                //log.debug(FstMK[i]['$'])
                                const tmp = FstMK[i]['$'];
                                tmp.MKA = true;
                                tmp.aufgeschaltet = false; //default Zustand für Varbeitung von Schaltzuständen
                                //log.debug(tmp)
                                //unoetige Variablen entfernen
                                delete tmp.ipaddr;
                                delete tmp.portsip;
                                delete tmp.portrtp;
                                Funkstellen.push(tmp);

                            }
                        }

                        //Gleichwellen-Anlagen auslesen und in Funkstellen variable schreiben
                        if (result['FKGW']) { //Pruefung ob Wert enthalten ist. In Referenz sind z.B. keine HK Anlagen
                            const FstGW = result['FKGW'];
                            for (let i = 0; i < FstGW.length; i++) {
                                //log.debug(FstMK[i]['$'])
                                const tmp = FstGW[i]['$'];
                                tmp.MKA = false;
                                tmp.GW = true;
                                tmp.aufgeschaltet = false; //default Zustand für Varbeitung von Schaltzuständen
                                //log.debug(tmp)
                                //unoetige Variablen entfernen
                                delete tmp.ipaddr;
                                delete tmp.portsip;
                                delete tmp.portrtp;
                                Funkstellen.push(tmp);

                            }
                        }
                        callback();
                        //log.debug(Funkstellen)
                        //log.debug(result['FKMK'])
                        //log.debug(result['SPAN'])
                        //log.debug(result['MHAN'])


                    }); //Parser 2 ende
                } // if ende
            }); // Parser ende
        } // Else ende

    }); // Request ende

}



//TODO: hier vielleicht auch mit hasOwnProperty die Funkstelle schneller finden als drüber iterieren.

// TODO: hier Datenbankzugriff auf ZustandKOmponenten?
exports.findeFstNachId = function (Id) {
    if (Id === undefined || Id === 'frei' || Id === '') {
        return 'frei';
    }
    else {
        for (let i = 0; i < Funkstellen.length; i++) {
            if (Funkstellen[i].id == Id) {
                //log.debug(Funkstellen[i],i)
                return Funkstellen[i];
            }
        }
    }
    log.error('Funkstellen ID nicht vorhanden: \'' + Id + '\'');
    return 'frei';
}
