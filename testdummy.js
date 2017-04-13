'use strict';

const db            = require('./datenbank.js');
const JsSIP         = require('jssip');
// const NodeWebSocket = require('jssip-node-websocket');

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

	let socket = new JsSIP.WebSocketInterface('ws://10.22.30.101:8088');

	let ua = new JsSIP.UA(
		{
			sockets:      [socket],
			uri:          'sip:rfd@10.22.30.101:5060',
			password:     'rfd'
		});

	ua.start();

	ua.sendMessage('sip:rfd@10.22.30.101:5060', '<"TX" "id"="1-H-RFD-WARVTA-FKEK-3" "state"="0" "atis"="9211034779" "channel"="73"/>', options);
	// ua.call('sip:rfd@10.22.30.101:5060', options);

});