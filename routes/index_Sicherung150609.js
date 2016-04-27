var express = require('express');
var router = express.Router();
var inspect = require('eyes').inspector({styles: {
            
        },
        maxLength: 16000}); //Inspektor für Variablen
var files = require('fs')// Zugriff auf das Dateisystem





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET UKW Display */
router.get('/ukw', function(req, res) {
    console.log(req.ip)

    	//HIER irgendwie mit CALLBACK Arbeiten
    	erstelleKonfigFurAp2(findeApNachIp(req.ip), function(konfig){
            //Übergebe Funkstellen ID an Jade Template
            res.render('ukwDisplay', { test11panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].id+'-Panel' : "", 
            						      test11id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].id : "",
            						    test11name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].kurzname : "",
            						   test11kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[0]].Kanal : "",
            						   test12panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].id+'-Panel' : "", 
            						      test12id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].id : "",
            						    test12name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].kurzname : "",
            						   test12kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[1]].Kanal : "",
            						   test13panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].id+'-Panel' : "", 
            						      test13id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].id : "",
            						    test13name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].kurzname : "",
            						   test13kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[2]].Kanal : "",
            						   test14panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].id+'-Panel' : "", 
            						      test14id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].id : "",
            						    test14name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].kurzname : "",
            						   test14kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[3]].Kanal : "",
            						   test21panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].id+'-Panel' : "", 
            						      test21id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].id : "",
            						    test21name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].kurzname : "",
            						   test21kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[4]].Kanal : "",
            						   test22panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].id+'-Panel' : "", 
            						      test22id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].id : "",
            						    test22name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].kurzname : "",
            						   test22kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[5]].Kanal : "",
            						   test23panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].id+'-Panel' : "", 
            						      test23id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].id : "",
            						    test23name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].kurzname : "",
            						   test23kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[6]].Kanal : "",
            						   test24panel: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].id+'-Panel' : "", 
            						      test24id: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].id : "",
            						    test24name: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].kurzname : "",
            						   test24kanal: konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] && konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]] != "frei" ? konfig.FunkstellenDetails[konfig.FunkstellenReihe[7]].Kanal : "",
            						   
            						   })
            })
    
    
});




/* GET UKW Konfiguration*/
router.get('/ukwKonfig', function(req, res) {
    console.log(req.ip)
    erstelleKonfigFurAp2(findeApNachIp(req.ip),function(Konfig){
		res.send(Konfig)
    })
});


files.readFile("funkstellen.json", 'utf8', function (err, data) {
  if (err) throw err;
  console.log('Funkstellen geladen: ');
  console.log(JSON.parse(data));
  Funkstellen2=JSON.parse(data)
})

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

function findeApNachIp(ip){
	var Ap='';
	files.readFile("arbeitsplaetze.json", 'utf8', function (err, data) {
      if (err) throw err;
      console.log(JSON.parse(data));
      Ap=JSON.parse(data)

      for(i=0;i<Ap.length;i++){
		if (ip in Ap[i]){
		console.log(Ap[i][ip].user)
		//return Ap[i][ip].user
		//callback(Ap[i][ip].user);

	     }	
	  }
     })

	
}



function erstelleKonfigFurAp(Ap,callback){
	var tmpObj={} //Bilde temporäres Objekt um Funkstelle als Value hinzuzufügen
	var tmpArr=[]
	
    
    //1. Funkkstellen für Revier einlesen
    //Dateinamen noch durch Variable ersetzen
	files.readFile("ja.json", 'utf8', function (err, data) {
      if (err) throw err;
      console.log('gelesene Daten: '+JSON.parse(data));
      ja=JSON.parse(data)
    
      for ( t = 0; t < ja.length; t++) {
		//console.log(findeFstNachId(ja[i]))
		//ja[i]=ja[i]:findeFstNachId(ja[i])
		tmpFst=ja[t]
	
		tmpObj[ja[t]]=findeFstNachId(ja[t])

		

		//inspect(jaKonfig)
		//console.log(jaKonfig[i][tmpFst].Kanal)
		console.log("erstelleKonfigFurAp: " + t,tmpObj)

	   };
    console.log("FertigeKonfig:"+tmpObj)
	console.log('----------------------------------------------------------------------')
	inspect(tmpObj)
	console.log('----------------------------------------------------------------------')
           
           //2. Geräte für Arbeitsplatz einlesen
           //Dateinamen noch durch Variable ersetzen
           files.readFile("ja_nvd.json", 'utf8', function (err, data) {
      		if (err) throw err;
      		console.log('gelesene Daten: '+JSON.parse(data));
      		inspect(data)
      		arbeitsplatzGerate=JSON.parse(data)



            //----------------------------------------------------------------------------------------
            //Hier die Callback für die Res.send einbauen, die die Rückmeldung aus Konfig benötigt
            //Besser hier die Konfig zusammenstellen
            /*
            {
				FunkstellenReihe:[12,34,56],
				FunkstellenDetails:{},
				ArbeitsplatzGeräte:{},
            

            }


            */
	

	        callback(tmpObj,ja,arbeitsplatzGerate)
	       }) //2. filesRead
	
   
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
	
    
    //1. Funkkstellen für Revier einlesen
    //Dateinamen noch durch Variable ersetzen
	files.readFile("ja.json", 'utf8', function (err, data) {
      if (err) throw err;
      console.log('gelesene Daten: '+JSON.parse(data));
      fstReihe=JSON.parse(data)
    
      for ( t = 0; t < fstReihe.length; t++) {
		Konfig.FunkstellenDetails[fstReihe[t]]=findeFstNachId(fstReihe[t]) ///ab HIER wweiter-------------------------------------------

	   };
	  Konfig.FunkstellenReihe=fstReihe
    console.log("FertigeKonfig:"+Konfig.FunkstellenDetails)
	console.log('----------------------------------------------------------------------')
	inspect(Konfig)
	console.log('----------------------------------------------------------------------')
           
           //2. Geräte für Arbeitsplatz einlesen
           //Dateinamen noch durch Variable ersetzen
           files.readFile("ja_nvd.json", 'utf8', function (err, data) {
      		if (err) throw err;
      		console.log('gelesene Daten: '+JSON.parse(data));
      		inspect(data)
      		Konfig.ArbeitsplatzGeräte=JSON.parse(data)
			inspect(Konfig)


				//3. MHAN Zuordnung für Arbeitsplatz einlesen
        	   //Dateinamen noch durch Variable ersetzen
        	   files.readFile("ja_nvd_mhan_zuordnung.json", 'utf8', function (err, data) {
      			if (err) throw err;
      			console.log('gelesene Daten: '+JSON.parse(data));
      			inspect(data)
      			Konfig.MhanZuordnung=JSON.parse(data)
				inspect(Konfig)


                //----------------------------------------------------------------------------------------
                //Hier die Callback für die Res.send einbauen, die die Rückmeldung aus Konfig benötigt
                //Besser hier die Konfig zusammenstellen
                /*
                {
		    		FunkstellenReihe:[12,34,56],
		    		FunkstellenDetails:{},
		    		ArbeitsplatzGeräte:{},
                    
    
                    }
    
    
                    */
    
            
	

	        callback(Konfig)
	       }) //3. filesRead
		}) //2. filesRead
   
    })


	}








module.exports = router;
