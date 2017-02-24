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

Für die Testumgebung ist im Repository eine .gitlab-ci.yml Datei enthalten. Diese enthält im Abschnitt scripts die auszuführenden Kommandos. Diese Kommandos werden auf dem hinterlegten Server mit dem **gitlab-runner** ausgeführt. Die Hinterlegung der "Testserver" mit dem gitlab-runner ist auf dem Gitlab-Server unter Runners eingestellt. Auf diesen Servern muss der gitlab-runner installiert sein und als Service laufen.

## gitlab-runner
[Installations Anlaeitung Internet](https://docs.gitlab.com/runner/install/linux-manually.html)
Download der Runner Datei und Ablage unter /usr/local/bin. Liegt auch auf dem Gitlab-Server
```
sudo wget -O /usr/local/bin/gitlab-ci-multi-runner https://gitlab-ci-multi-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-ci-multi-runner-linux-amd64
```

Rechte zum Ausführen ergänzen:
```
sudo chmod +x /usr/local/bin/gitlab-ci-multi-runner
```

Gitlab Benutzer anlegen (Linux)
```
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
```

Runner auf dem Gitlab Server erstellen.
-->TODO: Projekt -> Runner -> Erstelle Runner
Token kopieren
```
sudo gitlab-ci-multi-runner register
```

Runner als Service installieren (Linux)
```
sudo gitlab-ci-multi-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-ci-multi-runner start
```

## Server mit Selenium
Selenium dient zur Fernsteuerung von Browsern um automatisierte Tests durchzuführen. Dazu muss auf einem Rechner Selenium mit der Rolle `hub` gestartet sein.

```
java -jar selenium-server-standalone-2.53.0.jar -role -hub -host IP-ADRESSE
```

Vorbereitet dafür ist der Server 10.161.9.142.

## Client mit Selenium
Um die Fernsteuerung entgegenzunehmen muss auf einem anderen REchner Selenium mit der Rolle `hubHost` gestartet sein.

```
java -jar selenium-server-standalone-2.53.0.jar -role -hubHost -host IP-ADRESSE
```

## chimp.js
[chimp.js](https://chimp.readme.io/) ist die zentrale Schnittstelle zur Durchführung von automatisierten Test. Es ist das Bindeglied zwischen den Testmodulen (mocha, cucumber) und Selenium

In der Konfigurationsdatei chimps.js ist der Selenium Hub eingetragen 
