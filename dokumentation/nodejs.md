## nodejs Einrichten:

Die Einrichtung basiert auf dem vorgeferigten Image von Turnkeylinux.
Hier mit turnkey-linux nodejs. Für die Ersteinrichtung ist eine Internetverbindung
notwendig.

### Install htop
apt-get install htop

### aktuelle Version nodeJS herunterladen
Das Herunterladen erfolgt mit dem npm Package n. Wird kein Turnkeylinux verwendet
muss die Installation anders erfolgen.

aktuelle Version und lts(long term support) node Januar 2017 (7.4.0, 6.4.9)
n latest
n lts

### Installation nginx
http://nginx.org/en/linux_packages.html
wget http://nginx.org/keys/nginx_signing.key
apt-key add nginx_signing.key
deb http://nginx.org/packages/mainline/debian/ codename nginx
deb-src http://nginx.org/packages/mainline/debian/ codename nginx
apt-get update
apt-get install nginx

### Zeitserver eintragen
Zeitserver in /etc/ntp.conf eintragen
ggf.
systemctl stop ntp
ntpdate 10.160.1.42
systemctl start ntp

### Prozessmanager PM2 instalieren
aktuelle Version von pm2 (Prozessmanager für node)
npm install pm2 -g
pm2 -V  --> Januar 2017 2.2.3

Anwendungen auch bei neustart starten. Bietet pm2 die Möglichkeit ein startup Skript zu erstellen
http://pm2.keymetric.io/docs/usage/startup

pm2 startup erstellt das Skript unter /etc/systemd/system/pm2.service
pm2 save speichert alle laufenden pm2 Prozesse unter /root/.pm2/dump.pm2

pm2 web startet einen Wep Prozess auf Port 9615 zur Zustandsabfrage

### Defaultpage
unter /opt/node-tklcp liegt die Standard Turnkeylinux Welcome Page
TODO: ggf. modifizieren und Link auf Status, Dokumentation

### Ideen
- pm2-gui Interface für grafische Darstellung
--> kurz getestet Zugriff auf GUI nicht hinbekommen

- npmbox für Installtion weiterer npm Packet für Offline Server
```
npm install npmbox -g
```
