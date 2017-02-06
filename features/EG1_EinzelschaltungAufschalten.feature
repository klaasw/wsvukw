Feature: Einzel- und Gruppenschaltung - Sprechweg Einzelschaltung aufschalten

  Als NvD/Na schalte ich einen Einzelkanal
  zum Senden auf, um darüber zu kommunizieren.

  Scenario: 22 Einzelschaltung fester Sprechweg aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Einzelschaltung aktiviere
    Then kann ich eine Schaltfläche aktivieren

  Scenario: 33 Einzelschaltung Mehrkanal aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Einzelschaltung aktiviere
    And eine Mehrkanal-Schaltfläche anklicke
    And einen Kanal auswähle
    Then kann ich nur eine Schaltfläche aktivieren
    And die neue Kanalnummer wird in der Mehrkanal-Schaltfläche angezeigt

  Scenario: 23 ATIS-Kennung wird angezeigt
    Given ist der Arbeitsplatz UKW-Display NvD
    And Einzelschaltung ist aktiviert
    When ein Teilnehmer mit ATIS-Kennung eine Nachricht sendet
    Then wird die ATIS-Kennung in der Schaltfläche angezeigt

  Scenario: 24 ATIS-Kennung wird nicht angezeigt
    Given ist der Arbeitsplatz UKW-Display NvD
    When ein Teilnehmer ohne ATIS-Kennung eine Nachricht sendet
    Then wird die ATIS-Kennung nicht in der Schaltfläche angezeigt

  Scenario: 25 Gespräch über Gleichwellenanlage
    Given ist der Arbeitsplatz UKW-Display NvD
    When eine Kommunikation über eine Gleichwellenanlage stattfindet
    Then zeigt dies der Button Gleichwellenanlage in der Schlatfläche an



