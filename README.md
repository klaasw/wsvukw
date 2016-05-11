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

## Weitere Software
- resipprocate als SIP-Server zur entgegennahem der Zustandsmeldungen via SIP IM Nachricht
- OverSip zur Einbindung der jssip Moduls als WebRTC. Würde theoretisch auch direkt auf resiprocate gehen
- weitere Details zur SIP Umgebung müssen noch geschrieben werden

# Weitere Erläuterungen

# Installation
    code Anleitung
    shell skript