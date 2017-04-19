'use strict';

const db            = require('./datenbank.js');
const JsSIP         = require('jssip');
const NodeWebSocket = require('jssip-node-websocket');

db.verbindeDatenbank(function (db) {

	// Register callbacks to desired call events
	const eventHandlers = {
		succeeded(e) {
			console.log('SIP-Nachricht gesendet.');
		},
		failed(e) {
			console.log('SIP-Nachricht NICHT gesendet, Details: ' + JSON.stringify(e));
		}
	};

	const options = {
		eventHandlers
	};

	let socket = new NodeWebSocket('ws://127.0.0.1:10080');
	//let socket = new JsSIP.WebSocketInterface('ws://127.0.0.1:10080');

	let ua = new JsSIP.UA(
		{
			sockets:  [socket],
			uri:      'sip:rfd@127.0.0.1:5060',
			password: 'rfd'
		});

	ua.on('connected', function () {
		ua.sendMessage('sip:rfd@127.0.0.1:5060', '<"TX" "id"="1-H-RFD-WARVTA-FKEK-3" "state"="0" "atis"="9211034779" "channel"="73"/>', options);
	});

	ua.on('registered', function (e) {
		console.log('Funktion: registered auf SIP-Server');
	});

	ua.on('registrationFailed', function (e) {
		console.log('Registration failed auf SIP-Server' + JSON.stringify(e));
	});

	ua.start();

});