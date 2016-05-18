var express = require('express');
var router = express.Router();
var util = require('util');
var files = require('fs'); // Zugriff auf das Dateisystem
var request = require('request'); //Modul zu Abfrage von WebServices
var xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({
    explicitRoot: false
}); // Parserkonfiguration

var cfg = require('../cfg.js');

var log = require('../log.js'); // Modul fuer verbessertes Logging
FILENAME = __filename.slice(__dirname.length + 1);

var ukw = require('../ukw.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/ukw');
});

/* GET UKW uebersicht */
router.get('/overview', function (req, res) {
    if(Funkstellen.length==0) {
        log.error('Topologie nicht eingelesen, wird aber jetzt gebraucht, mit Fehler antworten!');
        res.status(404)        // HTTP status 404: NotFound
            .send('ukwKonfig konnte nicht geladen werden.');
    }else{
        res.render('ukwOverview', {
            "funkstellen": Funkstellen
        })
    }
});

/* GET Zuordnung */
router.get('/zuordnung', function (req, res) {
    var benutzer = findeApNachIp(req.ip); //Arbeitsplatz aus Konfig lesen
    if (benutzer) {
        log.info(FILENAME + ' Funktion router.get /zuordnung Arbeitsplatz gefunden! IP: ' + req.ip);
        // TODO: ueberpruefen, ob hier das richte uebergeben wird:
        erstelleKonfigFuerLotsenKanal(benutzer, false, function (konfig) {
            //Uebergebe Funkstellen ID an Jade Template
            log.info(FILENAME + ' Funktion router.get /zuordnung Konfig: ' + konfig);
            res.render('zuordnung', {

                "gesamteKonfig": konfig

            }); //res send ende
        }); //erstelleKonfigFurAp Ende
    } //if Ende
});

/* GET UKW uebersicht */
router.get('/testen', function (req, res) {
    res.render('testen', {
        "funkstellen": Funkstellen
    })
});

/* GET UKW Display */
router.get('/ukw', function (req, res) {
    log.debug(req.ip);
    var benutzer = findeApNachIp(req.ip); //Arbeitsplatz aus Konfig lesen
    if (benutzer) {
        log.debug(FILENAME + ' Arbeitsplatz gefunden! IP: ' + req.ip);
        erstelleKonfigFurAp(benutzer, function (konfig) {
            //Uebergebe Funkstellen ID an Jade Template
            log.info(konfig.FunkstellenDetails[konfig.FunkstellenReihe['Button11'][0]]);
            //ukwDisplay --> zum Testen eines neuen Layouts
            res.render('ukwDisplay', {
                "log": log,  // logging auch im Jade-Template moeglich!
                "gesamteKonfig": konfig

            }); //res send ende
        }); //erstelleKonfigFurAp Ende
    } //if Ende

    //kein Benutzer zu IP gefunden
    else {
        res.render('error', {
            message: 'keine Benutzer konfiguriert zu IP: ' + req.ip,
            error: {
                status: 'kein'
            }
        })
    }
}); //router Ende

/* GET UKW Display Kleine Schaltflaechen*/
router.get('/ukw_kl', function (req, res) {
    log.debug(req.ip);
    var benutzer = findeApNachIp(req.ip); //Arbeitsplatz aus Konfig lesen
    if (benutzer) {
        log.debug(FILENAME + ' Arbeitsplatz gefunden! IP: ' + req.ip);
        erstelleKonfigFurAp(benutzer, function (konfig) {
            //Uebergebe Funkstellen ID an Jade Template
            log.info(konfig.FunkstellenDetails[konfig.FunkstellenReihe['Button11'][0]]);
            //ukwDisplay --> zum Testen eines neuen Layouts
            res.render('ukwDisplayKlein', {

                "gesamteKonfig": konfig

            }); //res send ende
        }); //erstelleKonfigFurAp Ende
    } //if Ende

    //kein Benutzer zu IP gefunden
    else {
        res.render('error', {
            message: 'keine Benutzer konfiguriert zu IP: ' + req.ip,
            error: {
                status: 'kein'
            }
        })
    }
}); //router Ende


/* GET UKW Display grosse Schaltflaechen*/
router.get('/ukw_gr', function (req, res) {
    log.debug(req.ip);
    var benutzer = findeApNachIp(req.ip); //Arbeitsplatz aus Konfig lesen
    if (benutzer) {
        log.debug(FILENAME + ' Arbeitsplatz gefunden! IP: ' + req.ip);
        erstelleKonfigFurAp(benutzer, function (konfig) {
            //Uebergebe Funkstellen ID an Jade Template
            log.info(konfig.FunkstellenDetails[konfig.FunkstellenReihe['Button11'][0]]);
            //ukwDisplay --> zum Testen eines neuen Layouts
            res.render('ukwDisplayGross', {

                "gesamteKonfig": konfig

            }); //res send ende
        }); //erstelleKonfigFurAp Ende
    } //if Ende

    //kein Benutzer zu IP gefunden
    else {
        res.render('error', {
            message: 'keine Benutzer konfiguriert zu IP: ' + req.ip,
            error: {
                status: 'kein'
            }
        })
    }
}); //router Ende

/* GET UKW Konfiguration
*
* TODO wenn die Konfiguration noch nicht eingelesen ist in Funkstellen, dann warten bis verfuegbar, nach Timeout mit Fehler antworten, Fehlerhandling clientseitig
* */
router.get('/ukwKonfig', function (req, res) {
    log.info(FILENAME + ' Funktion: router get /ukwKonfig von IP: ' + req.ip);
    log.info(FILENAME + ' Funktion: router get /ukwKonfig von IP als Parameter: ' + JSON.stringify(req.query));
    //var Ap=findeApNachIp(req.ip)//Arbeitsplatz aus Konfig lesen
    //var Ap_test=findeApNachIp(req.query.ip)
    //log.debug(findeApNachIp(req.ip))
    //log.debug(findeApNachIp(req.query.ip))

    if(Funkstellen.length==0){
        log.error('Topologie nicht eingelesen, wird aber jetzt gebraucht, mit Fehler antworten!');
        res.status(404)        // HTTP status 404: NotFound
            .send('ukwKonfig konnte nicht geladen werden.');
    } else {
        // /ukwKonfig mit Parameter z.B. ukwKonfig?ip=1.1.1.1
        if (req.query.ip) {
            if (req.query.ip == '1.1.1.1') {
                var Konfig = {
                    FunkstellenReihe: [],
                    FunkstellenDetails: {},
                    ArbeitsplatzGeraete: {},
                    MhanZuordnung: {},
                    IpConfig: cfg
                };
                for (t = 0; t < Funkstellen.length; t++) {
                    log.debug(Funkstellen[t].id);
                    Konfig.FunkstellenDetails[Funkstellen[t].id] = findeFstNachId(Funkstellen[t].id); ///ab HIER weiter-------------------------------------------

                }
                res.send(Konfig)
            } else {
                var benutzer = findeApNachIp(req.query.ip);
                if (benutzer) {
                    log.debug(FILENAME + ' Benutzer zu IP  = ' + benutzer + ' ' + req.query.ip);
                    //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                    erstelleKonfigFurAp(benutzer, function (Konfig) {
                        res.send(Konfig)
                    })
                } else {
                    log.error(FILENAME + ' 1 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
                    res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
                }
            }
        }

        // /ukwKonfig mit Parameter ?zuordnung=lotse
        if (req.query.zuordnung) {
            if (req.query.zuordnung == 'lotse') {
                var benutzer = findeApNachIp(req.ip);
                if (benutzer) {
                    if (req.query.standard == 'true') {
                        erstelleKonfigFuerLotsenKanal(benutzer, 'true', function (Konfig) {
                            res.send(Konfig)
                        })
                    }
                    if (req.query.standard == 'false') {
                        erstelleKonfigFuerLotsenKanal(benutzer, 'false', function (Konfig) {
                            res.send(Konfig)
                        })
                    }
                }
            }
        }

        // ukwkonfig ohne parameter
        else {
            var benutzer = findeApNachIp(req.ip);
            if (benutzer) {
                log.debug(FILENAME + ' Funktion: router get /ukwKonfig ermittelter User: ' + benutzer);
                //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                // TODO: testen, ob hier das richtige passiert
                erstelleKonfigFurAp(benutzer, function (Konfig) {
                    // Test wg Lotse erstelleKonfigFuerLotsenKanal(benutzer, false, function (Konfig) {
                    res.send({
                        'Konfigdaten': Konfig,
                        'Arbeitsplatz': benutzer
                    })
                })

            }
            else {
                log.error(FILENAME + ' 2 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
                res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
            }
        }
    } // if(Funkstellen.length==0)

});//Router /ukwKonfig Ende

router.get('/liesTopologie', function (req, res) {
    log.info(FILENAME + ' Topologie neu einlesen.');
    leseRfdTopologie(function () {
        res.send(Funkstellen);
    })
});

router.get('/mockmessage', function (req, res) {
    //log.debug(FILENAME + ' mockmessage von IP: ' + req.ip + ", message: "+ require('util').inspect( req) );
    log.debug(FILENAME + ' mockmessage messageText: '+ req.query.messageText);
    ukw.sendeSipNachricht(req.query.messageText, function (result, error) {
        if(result=='OK'){
            res.send("abgesendet - ok");
        } else{
            res.send("abgesendet, fehler: "+ e.prototype.message);
        }

    });

});

/*
 files.readFile("funkstellen.json", 'utf8', function (err, data) {
 if (err) throw err;
 log.debug(FILENAME + ' Funkstellen geladen: ');
 log.debug(JSON.parse(data));
 Funkstellen=JSON.parse(data)
 })*/

/* Funkstellen vom RFD einlesen
 */
function leseRfdTopologie(callback) {

    var parameterRfdWebService = {
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
            log.error(FILENAME + ' RFD WebService Topologie nicht erreichbar ' + error)
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
                    ergebnis1cdata = result['S:Body'][0]['ns2:GetTopologyForRFDResponse'][0]['return'][0];
                    //CDATA Objekt der Response erneut parsen
                    parser.parseString(ergebnis1cdata, function (err, result) {
                        //Einzelkanal-Anlagenauslesen und in Funkstellen variable schreiben
                        FstEK = result['FKEK'];
                        for (var i = 0; i < FstEK.length; i++) {
                            //log.debug(FstEK[i]['$'])
                            tmp = FstEK[i]['$'];
                            tmp.MKA = false;
                            //log.debug(tmp)
                            Funkstellen.push(tmp)

                        }

                        //HK-Anlagenauslesen und in Funkstellen variable schreiben
                        FstHK = result['FKHK'];
                        for (i = 0; i < FstHK.length; i++) {
                            //log.debug(FstEK[i]['$'])
                            tmp = FstHK[i]['$'];
                            tmp.MKA = false;
                            //log.debug(tmp)
                            Funkstellen.push(tmp)

                        }

                        //Mehrkanal-Anlagenauslesen und in Funkstellen variable schreiben
                        FstMK = result['FKMK'];
                        for (i = 0; i < FstMK.length; i++) {
                            //log.debug(FstMK[i]['$'])
                            tmp = FstMK[i]['$'];
                            tmp.MKA = true;
                            //log.debug(tmp)
                            Funkstellen.push(tmp)

                        }
                        
                        //Gleichwellen-Anlagen auslesen und in Funkstellen variable schreiben
                        FstGW = result['FKGW'];
                        for (i = 0; i < FstGW.length; i++) {
                            //log.debug(FstMK[i]['$'])
                            tmp = FstGW[i]['$'];
                            tmp.MKA = false;
                            tmp.GW = true;
                            //log.debug(tmp)
                            Funkstellen.push(tmp)

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
var Funkstellen = [];

leseRfdTopologie(function () {
});
/* Todo Variabeln fuer Callback setzten, sonst funktionieren bedingungen und schleifen nicht
 *
 *
 *
 */
function findeApNachIp(ip) {
    var Ap = '';

    var alle_Ap = require(cfg.configPath + '/users/arbeitsplaetze.json');
    log.debug(alle_Ap);

    for (i = 0; i < alle_Ap.length; i++) {
        //Benutzer gefunden
        if (ip in alle_Ap[i]) {
            log.debug(FILENAME + ' Benutzer gefunden: ' + alle_Ap[i][ip].user);
            Ap = alle_Ap[i][ip].user;
            break;
        }
    } //for Ende
    if (Ap == '') {
        log.error(FILENAME + ' Benutzer NICHT gefunden zu IP: ' + ip);
    }
    return Ap
}

function findeFstNachId(Id) {
    if (Id === undefined || Id == 'frei' || Id == '') {
        return 'frei'
    } else {
        for (i = 0; i < Funkstellen.length; i++) {
            if (Funkstellen[i].id == Id) {
                //log.debug(Funkstellen[i],i)
                return Funkstellen[i]
            }
        }
    }

    log.error("Funkstellen ID nicht vorhanden: '" + Id + "'");
    return 'frei'
}

function erstelleKonfigFurAp(Ap, callback) {

    //Bilde temporaeres Objekt um Funkstelle als Value hinzuzufuegen
    var tmpArr = [];
    var Konfig = {
        FunkstellenReihe: [],
        FunkstellenDetails: {},
        ArbeitsplatzGeraete: {},
        MhanZuordnung: {},
        IpConfig: cfg
    };

    log.debug(FILENAME + ' uebergebener Arbeitsplatz: ' + Ap);
    var rev_ap = Ap.split(" ");
    log.debug(rev_ap);

    //1. Funkkstellen fuer Revier einlesen
    //Dateinamen noch durch Variable ersetzen
    fstReihe = require(cfg.configPath + rev_ap[0] + '.json');
    //Durch JA ueber Buttons iterieren
    for (var button in fstReihe) {
        log.debug(button + '  ' + fstReihe[button]);
        //Durch Funkstelln in Buttons iterien
        for (t = 0; t < fstReihe[button].length; t++) {
            //Funkstellendetails schreiben
            Konfig.FunkstellenDetails[fstReihe[button][t]] = findeFstNachId(fstReihe[button][t])
        }
    }

    Konfig.FunkstellenReihe = fstReihe;
    //log.debug("FertigeKonfig:"+Konfig.FunkstellenDetails)
    //log.debug(FILENAME + ' ----------------------------------------------------------------------')
    //inspect(Konfig)
    //log.debug(FILENAME + ' ----------------------------------------------------------------------')

    //2. Geraete fuer Arbeitsplatz einlesen
    //Dateinamen noch durch Variable ersetzen
    Konfig.ArbeitsplatzGeraete = require((cfg.configPath + rev_ap[0] + "_" + rev_ap[1] + ".json"));
    //3. MHAN Zuordnung fuer Arbeitsplatz einlesen
    //Dateinamen noch durch Variable ersetzen
    Konfig.MhanZuordnung = require(cfg.configPath + rev_ap[0] + "_" + rev_ap[1] + "_mhan_zuordnung.json");

    //----------------------------------------------------------------------------------------
    //Hier die Callback fuer die Res.send einbauen, die die Rueckmeldung aus Konfig benoetigt

    callback(Konfig);
} //Funktion Ende

//Beschreibung der Funktion erstellen.....
//
function erstelleKonfigFuerLotsenKanal(Ap, standard, callback) {
    var Konfig = {
        FunkstellenReihe: [],
        FunkstellenDetails: {},
        LotsenAp: {},
        MhanZuordnung: {},
        IpConfig: cfg
    };


    log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal erhaltener Arbeitsplatz: ' + Ap);
    var rev_ap = Ap.split(" ");
    standardbenutzer = standard ? '' : '_benutzer';  // wenn standard == true, dann default Einstellungen laden, wenn false dann _benutzer Einstellungen laden

    //1. Funkkstellen fuer Revier einlesen
    //Dateinamen noch durch Variable ersetzen, hier zum Lesen der VTA fuer das Revier
    fstReihe = require(cfg.configPath + rev_ap[0] + ".json");  //rev_ap[0] = Revieranteil
    log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + rev_ap[0] + ') gelesene Daten: ' + fstReihe);
    //Durch JA ueber Buttons iterieren
    for (var button in fstReihe) {
        log.debug(button + '  ' + fstReihe[button]);
        //Durch Funkstelln in Buttons iterien
        for (t = 0; t < fstReihe[button].length; t++) {
            // TODO Funkstellendetails schreiben HIER MEHR ERKLAEREN
            Konfig.FunkstellenDetails[fstReihe[button][t]] = findeFstNachId(fstReihe[button][t])
        }
    }

    //Alle LotsenAP einlesen
    //ueber alle Lotsendateien //JA_Lotse1.json usw. gehen und Inhalt in die Konfig schreiben

    i = 1;
    weitereDatei = true;  //solange true bis keine weitere Datei vorliegt
    while (weitereDatei == true) {
        try {
            weitereDatei = files.statSync(cfg.configPath + rev_ap[0] + "_Lotse" + i + ".json").isFile();
            tmp = files.readFileSync(cfg.configPath + rev_ap[0] + "_Lotse" + i + standardbenutzer + ".json", 'utf8');
            log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal gelesene Daten: ' + util.inspect(tmp));
            Konfig.LotsenAp[rev_ap[0] + "_Lotse" + i] = JSON.parse(tmp)

        } catch (error) {
            //log.debug(error)
            log.debug(FILENAME + ' keine weitere Datei ' + cfg.configPath + rev_ap[0] + '_Lotse' + i + '.json');
            callback(Konfig);
            return
        }
        i++; //pruefen ob noch benoetigt!
    } //While Ende
} //Funktion Ende


module.exports = router;
