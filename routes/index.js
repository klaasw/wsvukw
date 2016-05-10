var express = require('express');
var router = express.Router();

var log = require('../log.js'); // Modul fuer verbessertes Logging
var util = require('util');

// TODO: wird nicht benutzt:
var inspect = require('eyes').inspector({
    styles: {},
    maxLength: 16000
}); //Inspektor fuer Variablen

var files = require('fs'); // Zugriff auf das Dateisystem
var request = require('request'); //Modul zu Abfrage von WebServices
var xml2js = require('xml2js'); // zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({
    explicitRoot: false
}); // Parserkonfiguration

var cfg = require('../cfg.js');

FILENAME = __filename.slice(__dirname.length + 1);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

/* GET UKW uebersicht */
router.get('/overview', function (req, res) {
    res.render('ukwOverview', {
        funkstellen: Funkstellen2
    })
});

/* GET Zuordnung */
router.get('/zuordnung', function (req, res) {
    findeApNachIp(req.ip, function (benutzer) { //Arbeitsplatz aus Konfig lesen
        if (benutzer) {
            log.info(FILENAME + ' Funktion router.get /zuordnung Arbeitsplatz gefunden! IP: ' + req.ip);
            // TODO: ueberpruefen, ob hier das richte uebergebn wird:
            erstelleKonfigFuerLotsenKanal(benutzer, false, function (konfig) {
                //Uebergebe Funkstellen ID an Jade Template
                log.info(FILENAME + ' Funktion router.get /zuordnung Konfig: ' + konfig);
                res.render('zuordnung', {

                    gesamteKonfig: konfig

                }); //res send ende
            }); //erstelleKonfigFurAp Ende
        } //if Ende
    }); //findeApNachIp Ende
});

/* GET UKW uebersicht */
router.get('/testen', function (req, res) {
    res.render('testen', {
        funkstellen: Funkstellen2
    })
});

/* GET UKW Display */
router.get('/ukw', function (req, res) {
    log.debug(req.ip);
    findeApNachIp(req.ip, function (benutzer) { //Arbeitsplatz aus Konfig lesen
        if (benutzer) {
            log.debug(FILENAME + ' Arbeitsplatz gefunden! IP: ' + req.ip);
            erstelleKonfigFurAp2(benutzer, function (konfig) {
                //Uebergebe Funkstellen ID an Jade Template
                log.info(konfig.FunkstellenDetails[konfig.FunkstellenReihe['Button11'][0]]);
                //ukwDisplay --> zum Testen eines neuen Layouts
                res.render('ukwDisplay', {

                    gesamteKonfig: konfig

                }); //res send ende
            }); //erstelleKonfigFurAp Ende
        } //if Ende
    }); //findeApNachIp Ende


}); //router Ende


/* GET UKW Konfiguration*/
router.get('/ukwKonfig', function (req, res) {
    log.info(FILENAME + ' Funktion: router get /ukwKonfig von IP: ' + req.ip);
    log.info(FILENAME + ' Funktion: router get /ukwKonfig von IP als Parameter: '+JSON.stringify(req.query));
    //var Ap=findeApNachIp(req.ip)//Arbeitsplatz aus Konfig lesen
    //var Ap_test=findeApNachIp(req.query.ip)
    //log.debug(findeApNachIp(req.ip))
    //log.debug(findeApNachIp(req.query.ip))

    // /ukwKonfig mit Parameter z.B. ukwKonfig?ip=1.1.1.1
    if (req.query.ip) {
        if (req.query.ip == '1.1.1.1') {
            var Konfig = {
                FunkstellenReihe: [],
                FunkstellenDetails: {},
                ArbeitsplatzGeraete: {},
                MhanZuordnung: {}
            };
            for (t = 0; t < Funkstellen2.length; t++) {
                log.debug(Funkstellen2[t].id);
                Konfig.FunkstellenDetails[Funkstellen2[t].id] = findeFstNachId(Funkstellen2[t].id); ///ab HIER wweiter-------------------------------------------

            }
            res.send(Konfig)
        } else {
            findeApNachIp(req.query.ip, function (benutzer) {
                if (benutzer) {
                    log.debug(FILENAME + ' Benutzer zu IP  = ' + benutzer + ' ' + req.query.ip);
                    //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                    erstelleKonfigFurAp2(benutzer, function (Konfig) {
                        res.send(Konfig)
                    })
                } else {
                    log.error(FILENAME + ' 1 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
                    res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
                }
            })
        }
    }

    // /ukwKonfig mit Parameter ?zuordnung=lotse
    if (req.query.zuordnung) {
        if (req.query.zuordnung == 'lotse') {
            findeApNachIp(req.ip, function (benutzer) {
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
            })
        }
    }

    // ukwkonfig ohne parameter
    else {
        findeApNachIp(req.ip, function (benutzer) {
            if (benutzer) {
                log.debug(FILENAME + ' Funktion: router get /ukwKonfig ermittelter User: '+benutzer);
                //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                // TODO: testen, ob hier das richtige passiert
                erstelleKonfigFurAp2(benutzer,function(Konfig){
                // Test wg Lotse erstelleKonfigFuerLotsenKanal(benutzer, false, function (Konfig) {
                    res.send({
                        'Konfigdaten':Konfig,
                        'Arbeitsplatz':benutzer
                    })
                })

                }
            else {
                log.error(FILENAME + ' 2 Benutzer nicht konfiguriert fuer IP ' + req.query.ip);
                res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
            }

        })

    }
});//Router /ukwKonfig Ende


/*
 files.readFile("funkstellen.json", 'utf8', function (err, data) {
 if (err) throw err;
 log.debug(FILENAME + ' Funkstellen geladen: ');
 log.debug(JSON.parse(data));
 Funkstellen2=JSON.parse(data)
 })*/

/* Funkstellen vom RFD einlesen



 */
function leseRfdTopologie() {

    var parameterRfdWebService = {
        url: cfg.urlRFDWebservice,
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml;charset=UTF-8;',
            'SOAPAction': 'GetTopologyForRFD' //NOch beachten in WS Aufrufen
        },
        body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:strg="http://strg.rfd.dma.schnoor.de/"><soapenv:Header/><soapenv:Body><strg:GetTopologyForRFD/></soapenv:Body></soapenv:Envelope>'
    };

    request(parameterRfdWebService, function (error, response, body) {
        if (error) {
            log.error(FILENAME + ' RFD WebService Topologie nicht erreichbar ' + error)
        }
        //log.debug(response)
        //log.debug(body)
        //Response paarsen
        else { //Ausfuehren wenn RFD erreichbar
            parser.parseString(body, function (err, result) {
                if (result !== undefined) {
                    log.info(FILENAME + ' parser.parseString result=' + result);
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
                            Funkstellen2.push(tmp)

                        }

                        //HK-Anlagenauslesen und in Funkstellen variable schreiben
                        FstHK = result['FKHK'];
                        for (i = 0; i < FstHK.length; i++) {
                            //log.debug(FstEK[i]['$'])
                            tmp = FstHK[i]['$'];
                            tmp.MKA = false;
                            //log.debug(tmp)
                            Funkstellen2.push(tmp)

                        }

                        //Mehrkanal-Anlagenauslesen und in Funkstellen variable schreiben
                        FstMK = result['FKMK'];
                        for (i = 0; i < FstMK.length; i++) {
                            //log.debug(FstMK[i]['$'])
                            tmp = FstMK[i]['$'];
                            tmp.MKA = true;
                            //log.debug(tmp)
                            Funkstellen2.push(tmp)

                        }

                        //log.debug(Funkstellen2)
                        //log.debug(result['FKMK'])
                        //log.debug(result['SPAN'])
                        //log.debug(result['MHAN'])


                    }); //Parser 2 ende
                } // if ende
            }); // Parser ende
        } // Else ende

    }); // Request ende

}
var Funkstellen2 = [];

leseRfdTopologie();

/* Todo Variabeln fuer Callback setzten, sonst funktionieren bedingungen und schleifen nicht
 *
 *
 *
 */
function findeApNachIp(ip, callback) {
    var alle_Ap = '';
    var Ap = '';
    files.readFile("config/users/arbeitsplaetze.json", 'utf8', function (err, data) {
        if (err)
            throw err;
        log.debug(JSON.stringify(data));
        alle_Ap = JSON.parse(data);

        for (i = 0; i < alle_Ap.length; i++) {
            //Benutzer gefunden
            if (ip in alle_Ap[i]) {
                log.debug(FILENAME + ' Benutzer gefunden: ' + alle_Ap[i][ip].user);
                Ap = alle_Ap[i][ip].user;
                break;
            } else { //Benutzer NICHT gefunden
                log.error(FILENAME + ' Benutzer NICHT gefunden zu IP: ' + ip);
                //callback(null)
            }

        } //for Ende
        callback(Ap)
    })

}

function findeFstNachId(Id) {
    for (i = 0; i < Funkstellen2.length; i++) {
        if (Funkstellen2[i].id == Id) {
            //log.debug(Funkstellen2[i],i)
            return Funkstellen2[i]
        }

    }
    log.error("Funkstellen ID nicht vorhanden: " + Id);
    return 'frei'
}

//findeApNachIp('192.168.56.1')
//findeFstNachId('1-H-RFD-TETTEN-FKEK-3')
//erstelleKonfigFurAp('tttt')

function erstelleKonfigFurAp2(Ap, callback) {

    //Bilde temporaeres Objekt um Funkstelle als Value hinzuzufuegen
    var tmpArr = [];
    var Konfig = {
        FunkstellenReihe: [],
        FunkstellenDetails: {},
        ArbeitsplatzGeraete: {},
        MhanZuordnung: {}
    };

    log.debug(FILENAME + ' uebergebener Arbeitsplatz: ' + Ap);
    var rev_ap = Ap.split(" ");
    log.debug(rev_ap);

    //1. Funkkstellen fuer Revier einlesen
    //Dateinamen noch durch Variable ersetzen
    files.readFile("config/" + rev_ap[0] + ".json", 'utf8', function (err, data) {
        if (err) {
            log.error(FILENAME + ' Datei nicht vorhanden: ' + err)

        }

        log.debug(FILENAME + ' gelesene Daten: ' + util.inspect(data));
        fstReihe = JSON.parse(data);
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
        files.readFile("config/" + rev_ap[0] + "_" + rev_ap[1] + ".json", 'utf8', function (err, data) {
            if (err)
                throw err;
            //log.debug(FILENAME + ' gelesene Daten: '+JSON.parse(data));
            //inspect(data)
            Konfig.ArbeitsplatzGeraete = JSON.parse(data);
            //inspect(Konfig)


            //3. MHAN Zuordnung fuer Arbeitsplatz einlesen
            //Dateinamen noch durch Variable ersetzen
            files.readFile("config/" + rev_ap[0] + "_" + rev_ap[1] + "_mhan_zuordnung.json", 'utf8', function (err, data) {
                if (err) {
                    log.info(FILENAME + ' Funktion: erstelleKonfigFurAp2 MHAN Zuordnung: keine MhanZuordnung: ' + rev_ap)

                } else {
                    log.info(FILENAME + ' Funktion: erstelleKonfigFurAp2 MHAN Zuordnung: ' + util.inspect(data));
                    Konfig.MhanZuordnung = JSON.parse(data)
                }

                //----------------------------------------------------------------------------------------
                //Hier die Callback fuer die Res.send einbauen, die die Rueckmeldung aus Konfig benoetigt

                callback(Konfig)
            }); //3. filesRead  MHAN Zuordnung
        }); //2. filesRead AP Geraete
    }); // 1. filesRead Revier


} //Funktion Ende

//Beschreibung der Funktion erstellen.....
//
function erstelleKonfigFuerLotsenKanal(Ap, standard, callback) {
    var Konfig = {
        FunkstellenReihe: [],
        FunkstellenDetails: {},
        LotsenAp: {},
        MhanZuordnung: {}
    };
    

    log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal erhaltener Arbeitsplatz: ' + Ap);
    var rev_ap = Ap.split(" ");
    standardbenutzer = standard ? '' : '_benutzer';  // wenn standard == true, dann default Einstellungen laden, wenn false dann _benutzer Einstellungen laden

    //1. Funkkstellen fuer Revier einlesen
    //Dateinamen noch durch Variable ersetzen, hier zum Lesen der VTA fuer das Revier
    files.readFile("config/" + rev_ap[0] + ".json", 'utf8', function (err, data) {  //rev_ap[0] = Revieranteil
        if (err) {
            log.error(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + rev_ap[0] + ') Datei nicht vorhanden: ' + err)
        }

        log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + rev_ap[0] + ') gelesene Daten: ' + util.inspect(data));
        fstReihe = JSON.parse(data);
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
                weitereDatei = files.statSync("config/" + rev_ap[0] + "_Lotse" + i + ".json").isFile();
                tmp = files.readFileSync("config/" + rev_ap[0] + "_Lotse" + i + standardbenutzer + ".json", 'utf8');
                log.debug(FILENAME + ' Funktion erstelleKonfigFuerLotsenKanal gelesene Daten: ' + util.inspect(tmp));
                Konfig.LotsenAp[rev_ap[0] + "_Lotse" + i] = JSON.parse(tmp)

            } catch (error) {
                //log.debug(error)
                log.debug(FILENAME + ' keine weitere Datei');
                callback(Konfig);
                return
            }
            i++; //pruefen ob noch benoetigt!
        } //While Ende


    }); //1. Read Ende
} //Funktion Ende


module.exports = router;
