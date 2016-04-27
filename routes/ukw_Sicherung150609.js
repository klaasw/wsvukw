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






/*Block zur Implementierung der WebService Abfragen an RFD
*
*
*
*
*/
var msg_TrennenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><trennenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">1-H-RFD-WHVVKZ-SPAN-01</vonId><nachId xmlns="">1-H-RFD-WHVVTA-FKMK-1</nachId></trennenEinfach></s:Body></s:Envelope>'
var msg_SchaltenEinfach='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><schaltenEinfach xmlns="http://strg.rfd.dma.schnoor.de/"><vonId xmlns="">1-H-RFD-WHVVKZ-SPAN-01</vonId><nachId xmlns="">1-H-RFD-WHVVTA-FKMK-1</nachId><duplex xmlns="">true</duplex></schaltenEinfach></s:Body></s:Envelope>'



var parameterRfdWebService={
    url:'http://10.92.1.42:8789/I_RFD_DUE_Steuerung',
    method:'POST',
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8;',
        'SOAPAction':'trennenEinfach'
    },
    body:msg_TrennenEinfach,
}
function sendeWebServiceNachricht(){
   
   request(parameterRfdWebService, function(error, response, body){
   })
}


sendeWebServiceNachricht();//Testabfrage


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
  console.log('Benutzer hat sich verbunden')
  socket.on('chat message', function(msg){
    //io.emit('chat message', msg);
    console.log(msg)
    sendeSipNachricht(msg.FstID,msg.ApID);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurückgesendet wird
  });
});
  

function sendeWebNachricht(SIPNachricht){
io.emit('test',SIPNachricht);
}

/*
zum Testen
*/
//var Intervall=setInterval(function() {sendeWebNachricht()},1000)















// Create our JsSIP instance and run it:
var configuration = {
  'ws_servers':         'ws://192.168.56.102:10088',
  'uri':                'sip:due@192.168.56.102:5060',
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
	console.log(e.message.direction)
  console.log(e.message.request.body)
	sendeWebNachricht(e.message.request.body)//Sende WebSocket Nachricht beim Senden und Empfangen. Richtung noch einbauen
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
