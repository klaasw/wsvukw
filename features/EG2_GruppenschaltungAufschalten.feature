Feature: Einzel- und Gruppenschaltung - Sprechweg Gruppenschaltung aufschalten

  Als NvD/Na schalte ich eine Gruppenschaltung auf,
  um über mehrere Kanäle hinweg zu kommunizieren.

#ready
#@watch
  Scenario: 26 Gruppenschaltung feste Sprechwege aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltfläche Zeile "1", Spalte "1" klicke
    When ich auf die Standardschaltfläche Zeile "1", Spalte "3" klicke
    Then ist die Schaltfläche Zeile "1", Spalte "1" aktiviert
    Then ist die Schaltfläche Zeile "1", Spalte "3" aktiviert

#todo
#@watch
  Scenario: 34 Gruppenschaltung mit Mehrkanal aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich eine Mehrkanalschaltfläche anklicke
    And einen Kanal auswähle
    And eine Standardschaltfläche aktiviere
    Then sind "2" Schaltflächen aktiv
    And die neue Kanalnummer wird in der Mehrkanalschaltfläche angezeigt

