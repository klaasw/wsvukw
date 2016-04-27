var express = require('express');
var router = express.Router();
var inspect = require('eyes').inspector({styles: {
            
        },
        maxLength: 16000}); //Inspektor für Variablen
var files = require('fs')// Zugriff auf das Dateisystem
var request = require('request')//Modul zu Abfrage von WebServices
var xml2js = require('xml2js')// zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({explicitRoot: false});// Parserkonfiguration
var test = require('./konfig.js')

var winston = require('winston')// Modul für verbessertes Logging

//neuen logger intanzieren
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        'timestamp':true,
        'prettyPrint':true,
        'colorize':true,
      })
    ]
});

//Dateiname Konstante für Logging
var FILENAME=__filename.slice(__dirname.length + 1)

//aktueller Host des UKW Servers
AKTUELLER_HOST=require('os').networkInterfaces().eth0[0].address
AKTUELLER_HOST_WebSocket='http://'+AKTUELLER_HOST+':3001/socket.io/socket.io.js'

//zugeordneter VTR
var RFDVTR
files.readFile("konfig/konfig.json", 'utf8', function (err, data) {
    if(err){
      logger.error(FILENAME+' Funktion: lese Konfig: konfig.json nicht vorhanden')
    }
    else {
      logger.info(FILENAME+' Funktion: lese Konfig: konfig.json Inhalt: '+ data)
      //RFDVTR setzen
      tmp = JSON.parse(data)
      RFDVTR = tmp.lokalerVtrRFD
      leseRfdTopologie();

    }
    
  })




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET UKW Übersicht */
router.get('/overview', function(req, res) {
	res.render('ukwOverview',{funkstellen: Funkstellen2})
})

/* GET Zuordnung */
router.get('/zuordnung', function(req, res) {
  findeApNachIp(req.ip,function(benutzer){//Arbeitsplatz aus Konfig lesen
      if(benutzer){
        logger.info(FILENAME+ 'Funktion router.get /zuordnung Arbeitsplatz gefunden! IP: ' + req.ip)
        erstelleKonfigFuerLotsenKanal(benutzer, 'false', function(konfig){
          //Übergebe Funkstellen ID an Jade Template
            logger.info(FILENAME+ 'Funktion router.get /zuordnung Konfig: '+konfig)
            res.render('zuordnung',{     
                           gesamteKonfig: konfig, //Verwendung als Variable zur Erstellung der Ansicht 
                           lokalerVtrDUE: AKTUELLER_HOST_WebSocket //Verwendung als Variable in layout.jade
                          })//res send ende
          })//erstelleKonfigFurAp Ende
      }//if Ende
    })//findeApNachIp Ende
})


/* GET UKW Übersicht */
router.get('/testen', function(req, res) {
  res.render('testen',{funkstellen: Funkstellen2})
})



/* GET UKW Display */
router.get('/ukw', function(req, res) {
    logger.info(FILENAME+' Funktion: router get /ukw von IP: '+req.ip);
    
    findeApNachIp(req.ip,function(benutzer){//Arbeitsplatz aus Konfig lesen
      if(benutzer){
      	logger.info(FILENAME+' Funktion: router get /ukw ermittelter User: '+benutzer)
        erstelleKonfigFurAp2(benutzer, function(konfig){
          //Übergebe Funkstellen ID an Jade Template
            console.log(konfig.FunkstellenDetails[konfig.FunkstellenReihe['Button11'][0]])
//ukwDisplay2 --> zum Testen eines neuen Layouts            
            res.render('ukwDisplay2', { 
                                                    
                           gesamteKonfig: konfig,
                           lokalerVtrDUE: AKTUELLER_HOST_WebSocket

                          })//res send ende
          })//erstelleKonfigFurAp Ende
      }//if Ende
    })//findeApNachIp Ende
      
    
});//router Ende




/* GET UKW Konfiguration*/
router.get('/ukwKonfig', function(req, res) {
    logger.info(FILENAME+' Funktion: router get /ukwKonfig von IP: '+req.ip)
    logger.info(FILENAME+' Funktion: router get /ukwKonfig von IP als Parameter: '+JSON.stringify(req.query))
    
    
    //var Ap=findeApNachIp(req.ip)//Arbeitsplatz aus Konfig lesen
    //var Ap_test=findeApNachIp(req.query.ip)
    //console.log(findeApNachIp(req.ip))
    //console.log(findeApNachIp(req.query.ip))
    
    // /ukwKonfig mit Parameter z.B. ukwKonfig?ip=1.1.1.1
     if(req.query.ip){ 
      if(req.query.ip=='1.1.1.1'){
         var Konfig={
		         FunkstellenReihe:[],
		         FunkstellenDetails:{},
		         ArbeitsplatzGeräte:{},
		         MhanZuordnung:{}
	       }
    	
         for ( t = 0; t < Funkstellen2.length; t++) {
		         console.log(Funkstellen2[t].id)
		         Konfig.FunkstellenDetails[Funkstellen2[t].id]=findeFstNachId(Funkstellen2[t].id) ///ab HIER wweiter-------------------------------------------
   
	           };
	       res.send(Konfig)
      }
      else{
          findeApNachIp(req.query.ip,function(benutzer){
        	    if(benutzer){
        	        console.log('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
        	        //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                    erstelleKonfigFurAp2(benutzer,function(Konfig){
  	              	res.send(Konfig)
          
                       })
                  }
                  else{
                      console.log('1 Benutzer nicht konfiguriert für IP '+req.query.ip)
                      res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
              }
          })
      }
    }
    
    // /ukwKonfig mit Parameter ?zuordnung=lotse
    if(req.query.zuordnung){
        if(req.query.zuordnung=='lotse'){
            findeApNachIp(req.ip,function(benutzer){
                if(benutzer){
                    if(req.query.standard=='true'){
                        erstelleKonfigFuerLotsenKanal(benutzer, 'true', function(Konfig){
                            res.send(Konfig)
                        })
                    }
                    if(req.query.standard=='false'){
                        erstelleKonfigFuerLotsenKanal(benutzer, 'false', function(Konfig){
                            res.send(Konfig)
                        })
                    }
                }
            })
        }
    }
    
    // /ukwKonfig ohne Parameter
    else{
        findeApNachIp(req.ip,function(benutzer){
            if(benutzer){
                logger.info(FILENAME+' Funktion: router get /ukwKonfig ermittelter User: '+benutzer)
                //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
                erstelleKonfigFurAp2(benutzer,function(Konfig){
//Test wg Lotse         erstelleKonfigFuerLotsenKanal(benutzer,function(Konfig){
                    res.send(Konfig)

                })
            }
            else{
                console.log('2 Benutzer nicht konfiguriert für IP '+req.query.ip)
                res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
            }
    
        })

    }
});//Router /ukwKonfig Ende


/*
files.readFile("funkstellen.json", 'utf8', function (err, data) {
  if (err) throw err;
  console.log('Funkstellen geladen: ');
  console.log(JSON.parse(data));
  Funkstellen2=JSON.parse(data)
})*/


/* Funkstellen vom RFD einlesen



*/
function leseRfdTopologie(){

var parameterRfdWebService={
  //url:'http://10.92.2.42:8789/I_RFD_DUE_Steuerung',
  url:RFDVTR,
  method:'POST',
  headers: {
      'Content-Type': 'text/xml;charset=UTF-8;',
      'SOAPAction':'GetTopologyForRFD'                      //NOch beachten in WS Aufrufen
  },
  body:'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:strg="http://strg.rfd.dma.schnoor.de/"><soapenv:Header/><soapenv:Body><strg:GetTopologyForRFD/></soapenv:Body></soapenv:Envelope>',
}

request(parameterRfdWebService, function(error, response, body){
    if (error){
      console.log('RFD WebService Topologie nicht erreichbar '+error)
      logger.info('RFD WebService Topologie nicht erreichbar... ')
      }
    //console.log(response)
    //console.log(body)
    //Response paarsen
    else { //Ausführen wenn RFD erreichbar 
    parser.parseString(body, function (err, result) {
      console.log(result)
      //console.log(result['S:Body'][0]['ns2:GetTopologyForRFDResponse'][0]['return'][0])
      ergebnis1cdata=result['S:Body'][0]['ns2:GetTopologyForRFDResponse'][0]['return'][0]
      //CDATA Objekt der Response erneut parsen
      parser.parseString(ergebnis1cdata, function (err, result) {
      	//Einzelkanal-Anlagenauslesen und in Funkstellen variable schreiben
        FstEK=result['FKEK']
        for (var i = 0; i < FstEK.length; i++) {
          //console.log(FstEK[i]['$'])
          tmp=FstEK[i]['$']
          tmp.MKA=false
          //console.log(tmp)
          Funkstellen2.push(tmp)
          
        };
        //HK-Anlagenauslesen und in Funkstellen variable schreiben
        FstHK=result['FKHK']
        for (var i = 0; i < FstHK.length; i++) {
          //console.log(FstEK[i]['$'])
          tmp=FstHK[i]['$']
          tmp.MKA=false
          //console.log(tmp)
          Funkstellen2.push(tmp)
          
        };
        //Mehrkanal-Anlagenauslesen und in Funkstellen variable schreiben
        FstMK=result['FKMK']
        for (var i = 0; i < FstMK.length; i++) {
          //console.log(FstMK[i]['$'])
          tmp=FstMK[i]['$']
          tmp.MKA=true
          //console.log(tmp)
          Funkstellen2.push(tmp)
          
        };
        //console.log(Funkstellen2)
      	//console.log(result['FKMK'])
      	//console.log(result['SPAN'])
      	//console.log(result['MHAN'])



      })//Parser 2 ende
      
    })// Parser ende
    }// Else ende
    
    })// Request ende

}
var Funkstellen2=[];










/* Todo Variabeln für Callback setzten, sonst funktionieren bedingungen und schleifen nicht
*
*
*
*/
function findeApNachIp(ip,callback){
	var alle_Ap='';
	var Ap='';
	files.readFile("arbeitsplaetze.json", 'utf8', function (err, data) {
      if (err) throw err;
      console.log(JSON.parse(data));
      alle_Ap=JSON.parse(data)

        for(i=0;i<alle_Ap.length;i++){
		        //Benutzer gefunden
		        if (ip in alle_Ap[i]){
		        console.log('Benutzer gefunden: '+alle_Ap[i][ip].user)
		        Ap=alle_Ap[i][ip].user;
		        }
	         //Benutzer NICHT gefunden gefunden
	         else{
	           console.log('Benutzer NICHT gefunden zu IP: '+ip)
	           //callback(null)
            }
  
	      }//for Ende
	    callback(Ap)
     })

	
}





function findeFstNachId(Id){
    for(i=0;i<Funkstellen2.length;i++){
		if (Funkstellen2[i].id==Id){
		  //console.log(Funkstellen2[i],i)
		  return Funkstellen2[i]
	     }
	     		
	}
	console.log("Funkstellen ID nicht vorhanden: "+Id)
	return 'frei'	
}




function erstelleKonfigFurAp2(Ap,callback){
	var tmpObj={} //Bilde temporäres Objekt um Funkstelle als Value hinzuzufügen
	var tmpArr=[]
	var Konfig={
		FunkstellenReihe:[],
		FunkstellenDetails:{},
		ArbeitsplatzGeräte:{},
		MhanZuordnung:{}
	}
	
	console.log('übergebener Arbeitsplatz: '+Ap)
    var rev_ap = Ap.split(" ")
    console.log(rev_ap)
    

    //1. Funkkstellen für Revier einlesen
    //Dateinamen noch durch Variable ersetzen
	files.readFile(rev_ap[0]+".json", 'utf8', function (err, data) {
      if (err){
      	console.log('Datei nicht vorhanden: '+err)

      } ;
      
      console.log('gelesene Daten: '+JSON.parse(data));
      fstReihe=JSON.parse(data)
      //Durch JA über Buttons iterieren
      for (var button in fstReihe){
        console.log(button+'  '+fstReihe[button])
        //Durch Funkstelln in Buttons iterien
        for (t=0;t<fstReihe[button].length;t++){
          //Funkstellendetails schreiben
          Konfig.FunkstellenDetails[fstReihe[button][t]]=findeFstNachId(fstReihe[button][t])
        }
      }
      
	    Konfig.FunkstellenReihe=fstReihe
      //console.log("FertigeKonfig:"+Konfig.FunkstellenDetails)
	    //console.log('----------------------------------------------------------------------')
	    //inspect(Konfig)
	    //console.log('----------------------------------------------------------------------')
           
           //2. Geräte für Arbeitsplatz einlesen
           //Dateinamen noch durch Variable ersetzen
           files.readFile(rev_ap[0]+"_"+rev_ap[1]+".json", 'utf8', function (err, data) {
      		  if (err) throw err;
      		  //console.log('gelesene Daten: '+JSON.parse(data));
      		  //inspect(data)
      		  Konfig.ArbeitsplatzGeräte=JSON.parse(data)
			      //inspect(Konfig)


				     //3. MHAN Zuordnung für Arbeitsplatz einlesen
        	   //Dateinamen noch durch Variable ersetzen
        	   files.readFile(rev_ap[0]+"_"+rev_ap[1]+"_mhan_zuordnung.json", 'utf8', function (err, data) {
        			if (err){
                logger.error(FILENAME+' Funktion: erstelleKonfigFurAp2 MHAN Zuordnung: keine MhanZuordnung: ' + rev_ap)

              }
        			else{
                logger.info(FILENAME+' Funktion: erstelleKonfigFurAp2 MHAN Zuordnung: '+JSON.parse(data));
      	  		  Konfig.MhanZuordnung=JSON.parse(data)
				      }


                //----------------------------------------------------------------------------------------
                //Hier die Callback für die Res.send einbauen, die die Rückmeldung aus Konfig benötigt
                
                callback(Konfig)
	       }) //3. filesRead  MHAN Zuordnung
		}) //2. filesRead AP Geräte
   })// 1. filesRead Revier


	}//Funktion Ende

//Beschreibung der Funktion erstellen.....
//
function erstelleKonfigFuerLotsenKanal(Ap,standard,callback){
    var Konfig={
        FunkstellenReihe:[],
        FunkstellenDetails:{},
        LotsenAp:{},
        MhanZuordnung:{}
    }
    var rev_ap = Ap.split(" ")//Arbeitsplatzstring Ap //z.b JA NvD aufsplitten und als Array in Variable schreiben 
    var standard = standard?'':'_benutzer'

    logger.info(FILENAME+ ' Funktion erstelleKonfigFuerLotsenKanal übergebener Arbeitsplatz: '+Ap)
    
    //1. Funkkstellen für Revier einlesen //z.B. Datei: JA.json
    files.readFile(rev_ap[0]+".json", 'utf8', function (err, data) { //rev_ap[0] = Revieranteil
        if (err){
            logger.info(FILENAME+ ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + rev_ap[0] + ') Datei nicht vorhanden: '+err)
        };
        
        logger.info(FILENAME+ ' Funktion erstelleKonfigFuerLotsenKanal readFile(' + rev_ap[0] + ') gelesene Daten: '+JSON.parse(data));
        fstReihe=JSON.parse(data)//String in Objekt umwandeln und in Variable schreiben
        //Durch fstReihe über buttons iterieren
        for (var button in fstReihe){
            console.log(button+'  '+fstReihe[button])
            //Durch Funkstelln in Buttons iterien
            for (t=0;t<fstReihe[button].length;t++){
                //Funkstellendetails schreiben HIER MEHR ERKLÄREN
                Konfig.FunkstellenDetails[fstReihe[button][t]]=findeFstNachId(fstReihe[button][t])
            }
        }
    
        //Alle LotsenAP einlesen
        //Über alle Lotsendateien //JA_Lotse1.json usw. gehen und Inhalt in die Konfig schreiben
        i = 1
        weitereDatei=true //solange true bis keine weitere Datei vorliegt
        
        while (weitereDatei==true){
            try{
                weitereDatei=files.statSync(rev_ap[0]+"_Lotse"+i+".json").isFile()
                tmp=files.readFileSync(rev_ap[0]+"_Lotse"+i+standard+".json", 'utf8')
                logger.info(FILENAME+ ' Funktion erstelleKonfigFuerLotsenKanal readFileSync(' + rev_ap[0]+'_Lotse'+i+') gelesene Daten: '+ JSON.parse(tmp))
                Konfig.LotsenAp[rev_ap[0]+"_Lotse"+i]=JSON.parse(tmp)   
            }
            catch(error){
                //console.log(error)
                logger.info(FILENAME+ ' Funktion erstelleKonfigFuerLotsenKanal keine weitere Datei')
                callback(Konfig)
                return
            }
            
            i++//prüfen ob noch benötigt!
                
        }//While Ende
    })//1. Read Ende
}//Funktion Ende








module.exports = router;
