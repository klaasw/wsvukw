# PowerShell Skript überträgt die IP-Adresse und den Benutzernamen
# an den Server des UKW-Servers. Dieser schreibt dies wiederum in die Datenbank.
# Dies ist erforderlich für die Zuordnung der Benutzer/ Rollen zu den Rechnern im DUE.
# @author: Klaas Wüllner (klaas.wuellner@wsv.bund.de)
# @project: ukwDisplay für die WSV

echo 'Login Skript zur Übertragung des Benutzernamens und der IP-Adresse des Rechners auf dem sich der Benutzer angemeldet hat.'

# Array der möglichen Server
$server = @('http://10.162.1.65:3000/user/addWindowsUser',
            'http://10.162.2.65:3000/user/addWindowsUser',
            'http://10.162.4.65:3000/user/addWindowsUser')

# Benutername aus der Windows Anmeldung
$benutzer=$env:USERNAME

# IP-Adresse des Rechners auf dem das Skript ausgeführt wird
$ip=get-WmiObject Win32_NetworkAdapterConfiguration|where{$_.Ipaddress.length -gt 1}

# Zusammenstellung in ein JSON Objekt
$benutzerDaten = @{
   _id=$ip.ipaddress[0]
   ip=$ip.ipaddress[0]
   user=$benutzer
   loginZeit='Zeitstempel' #wird vom Server gesetzt. Hier nur als Platzhalter   
}

# Konvertierung in JSON
$json = $benutzerDaten | ConvertTo-Json

echo 'Übertragen werden folgende Informationen:'
$json #Ausgabe auf der Konsole


# Funktion zur Übertragung an den REST Service des Servers.
function sendeAnServer($serverNr){
    echo $('sende an: ' + $server[$serverNr])
    try {
        $response = Invoke-RestMethod $server[$serverNr] -Method Put -Body $json -ContentType 'application/json'
        echo 'Benutzerdaten erfolgreich übermittelt'
    }
    catch [System.Net.WebException] {
        echo 'Server nicht erreicht. Versuche nächsten...'
        $serverNr += 1
        sendeAnServer($serverNr)
    }
    catch {
        echo 'Kein Server erreichbar'
    }
}

# Aufruf der Funktion mit 0 für das erste Element im Array $server
sendeAnServer(0)

