Feature: Indienststellung des Arbeitsplatzes - Funkstellenstatus prüfen

  Als UKW Display Nutzer möchte ich den Status der Funkstellen prüfen,
  um die Verfügbarkeit der Anlagen zu erfahren.
  #ready
  #@watch
  Scenario: 10 Alle Funkstellen betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Funkstellen der Standardschaltfläche Zeile "1", Spalte "3" klicke
    Then werden alle Funkstellen mit Status "OK" angezeigt

  #todo kein Mock - Umschalten auf defekte Funkstelle ist noch möglich
  #@watch
  Scenario: 10 Eine Funkstelle nicht betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Funkstellen der Standardschaltfläche Zeile "1", Spalte "3" klicke
    And die inaktive Funkstelle "1-H-RFD-DASORT-FKEK-3" mit dem Status "grau" auswähle
    Then wird die Schaltfläche Zeile "1", Spalte "3" nicht auf die Funkstelle "1-H-RFD-DASORT-FKEK-3" umgeschaltet
    And die Schaltfläche Zeile "1", Spalte "3" hat die bestehende Funkstelle "1-H-RFD-DASORT-FKEK-3" aufgeschaltet

  #ready
  @watch
  Scenario: 12A Wechsel der Funkstelle bei Gruppenschaltung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Funkstellen der Standardschaltfläche Zeile "1", Spalte "3" klicke
    And die inaktive Funkstelle "1-H-RFD-DASORT-FKEK-3" auswähle
    Then wird die Schaltfläche Zeile "1", Spalte "3" auf die Funkstelle "1-H-RFD-DASORT-FKEK-3" umgeschaltet

  #ready
  @watch
  Scenario: 12B Wechsel der Funkstelle bei Einzelschaltung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Einzelschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Funkstellen der Standardschaltfläche Zeile "4", Spalte "3" klicke
    And die inaktive Funkstelle "1-H-RFD-WHVVTR-GWST-1" auswähle
    Then wird die Schaltfläche Zeile "4", Spalte "3" auf die Funkstelle "1-H-RFD-WHVVTR-GWST-1" umgeschaltet