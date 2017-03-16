## Hilfe zu nginx
Der Plan ist: mehrere Anwendungen auf einem Server laufen je VTR laufen zu lassen.
z.B. UKW, FWD und weitere.

Die Unterscheidung soll nicht nach Port erfolgen sondern nach Domänenname
Dem allgemeinen Domänennamen (z.b. ukw.due.smv.de und fwd.due.smv.de) werden den selben IP-Adressen zu geordnet
z.B. ukw.due.smv.de -> 10.160.1|2|3.74
z.B. fwd.due.smv.de -> 10.160.1|2|3.74

_____ACHTUNG_
Planen wie Unterscheidung der Anwendungen in Zustandsdarstellungen....
Doch noch VTR in DNS Einbauen z.B.

brbvtr.ukw.due.smv.de -> 10.160.2.74
ukw.due.smv.de -> 10.160.1.74, 10.160.2.74, 10.160.3.74

Auf den jeweiligen Server muss dann das Routing anhand des Domänennamens erfolgen.

Dazu wird nginx wird als Router und ProxyServer vorgeschaltet.
 - zwischenspeicher statischer Inhalte wie Scripte, CSS und Bilder
 - Router zwischen verschiedenen Anwendungen auf gleichen Server

//TODO: server_name Testen und in DOku ergänutzen

## Konigurationsparameter

Dazu werden folgene Parameter in die conf.d/default.conf eingetragen
location / {
         proxy_pass http://localhost:3000;                 # wo soll hin geroutet werden
         proxy_http_version 1.1;                           # wo soll hin geroutet werden
         proxy_set_header X-Forwarded-For $remote_addr;    # wo setzte diesen Header in den http Request. Dient zu Identifizierung des Clients
         proxy_set_header X-Real-IP $remote_addr;          # wo setzte diesen Header in den http Request. Dient zu Identifizierung des Clients.
                                                           # Alternative zu Parameter vorher
         proxy_set_header Upgrade $http_upgrade;           # Default Parameter aus Konfiguration
         proxy_set_header Connection 'upgrade';            # Default Parameter aus Konfiguration
         proxy_set_header Host $host;                      # Default Parameter aus Konfiguration
         proxy_cache_bypass $http_upgrade;                 # Default Parameter aus Konfiguration
}
## Berücksichtigung in Web-Anwendung
Diese Einstellung muss je Web Anwendung erfolgen.
Port festlegungen auf localhost beachten

### hier in der app.js (zukünfig ukw.js)
Die Web Anwendung laufen dann nur noch auf localhost. Dies ist im Code bei internen Abfragen zu berücksichtigen.
server.listen(port, '127.0.0.1');

Des Weiteren ist zu beachten, das durch den vorgeschalteten nginx Router die Client, bzw Remote Adresse verborgen bleibt.
Varianten mit transparent Routing und DSR (Direct Server Response) erwiesen sich als nicht trivial.

Daher wird in der Konfiguration der Header mit x-forwarded-for mit der Client, Remote Adresse gesetzt.
Dies erfolgt beim Express Framework mit:
app.set('trust proxy', 'loopback')

Dadurch wird automatisch in den router-Modulen in den Funktion req.ip nach x-forwarded-for gesucht,
um die IP-Adresse des Clients zu ermitteln.
### hier in der socket.js
Im Modul socket.js muss die Ergänzung manuell gemacht werden.
z.B. mit:
const ipSocket = (socket.request.connection.remoteAddress === '127.0.0.1') ? socket.request.headers['x-forwarded-for'] : socket.request.connection.remoteAddress
