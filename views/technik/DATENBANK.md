# Hilfe zur Datenbank

Die Mongodatenbank ist mit einer Replicaset Konfiguration als Cluster eingerichtet. Dabei ist ein Server der Primary (Master) und die anderen die Secondaries (Slaves).
Nur der Primary erlaubt Schreibaktionen. Von den Secondaries kann gelesen werden.


## Ausfälle (Server oder Netzwerk)
- Fällt ein Secondary weg bleibt der Primary erhalten.
- Fällt der Primary weg bestimment die beiden Secondaries einen neuen Primary
- Fallen zwei Instanzen aus kann automatisch kein neuer Primary bestimmt werden. Entsprechend der Dokumentation dient dies der Vermeidung von Dateninkonsistenzen....
Stelle aus der Doku noch mal raussuchen

Folgende Schritte sind dann auszuführen:
- Verbinden mit dem verbleibenden / festzulegenden Server
- mit mongo auf die MongoDB Shell verbinden
- cfg = rs.config()
- cfg.members = [cfg.members[x]] //für das x die entsprechende Nummer des verbleibenden Servers eintragen
- rs.reconfig(cfg, {force:true})

[Link zur MongoDB Dokumentation](https://docs.mongodb.com/manual/tutorial/reconfigure-replica-set-with-unavailable-members/)

## Ein Server fällt über längere Zeit aus.
Der Server befindet sich im Status:
`"stateStr" : "RECOVERING", und 
"lastHeartbeatMessage" : "still syncing, not yet to minValid optime 58035089:3"`

Für die Wiederherstellung müssen folgende Schritte druchgeführt werden:

1. Einloggen auf Server 
2. MongoDB Server stoppen
`systemctl stop mongodb`
3. Datenverzeichnis löschen Default ist /var/lib/mongodb oder in Konfig /etc/mongodb.conf nachsehen 
`# Where to store the data. 
dbpath=/var/lib/mongodb` 
4. in das Verzeichnis wechseln und alles löschen mit: 
`rm -r * `
5. mongodb neustarten
`systemctl start mongodb`


Auf anderer MongoDB den Status prüfen. Dieser sollte dann der Reihe nach DOWN, STARUP2, SECONDARY sein. 
`rs.status()`

[Link zur MongoDB Dokumentation](https://docs.mongodb.com/manual/tutorial/resync-replica-set-member/)
