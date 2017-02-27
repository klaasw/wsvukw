Feature: Einzel- und Gruppenschaltung - Sprechweg Gruppenschaltung aufschalten

  Als NvD/Na schalte ich eine Gruppenschaltung auf,
  um über mehrere Kanäle hinweg zu kommunizieren.
#@watch
  Scenario: 26 Gruppenschaltung feste Sprechwege aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich die "Gruppenschaltung" aktiviere
    Then kann ich weitere Schaltflächen aktivieren
#@watch
  Scenario: 34 Gruppenschaltung mit Mehrkanal aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich die "Gruppenschaltung" aktiviere
    And eine Mehrkanalschaltfläche anklicke
    And einen Kanal auswähle
    And eine Standardschaltfläche aktiviere
    Then sind "2" Schaltflächen aktiv
    And die neue Kanalnummer wird in der Mehrkanalschaltfläche angezeigt
