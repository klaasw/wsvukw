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

/* ToDo
*  - Ungültige Nutzer abfangen
*  - Timeout oder Zustand der Server darstellen und Bedienung verhindern
*  - Mithören darstellen
*  - Freigeben
*  - Kanalwahl
*
*/



/*Funktion zur Erreichbarkeit des RFD WebServices
*
*
*
*
*/
function prüfeRfdWS(){
	request('http://10.160.1.96:8088/mock_I_RFD_DUE_Steuerung', function(error,response,body){
		if(!error && response.statusCode == 200){
			console.log('RFD WebService erreichbar')
		}
	})
}
// Setze Intervall für Prüfung
var Intervall=setInterval(function() {prüfeRfdWS()},1000)


/*Block zur Implementierung der WebService Abfragen an RFD
*
*
*
*
*/
function sendeWebServiceNachricht(Fst,Span_Mhan,aktion){

  var parameterRfdWebService={
    //url:'http://10.92.1.42:8789/I_RFD_DUE_Steuerung',
    url:'http://10.160.1.96:8088/mock_I_RFD_DUE_Steuerung',
    method:'POST',
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8;',
        'SOAPAction':'PLATZHALTER'                      //NOch beachten in WS Aufrufen
    },
    body:'',
  }

  var antwortFürWebsocket;
  
  

  if (aktion=='trennen'){
  var msg_TrennenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><trennenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">'+Span_Mhan+'</vonId><nachId xmlns="">'+Fst+'</nachId></trennenEinfach></s:Body></s:Envelope>'
  antwortFürWebsocket={ getrennt:{'$':{ id: Fst, Ap:Span_Mhan, state: '1' } } }
  parameterRfdWebService.headers.SOAPAction='trennenEinfach'
  parameterRfdWebService.body=msg_TrennenEinfach
  }

  if (aktion=='schalten'){
  var msg_SchaltenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><schaltenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">'+Span_Mhan+'</vonId><nachId xmlns="">'+Fst+'</nachId><duplex xmlns="">true</duplex></schaltenEinfach></s:Body></s:Envelope>'    
  antwortFürWebsocket={ geschaltet:{'$':{ id: Fst, Ap:Span_Mhan,state: '1' } } }
  parameterRfdWebService.headers.SOAPAction='schaltenEinfach'
  parameterRfdWebService.body=msg_SchaltenEinfach
  } 

   
  request(parameterRfdWebService, function(error, response, body){
    if (error){
      console.log('RFD WebService nicht erreichbar '+error)
      //Zeitverzug zum Testen
      //setTimeout(function() { sendeWebNachricht(antwortFürWebsocket) }, 1000)
      //sendeWebNachricht(antwortFürWebsocket)

      }
    //console.log(response)
    //console.log(body)
    parser.parseString(body, function (err, result) {
      console.log(result)
      console.log(result['soapenv:Envelope']['soapenv:Body'][0]['strg:'+aktion+'EinfachResponse'][0]['return'][0])
      erfolgreich=result['soapenv:Envelope']['soapenv:Body'][0]['strg:'+aktion+'EinfachResponse'][0]['return'][0]
      if (erfolgreich==='true'){
        sendeWebNachricht(antwortFürWebsocket)
      }
    })// Parser ende
    
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
    sendeWebServiceNachricht(msg.FstID,msg.SPAN,msg.aktion);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurückgesendet wird
  });
});
  

function sendeWebNachricht(SIPNachricht){
io.emit('test',SIPNachricht);
console.log('WebSocket Nachricht: '+SIPNachricht)
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
  'hack_via_contact': true
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
