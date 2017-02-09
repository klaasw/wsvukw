# Testumgebung

## Überblick

Die Testumgebung ist im Referenznetz aufgebaut und kann als Teil des Referenzsystemsbetrachtet werden. Für die Anwendung ukwDisplay sind automatisierte Testfälle erstellt.
Diese sind Teil des Repositories.

Zur Testumgebung gehören:

- Gitlab-Server [10.160.1.200/ 10.161.9.200]
- Server ukwDisplay mit gitlab-runner [10.161.9.74]
 - chimp.js [als Extra Archiv...]
 - Ruby, Sass
 - node_modules [aus Extra Archive...]
- ukwServer mit oder/ohne gitlab-runner [10.161.9.x,y] --festlegen
- MongoDB als ReplicaSet [10.161.9.80,81,82]
- Server mit [10.161.9.142]:
 - SOAP UI und RFD MockService
 - Selenium als Hub
- Clients [10.161.9.120, 130] mit:
 - Chrome Browser
 - Selenium als Node und Chromedriver

Die Abbildung soll die Zusammenhänge grafisch verdeutlichen.

## Gitlab-Server
[Dokumentation zum Gitlab-Server](../GITLAB)

[Gitlab-Server](10.160.1.200)

Für die Testumgebung ist im Repository ein xyz.yml Datei enthalten. Diese enthält im Abschnitt scripts die auszuführenden Kommandos. Diese Kommandos werden auf dem ukwDisplay Server mit dem **gitlab-runner**.


## gitlab-runner
Installation 
