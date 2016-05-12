var log = require('./log.js');
var fs = require('fs'); // Zugriff auf das Dateisystem

function getIPs() {  // suche in allen Netzwerkadressen nach einer existierenden
    var nInterfaces = require('os').networkInterfaces();
    for (interface in nInterfaces) {
        for (adapter in nInterfaces[interface]) {
            try {
                return require('./config/servers/' + nInterfaces[interface][adapter].address + '/serverIPs.json');
            } catch (e) {
                // try next
            }
        }
    }
}
var cfgIPs = getIPs();
var port = '3000';

var cfg = {
    "urlRFDWebservice": 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

    "jsSipConfiguration": {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:due@' + cfgIPs.sipIP + ':5060',
        'password': 'due',
        'testReceiverMessage': 'sip:rfd@192.168.56.102:5060',
        'testReceiverCall': 'sip:test@192.168.56.103'
    },
    "port": port,
    "configPath": '../config/',
    "intervall": 30000,

    "alternativeIPs": cfgIPs.alternativeServer
};

module.exports = cfg;

