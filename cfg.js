'use strict';
/* Modul zur Gernerierung von Konfigurationsvariablen
 * Die Parameter werden aus der Datei config/server/IP_des_Servers/serverIPS.json bezogen
 *
 * @Author: Klaas Wuellner
 *
 */

const log = require('./log.js');
const fs = require('fs'); // Zugriff auf das Dateisystem
const HOSTNAME = require('os').hostname();

let AKTUELLER_SERVER = ''; //globale Variable für aktuellen Server. Einbindung in Konfig zur Darstellung des aktuellen Server via Jade Template layout.jade

function getIPs() {  // suche in allen Netzwerkadressen nach einer existierenden
	// eine existierende Datei in ./config/servers/ geht vor, damit man auf einer Maschine mehrfach mit unterschiedlichen Ports starten kann:
	try {
		return require('./config/servers/serverIPs.json');
	}
	catch (e) {
		// try next
	}
	const networkInterfaces = require('os').networkInterfaces();
	for (const netInterface in networkInterfaces) {
		for (const adapter in networkInterfaces[netInterface]) {
			try {
				AKTUELLER_SERVER = networkInterfaces[netInterface][adapter].address; //TODO:Port auslesen bzw. einbinden
				return require('./config/servers/' + networkInterfaces[netInterface][adapter].address + '/serverIPs.json');
			}
			catch (e) {
				// try next
			}
		}
	}
}
const cfgIPs = getIPs();
console.log(cfgIPs);
const cfg = {
	'urlRFDWebservice': 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

	'jsSipConfiguration_DUE': {
		'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
		'uri': 'sip:due@' + cfgIPs.sipIP + ':5060',
		// TODO fuer unterschiedliche Passwoerter dev/stage/prod: noch in serverIPs auslagern
		'password': 'due'
	},
	'jsSipConfiguration_mockRFD': {
		'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
		'uri': 'sip:rfd@' + cfgIPs.sipIP + ':5060',
		// TODO fuer unterschiedliche Passwoerter dev/stage/prod: noch in serverIPs auslagern, unterschiedliche Passwoerter vergeben, mindestens produktiv
		'password': 'rfd'
	},

	'auth': false,
	'auth_user': 'ukwserver',
	'auth_pw': 'due',
	'mongodb': 'mongodb://@user_auth' + cfgIPs.mongoDbs.toString() + '/ukw?replicaSet=dueReplicaSet',

	//HTTP Port für die nodeJS Instanz
	'port': cfgIPs.port,
	'configPath': 'config/',
	'intervall': 10000000,

	'alternativeIPs': cfgIPs.alternativeServer,
	cfgIPs,
	'aktuellerServer': AKTUELLER_SERVER,
	'aktuellerHostname': HOSTNAME
};

module.exports = cfg;

