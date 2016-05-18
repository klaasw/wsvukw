var log = require('./log.js');
var fs = require('fs'); // Zugriff auf das Dateisystem

AKTUELLER_SERVER='' //globale Variable für aktuellen Server. Einbindung in Konfig zur Darstellung des aktuellen Server via Jade Template layout.jade

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
                AKTUELLER_SERVER = nInterfaces[interface][adapter].address //TODO:Port auslesen bzw. einbinden
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
        'testReceiverMessage': 'sip:rfd@' + cfgIPs.sipIP + ':5060',
        'testReceiverCall': 'sip:test@' + cfgIPs.sipIP
    },
    "port": cfgIPs.port,
    "configPath": '../config/',
    "intervall": 10000,

    "alternativeIPs": cfgIPs.alternativeServer,
    "cfgIPs": cfgIPs,
    "aktuellerServer": AKTUELLER_SERVER
};

module.exports = cfg;

