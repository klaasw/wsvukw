Feature: EG1 Einzel- und Gruppenschaltung - Sprechweg Einzelschaltung aufschalten

  Als NvD/Na schalte ich einen Einzelkanal
  zum Senden auf, um darüber zu kommunizieren.
  #ready
  #@watch
  Scenario: 22A Einzelschaltung fester Sprechweg aufschalten und wechseln
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Einzelschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltfläche Zeile "1", Spalte "1" klicke
    Then ist die Schaltfläche Zeile "1", Spalte "1" aktiviert

  #ready
  #@watch
  Scenario: 22B Einzelschaltung fester Sprechweg wechseln
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Einzelschaltung" ist aktiviert
    And die Standardschaltfläche Zeile "1", Spalte "1" ist aktiviert
    When ich auf die Standardschaltfläche Zeile "2", Spalte "1" klicke
    Then ist die Schaltfläche Zeile "2", Spalte "1" aktiviert

  #todo
  #@watch
  Scenario: 33 Einzelschaltung Mehrkanal aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf die Standardschaltfläche klicke
    And eine Mehrkanalschaltfläche anklicke
    And einen Kanal auswähle
    Then kann ich nur eine Schaltfläche aktivieren
    And die neue Kanalnummer wird in der Mehrkanalschaltfläche angezeigt

  # Mock fehlerhaft todo
  #@watch
  Scenario: 23A ATIS Kennung wird angezeigt
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ein Teilnehmer eine SIPNachricht "TX" mit Status "0" an die Funkstelle "1-H-RFD-WARVTA-FKEK-3" mit Kanal "73" sendet
    Then wird die ATIS Kennung in der Schaltfläche angezeigt

  # Mock fehlerhaft todo
  #@watch
  Scenario: 23B ATIS Kennung wird angezeigt
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ein Teilnehmer eine SIPNachricht "TX" mit Status "0" an die Funkstelle "1-H-RFD-WARVTA-FKEK-3" sendet
    Then wird die ATIS Kennung in der Schaltfläche angezeigt

    #todo
  #@watch
  Scenario: 24 ATIS Kennung wird nicht angezeigt
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ein Teilnehmer ohne ATIS Kennung eine Nachricht sendet
    Then wird die ATIS Kennung nicht in der Schaltfläche angezeigt

    #todo
  #@watch
  Scenario: 25 Gespräch über Gleichwellenanlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When eine Kommunikation über eine Gleichwellenanlage stattfindet
    Then zeigt dies der Button Gleichwellenanlage in der Schlatfläche an
