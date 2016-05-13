var log = require('./log.js');
var fs = require('fs'); // Zugriff auf das Dateisystem

function getIPs() {  // suche in allen Netzwerkadressen nach einer existierenden
    // eine existierende Datei in ./config/servers/ geht vor, damit man auf einer Maschine mehrfach mit unterschiedlichen Ports starten kann:
	try {
		return require('./config/servers/serverIPs.json');
	} catch (e) {
		// try next
	}			
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

var cfg = {
    "urlRFDWebservice": 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

    "jsSipConfiguration": {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:due@' + cfgIPs.sipIP + ':5060',
        'password': 'due',
        'testReceiverMessage': 'sip:rfd@192.168.56.102:5060',
        'testReceiverCall': 'sip:test@192.168.56.103'
    },
    "port": cfgIPs.port,
    "configPath": '../config/',
    "intervall": 10000,

    "alternativeIPs": cfgIPs.alternativeServer
};

module.exports = cfg;

