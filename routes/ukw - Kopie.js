var express = require('express');
var router = express.Router();
var JsSIP = require('jssip');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Create our JsSIP instance and run it:


var configuration = {
  'ws_servers':         'ws://192.168.56.102:10080',
  'uri':                'due@192.168.56.103',
  'password':           'dueb',
  'authorization_user': 'due',
  'node_websocket_options': {
  'origin': "http://myweb.com",
   }
};



var ua = new JsSIP.UA(configuration);
ua.start();

var text = 'Hello Bob!';

// Register callbacks to desired message events
var eventHandlers = {
  'succeeded': function(e){ 
  	console.log('Nachricht gesendet') },
  'failed':    function(e){
  	console.log('Nachricht NICHT gesendet') },
};

var options = {
  'eventHandlers': eventHandlers
};

function sendeNachricht(){
ua.sendMessage('sip:test@192.168.56.103', text, options);
}

ua.on('connected', function(e){
	console.log('Verbunden')
	
});

ua.on('registered', function(e){
	console.log('Registriert')
	//sendeNachricht()
});

ua.on('registrationFailed', function(e){
	console.log('Registrierungsfehler')

});


ua.on('disconnected', function(e){
	console.log('Getrennt')
});

ua.on('newMessage', function(e){
	console.log('neue Nachricht')
});

//Akzeptiere eingehende IM NAchrichten
 //ua.acceptMessage()

module.exports = router;
