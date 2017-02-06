Feature: Einzel- und Gruppenschaltung - Sprechweg Gruppenschaltung aufschalten

  Als NvD/Na schalte ich eine Gruppenschaltung auf,
  um über mehrere Kanäle hinweg zu kommunizieren.

  Scenario: 26 Gruppenschaltung feste Sprechwege aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Gruppenschaltung aktiviere
    Then kann ich viele/alle Schaltflächen aktivieren

  Scenario: 34 Gruppenschaltung mit Mehrkanal aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Gruppenschaltung aktiviere
    And eine Mehrkanal-Schaltfläche anklicke
    And einen Kanal auswähle
    And eine Standard-Schaltfläche aktiviere
    Then sind "2" Schaltflächen aktiv
    And die neue Kanalnummer wird in der Mehrkanal-Schaltfläche angezeigt

