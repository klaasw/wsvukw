nodejs server:

mit turnkey-linux nodejs

Install htop
apt-get install htop

aktuelle Version und lts(long term support) node Januar 2017 (7.4.0, 6.4.9)
n latest
n lts

Zeitserver in /etc/ntp.conf eintragen
ggf.
systemctl stop ntp
ntpdate 10.160.1.42
systemctl start ntp

aktuelle Version von pm2 (Prozessmanager für node)
npm install pm2 -g
pm2 -V  --> Januar 2017 2.2.3

Anwendungen auch bei neustart starten. Bietet pm2 die Möglichkeit ein startup Skript zu erstellen
http://pm2.keymetric.io/docs/usage/startup

pm2 startup erstellt das Skript unter /etc/systemd/system/pm2.service
pm2 save speichert alle laufenden pm2 Prozesse unter /root/.pm2/dump.pm2

pm2 web startet einen Wep Prozess auf Port 9615 zur Zustandsabfrage

unter /opt/node-tklcp liegt die Standard Turnkeylinux Welcome Page

pm2-gui Interface für grafische Darstellung
