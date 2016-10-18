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
- cfg.members = [cfg.member[x]] //für das x die entsprechende Nummer des verbleibenden Servers eintragen
- rs.reconfig(cfg, {force:true})

[Link zur MongoDB Dokumentation](https://docs.mongodb.com/manual/tutorial/reconfigure-replica-set-with-unavailable-members/)
