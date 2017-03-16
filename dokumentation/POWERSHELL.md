## Powershell Skript
Das Powershell Skript user_zu_ip.ps1 überträgt Benutzernamen und IP-Adresse an die im Skript eingetragenen Server.
Dies sind zur Zeit die UKW-Server. Auf diesen ist eine REST Schnittstelle /user/addWindowsUser eingerichtet.

Das Skript ist in den Windows Gruppenrichtlinien als Logon-Skript eingetragen


### Vorbereitung
Zum Ausführung auf den Clients müssen installiert sein:
- Dot Net Framework. Aktuelle Version liegt auf dem Server \\10.160.1.42\ibm\software\dotnet
- Powershell Version 4. Aktuelle Version liegt auf dem Server \\10.160.1.42\ibm\software\update_powershell


### Remote Installation
Dateien auf Rechner kopieren zB C:\updates
- TODO: Kopier Skript wurde mal von IBM erstellt. Liegt irgendwo auf Server

- Remote Ausführung mit dem Tool "PsExec"
Das Tool ist auf dem 10.160.1.42 unter wsa\SW-Verteilung installiert.
mit den folgenden Befehlen wird die Installtion im Hintergrund ausgeführt.
ACHTUNG der letzte Befehl führt einen neustart aus. Dies kann mit /norestart verhindert werden.

```
.\PsExec.exe -s \\10.59.129.131 dotNetFx45_Full_setup.exe /q

.\PsExec.exe -s \\10.59.129.131 wusa c:\updates\Windows6.1-KB2819745-x86-MultiPkg.msu /passive /quiet
```
