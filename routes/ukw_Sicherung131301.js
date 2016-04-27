var express = require('express');
var router = express.Router();
var JsSIP = require('jssip'); //Javascript SIP Uaser Agent
var http = require('http');
var request = require('request')//Modul zu Abfrage von WebServices
var inspect = require('eyes').inspector({styles: {
            
        },
        maxLength: 16000}); //Inspektor für Variablen

var xml2js = require('xml2js')// zum Konvertieren von XML zu JS
var parser = new xml2js.Parser({explicitRoot: true});// Parserkonfiguration

var winston = require('winston')// Modul für verbessertes Logging

//neuen logger intanzieren
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
      	'timestamp':true,
      	'prettyPrint':true,
      	'colorize':true
      })
    ]
});

FILENAME=__filename.slice(__dirname.length + 1)

/* ToDo
*  - Ungültige Nutzer abfangen
*  - Timeout oder Zustand der Server darstellen und Bedienung verhindern
*  - Mithören darstellen
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
function prüfeRfdWS(){
	request('http://10.92.2.42:8789/I_RFD_DUE_Steuerung', function(error,response,body){
		if(!error && response.statusCode == 200){
			console.log('RFD WebService erreichbar')
		}
	})
}
// Setze Intervall für Prüfung
//var Intervall=setInterval(function() {prüfeRfdWS()},1000)


/*Block zur Implementierung der WebService Abfragen an RFD
*
*
*
*
*/
function sendeWebServiceNachricht(Fst,Span_Mhan,aktion,Kanal){

  var parameterRfdWebService={
    //url:'http://10.92.2.42:8789/I_RFD_DUE_Steuerung',
    url:'http://10.160.1.96:8088/mock_I_RFD_DUE_Steuerung',
    method:'POST',
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8;',
        'SOAPAction':'PLATZHALTER'                      //NOch beachten in WS Aufrufen
    },
    body:'',
  }

  var antwortFürWebsocket;
  
  

  if (aktion=='trennenEinfach'){
  //Variable für RFD Request 
  var msg_TrennenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><trennenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">'+Span_Mhan+'</vonId><nachId xmlns="">'+Fst+'</nachId></trennenEinfach></s:Body></s:Envelope>'
  //Variable für true Rückmeldung vom RFD
  antwortFürWebsocket={ getrennt:{'$':{ id: Fst, Ap:Span_Mhan, state: '1' } } }
  parameterRfdWebService.headers.SOAPAction='trennenEinfach'
  parameterRfdWebService.body=msg_TrennenEinfach
  }

  if (aktion=='schaltenEinfach'){
  //Variable für RFD Request 
  var msg_SchaltenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><schaltenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">'+Span_Mhan+'</vonId><nachId xmlns="">'+Fst+'</nachId><duplex xmlns="">true</duplex></schaltenEinfach></s:Body></s:Envelope>'    
  //Variable für true Rückmeldung vom RFD
  antwortFürWebsocket={ geschaltet:{'$':{ id: Fst, Ap:Span_Mhan,state: '1' } } }
  parameterRfdWebService.headers.SOAPAction='schaltenEinfach'
  parameterRfdWebService.body=msg_SchaltenEinfach
  }

  if (aktion=='setzeKanal'){
  //Variable für RFD Request 
  var msg_setzeKanal='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><setzeKanal xmlns="http://strg.rfd.dma.schnoor.de/"><fstid xmlns="">'+Fst+'</fstid><channel xmlns="">'+Kanal+'</channel></setzeKanal></s:Body></s:Envelope>'    
  //Variable für true Rückmeldung vom RFD
  
  //Websocket Antwort kann entfallen. Bestätigung wird als SIP NAchricht vom RFD DM versendet
  antwortFürWebsocket={ setzeKanal:{'$':{ id: Fst, Ap:Span_Mhan,state: '1' } } }
  parameterRfdWebService.headers.SOAPAction='setzeKanal'
  parameterRfdWebService.body=msg_setzeKanal
  } 

   
  request(parameterRfdWebService, function(error, response, body){
    if (error){
      logger.info(FILENAME+' Funktion: sendeWebServiceNachricht request '+'Msg: RFD WebService nicht erreichbar. Aktion: '+ aktion, {uebergabe: parameterRfdWebService, nodeMsg: error})
      //logger.info('RFD '+aktion+' fehlgeschlagen')
      
      sendeWebNachricht('RFD '+aktion+' fehlgeschlagen')

      }
    else{
    parser.parseString(body, function (err, result) {
      console.log(result)
      console.log(result['S:Envelope']['S:Body'][0]['ns2:'+aktion+'Response'][0])
      erfolgreich=result['S:Envelope']['S:Body'][0]['ns2:'+aktion+'Response'][0]['return'][0]
      if (erfolgreich==='true'){
        sendeWebNachricht(antwortFürWebsocket)
      }
      else{
      	console.log('RFD '+aktion+' fehlgeschlagen')
      	sendeWebNachricht('RFD '+aktion+' fehlgeschlagen')
      }
    })// Parser ende
    }// ELse ende
    })// Request ende
}


//sendeWebServiceNachricht();//Testabfrage


/*ERweiterung für Socket IO
*
*
*/
var app= express()
app.set('port', 3001); //Setzte anderen Port für Socket verbindungen
var server = require("http").Server(app);
var io = require("socket.io")(server);


server.listen(app.get('port'), function(){
  console.log('Socket IO gestartet auf Port ' + app.get('port'));
});

io.on('connection', function (socket) {
  console.log('Benutzer hat sich verbunden. IP: '+socket.request.connection.remoteAddress)
  socket.on('chat message', function(msg){
    //io.emit('chat message', msg);
    console.log(msg)
    sendeWebServiceNachricht(msg.FstID,msg.SPAN,msg.aktion,msg.Kanal);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurückgesendet wird
  });
});
  

function sendeWebNachricht(SIPNachricht){
io.emit('test',SIPNachricht);
logger.info(FILENAME+' Funktion: sendeWebNachricht '+'Msg: WebSocket Nachricht: '+SIPNachricht)
}

function sendeWebNachricht2(SIPNachricht){
io.emit('test',SIPNachricht);
}

/*
zum Testen
*/
//var Intervall=setInterval(function() {sendeWebNachricht()},1000)















// Create our JsSIP instance and run it:
var configuration = {
  'ws_servers':         'ws://10.160.1.64:10080',
  'uri':                'sip:due@10.160.1.64:5060',
  'password':           'due',
  //'authorization_user': '1001',
  //'use_preloaded_route': true
  //'node_websocket_options': {
  //'origin': "192.168.56.104",
  // },
  //'hack_via_contact': true
};


var ua = new JsSIP.UA(configuration);
ua.start();


var text = 'Hello Bob!';

// Register callbacks to desired message event
var eventHandlers = {
  'succeeded': function(e){ 
  	console.log('Nachricht gesendet') },
  'failed':    function(e){
  	console.log('Nachricht NICHT gesendet') },
};

var options = {
  'eventHandlers': eventHandlers
};


//SIP Aufrufe
function sendeSipNachricht(text){
ua.sendMessage('sip:rfd@192.168.56.102:5060', text, options);
}


function anruf(){
ua.call('sip:test@192.168.56.103')
}


//SIP User Agent Ereignisse
ua.on('connected', function(e){
	console.log('Verbunden mit SIP-Server')
	
});

ua.on('connecting', function(e){
	console.log('Verbinde zu SIP-Server...')
	
});

ua.on('registered', function(e){
	console.log('Registriert auf SIP-Server')
	//sendeNachricht('Bin jetzt Registriert')
	//anruf()
});

ua.on('registrationFailed', function(e){
	console.log('Registrierungsfehler auf SIP-Server')

});


ua.on('disconnected', function(e){
	console.log('Getrennt vom SIP-Server')
});

ua.on('newMessage', function(e){
	console.log('neue SIP Nachricht')
	console.log('SIP Richtung: '+ e.message.direction)
  console.log('SIP Body: '+e.message.request.body)
	//Sende WebSocket Nachricht beim Senden und Empfangen. Richtung noch einbauen
  sendeWebNachricht(e.message.request.body)
     parser.parseString(e.message.request.body, function (err, result) {
      console.log(err)
      if(err==null){
             console.log(result)
             
             sendeWebNachricht(result)
             }
      else{
       console.log('keine XML in SIP Nachricht Error='+err+' Nachricht='+e.message.request.body)
      }
      

     })//Parser Ende
});







module.exports = router;
