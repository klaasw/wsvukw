var log = require('./log.js');
var fs = require('fs'); // Zugriff auf das Dateisystem

var cfgIPs = require('./config/serverIPs.json');

var cfg = {
    "urlRFDWebservice": 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

    "jsSipConfiguration": {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:due@' + cfgIPs.httpIP + ':5060',
        'password': 'due'
    },
    "port": '3000',
    "configPath" : '../config/',
    "intervall": 15000
};

module.exports = cfg;

