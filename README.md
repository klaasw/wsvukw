# ukwDisplay
Dies ist die Benutzer-Oberfläche im DUE für die Nutzung des Revierfunkdienstes. Die Benutzer-Oberfläche ist als Webanwenung realisiert.

# Beschreibung
## Notwendige Module und Vorrausetzungen
- nodeJS als Basis
- Express als Web-Framework. Daraus resultiert auch die Ordnerstruktur
- jssip (SIP Meldungen auswerten)
- socket.io (Socket-Verbindungen zum Browser)
- request (WebService Aufrufe)
- winston (Logging)
- xml2js (XML in JSON Wandler)
- file-stream-rotator (für Datei-Logging)
- moment (vielleicht)
- chimp (Test?)
- chimp-widget (Test?)
- mongodb (Native MongoDB Treiber)
## TODO: für eine Neuinstallation notwendige Pakete mit Version in package.json eintragen

globale Module (npm install ... -g) sollten sein:
- pm2 (Prozessmanager)
- express-generator (erzeugt Ordner Struktur)
- 

## Weitere Software
- resipprocate als SIP-Server zur Aufnahme der Zustandsmeldungen via SIP IM Nachricht
- OverSip zur Einbindung der jssip Moduls als WebRTC. Würde theoretisch auch direkt auf resiprocate gehen
- weitere Details zur SIP Umgebung müssen noch geschrieben werden

# Weitere Erläuterungen

# Installation
    code Anleitung
    shell skript

# Installation SIP Module
http://rtcquickstart.org/guide/multi/sip-proxy-repro.html#idp63527504

## Installieren von Repro:
ggf. apt-get update
apt-get install repro

### config anpassen
- IP=10.160.1.70 Eigene IP des Servers
- WSPort=10088  //Prüfen ob funktioniert
- AssumePath = true
- DisableOutbound = false
- EnableFlowTokens = true
- recordrouteuri = 10.160.1.70 //wozu ? ist im Test konfiguriert

### Web Interface:
- ip:5080
- user:admin
- pw:admin

Die Pakete vom RFD kommen via UDP ebenfalls Port 5060. Dies in Repro konfigurieren



## Installieren von OverSIP:
http://oversip.net/documentation/2.0.x/installation/debian_and_ubuntu/

nano /etc/apt/sources.list.d/sources.list
wget -O - http://deb.versatica.com/deb.versatica.com.key | apt-key add -
apt-get update
apt-get install oversip

[FAIL] OverSIP (oversip) not yet configured, set RUN=yes in /etc/default/oversip ... failed!

### Verzeichnis erstellen
var/run/oversip    -> ist im Startskript enthalten

### owner zu oversip ändern
chown oversip oversip

### config anpassen:
explizit angeben
- IP Adresse SIP
- IP Adresse Websocket 

### STARTEN
mkdir /var/run/oversip
oversip -P /var/run/oversip/oversip.pid

oder config anpassen /etc/oversip
