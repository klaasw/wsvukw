# Startskript für den UKW- Server
# erstellt: Klaas Wüllner, 4.2.16

# Verzeichnis erstellen für den OverSIP Prozess. Dieses muss nach Neustart des ganzen Server
# erstellt werden.
mkdir /var/run/oversip
echo "Verzeichnis /var/run/oversip erstellt"

# OverSIP Prozess starten. Dieser muss nach Neustart des ganzen Server gestartet werden
oversip -P /var/run/oversip/oversip.pid
echo "OverSIP gestartet"

# UKWServer starten mit forever und Logdatei
/home/ukwserver/forever start -w -a -l ukwserver.log /home/ukwserver/bin/www
echo "ukwserver mit Logging in /root/.forever/ukwserver.log gestartet"
 
