var express = require('express');
var router = express.Router();
var inspect = require('eyes').inspector({styles: {
            
        },
        maxLength: 16000}); //Inspektor für Variablen
var files = require('fs')// Zugriff auf das Dateisystem
var request = require('request')//Modul zu Abfrage von WebServices
var xml2js = require('xml2js')// zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({explicitRoot: false});// Parserkonfiguration




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET UKW Übersicht */
router.get('/overview', function(req, res) {
	res.render('ukwOverview',{funkstellen: Funkstellen2})
})

/* GET UKW Übersicht */
router.get('/testen', function(req, res) {
  res.render('testen',{funkstellen: Funkstellen2})
})



/* GET UKW Display */
router.get('/ukw', function(req, res) {
    console.log(req.ip)
    findeApNachIp(req.ip,function(benutzer){//Arbeitsplatz aus Konfig lesen
      if(benutzer){
      	console.log('Arbeitsplatz gefunden! IP: ' + req.ip)
      	erstelleKonfigFurAp2(benutzer, function(konfig){
          //Übergebe Funkstellen ID an Jade Template
            res.render('ukwDisplay', { 
                           test11panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].id+'-Panel' : "", 
                              test11id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].id : "",
                            test11name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].sname : "",
                           test11kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].channel : "",
                           test12panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].id+'-Panel' : "", 
                              test12id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].id : "",
                            test12name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].sname : "",
                           test12kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].channel : "",
                           test13panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].id+'-Panel' : "", 
                              test13id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].id : "",
                            test13name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].sname : "",
                           test13kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].channel : "",
                           test14panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].id+'-Panel' : "", 
                              test14id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].id : "",
                            test14name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].sname : "",
                           test14kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].channel : "",
                           test21panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].id+'-Panel' : "", 
                              test21id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].id : "",
                            test21name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].sname : "",
                           test21kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].channel : "",
                           test22panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].id+'-Panel' : "", 
                              test22id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].id : "",
                            test22name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].sname : "",
                           test22kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].channel : "",
                           test23panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].id+'-Panel' : "", 
                              test23id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].id : "",
                            test23name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].sname : "",
                           test23kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].channel : "",
                           test24panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].id+'-Panel' : "", 
                              test24id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].id : "",
                            test24name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].sname : "",
                           test24kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].channel : "",
                           
                          })//res send ende
          })//erstelleKonfigFurAp Ende
      }//if Ende
    })//findeApNachIp Ende
      
    
});//router Ende




/* GET UKW Konfiguration*/
router.get('/ukwKonfig', function(req, res) {
    console.log(req.ip)
    console.log(req.query.ip)
    //var Ap=findeApNachIp(req.ip)//Arbeitsplatz aus Konfig lesen
    //var Ap_test=findeApNachIp(req.query.ip)
    //console.log(findeApNachIp(req.ip))
    //console.log(findeApNachIp(req.query.ip))
    
    //ukwkonfig?ip=1.1.1.1
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
    // ukwkonfig ohne parameter
    else{
      findeApNachIp(req.ip,function(benutzer){
    	if(benutzer){
      console.log('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
      //res.send('Benutzer zu IP  = '+benutzer+' '+req.query.ip)
        erstelleKonfigFurAp2(benutzer,function(Konfig){
        res.send(Konfig)

         })
        }
      else{
      console.log('2 Benutzer nicht konfiguriert für IP '+req.query.ip)
      res.send('Arbeitsplatz nicht gefunden! IP: ' + req.query.ip)
      }
    
    })

    }
});


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
  //url:'http://10.92.1.42:8789/I_RFD_DUE_Steuerung',
  url:'http://10.160.1.96:8088/mock_I_RFD_DUE_Steuerung',
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
      }
    //console.log(response)
    //console.log(body)
    //Response paarsen
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
    
    })// Request ende

}
var Funkstellen2=[];

leseRfdTopologie();





/* ALTE Variabelen zum Testen
 Funkstellen2=[
    {id:'1-H-RFD-BHVVTA-FKEK-3', MKA:false, Kanal:'28',kurzname:'BHV28',aufgeschaltet:null},
	{id:'1-H-RFD-WHVVTA-FKEK-3', MKA:false, Kanal:'16',kurzname:'WHV',aufgeschaltet:null},
	{id:'1-H-RFD-WHVVTA-FKEK-1', MKA:false, Kanal:'70',kurzname:'WHV70',aufgeschaltet:null},
	{id:'1-H-RFD-WHVVTA-FKEK-2', MKA:false, Kanal:'80',kurzname:'WHV80',aufgeschaltet:null},
	{id:'1-H-RFD-WHVVTA-FKEK-4', MKA:false, Kanal:'79',kurzname:'WHV79',aufgeschaltet:null},
	{id:'1-H-RFD-WHVVTA-FKEK-5', MKA:false, Kanal:'16',kurzname:'WHV16',aufgeschaltet:null},

	]
*/
//var ja = ['1-H-RFD-BHVVTA-FKEK-3','','1-H-RFD-WHVVTA-FKEK-3','1-H-RFD-WHVVTA-FKEK-5','1-H-RFD-WHVVTA-FKEK-2']
//var jaKonfig=[];

/*
var Ap = [
{'192.168.56.1':{user:'JA NvD',revier:'Jade Traffic'}},
{'192.168.56.2':{user:'JA NA',revier:'Jade Traffic'}}

]
*/
/*
var Geräte= {
	"SPAN01":"1-H-RFD-WHVVKZ-SPAN-03",
	"MHAN01":"1-H-RFD-WHVVKZ-MHAN-31",
	"MHAN02":"1-H-RFD-WHVVKZ-MHAN-32",
	"MHAN03":"1-H-RFD-WHVVKZ-MHAN-33",
	"MHAN04":"1-H-RFD-WHVVKZ-MHAN-34"
}



files.writeFile("ja_nvd.json",JSON.stringify(Geräte),function(err) {
      if (err){
       console.log(err);
      } else {
       console.log("Datei gespeichert!")
      }
    });


files.writeFile("arbeitsplaetze.json",JSON.stringify(Ap),function(err) {
      if (err){
       console.log(err);
      } else {
       console.log("Datei gespeichert!")
      }
    });
*/
//console.log(Funkstellen2)





var jaNvd = '192.168.56.1';

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



//findeApNachIp('192.168.56.1')
//findeFstNachId('1-H-RFD-TETTEN-FKEK-3')
//erstelleKonfigFurAp('tttt')

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
    
      for ( t = 0; t < fstReihe.length; t++) {
		Konfig.FunkstellenDetails[fstReihe[t]]=findeFstNachId(fstReihe[t]) ///ab HIER wweiter-------------------------------------------

	   };
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
        			if (err) throw err;
        			console.log('gelesene Daten: '+JSON.parse(data));
      	  		//inspect(data)
      		  	Konfig.MhanZuordnung=JSON.parse(data)
				      //inspect(Konfig)


                //----------------------------------------------------------------------------------------
                //Hier die Callback für die Res.send einbauen, die die Rückmeldung aus Konfig benötigt
                
                callback(Konfig)
	       }) //3. filesRead  MHAN Zuordnung
		}) //2. filesRead AP Geräte
   })// 1. filesRead Revier


	}








module.exports = router;
