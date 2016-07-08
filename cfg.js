/* Modul zur Gernerierung von Konfigurationsvariablen
* Die Parameter werden aus der Datei config/server/IP_des_Servers/serverIPS.json bezogen
* 
* @Author: Klaas Wuellner
* 
*/

var log = require('./log.js');
var fs = require('fs'); // Zugriff auf das Dateisystem

var AKTUELLER_SERVER='' //globale Variable für aktuellen Server. Einbindung in Konfig zur Darstellung des aktuellen Server via Jade Template layout.jade

function getIPs() {  // suche in allen Netzwerkadressen nach einer existierenden
    // eine existierende Datei in ./config/servers/ geht vor, damit man auf einer Maschine mehrfach mit unterschiedlichen Ports starten kann:
    try {
        return require('./config/servers/serverIPs.json');
    } catch (e) {
        // try next
    }
    var networkInterfaces = require('os').networkInterfaces();
    for (var netInterface in networkInterfaces) {
        for (var adapter in networkInterfaces[netInterface]) {
            try {
                AKTUELLER_SERVER = networkInterfaces[netInterface][adapter].address //TODO:Port auslesen bzw. einbinden
                return require('./config/servers/' + networkInterfaces[netInterface][adapter].address + '/serverIPs.json');
            } catch (e) {
                // try next
            }
        }
    }
}
var cfgIPs = getIPs();

var cfg = {
    "urlRFDWebservice": 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

    "jsSipConfiguration_DUE": {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:due@' + cfgIPs.sipIP + ':5060',
        // TODO fuer unterschiedliche Passwoerter dev/stage/prod: noch in serverIPs auslagern
        'password': 'due'
    },
    "jsSipConfiguration_mockRFD": {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:rfd@' + cfgIPs.sipIP + ':5060',
        // TODO fuer unterschiedliche Passwoerter dev/stage/prod: noch in serverIPs auslagern, unterschiedliche Passwoerter vergeben, mindestens produktiv
        'password': 'rfd'
    },

    "mongodb":'mongodb://ukwserver:due@' + cfgIPs.mongoDbs.toString() + '/ukw?replicaSet=dueReplicaSet',
    
    //HTTP Port für die nodeJS Instanz
    "port": cfgIPs.port,
    "configPath": 'config/',
    "intervall": 10000,

    "alternativeIPs": cfgIPs.alternativeServer,
    "cfgIPs": cfgIPs,
    "aktuellerServer": AKTUELLER_SERVER
};

module.exports = cfg;

