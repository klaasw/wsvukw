var express = require('express');
var router = express.Router();
var SIP = require('sip.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Create our JsSIP instance and run it:


var configuration = {
  'ws_servers':         'ws://192.168.56.102:5066',
  'uri':                'sip:1001@192.168.56.102',
  'password':           '1234',
  //'authorization_user': '1001',
  //'use_preloaded_route': true
  //'node_websocket_options': {
  //'origin': "192.168.56.104",
  // },
  //'hack_via_tcp': true
};





var userAgent = new SIP.UA({
  uri: '1001@192.168.56.102',
  wsServers: 'ws://192.168.56.102:5066',
  authorizationUser: '1001',
  password: '1234',
  register: true
});


module.exports = router;
