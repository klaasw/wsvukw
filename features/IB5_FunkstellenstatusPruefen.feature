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

  #todo kein Mock
  #@watch
  Scenario: 11 Eine Funkstelle nicht betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When eine Funkstellenanzeige der Schaltflächen den Status "rot" anzeigt
    Then ist diese Funkstelle nicht betriebsbereit

  #todo in progress
  @watch
  Scenario: 12 Wechsel der Funkstelle
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Funkstellen der Standardschaltfläche Zeile "1", Spalte "3" klicke
    And die inaktive Funkstelle "1-H-RFD-DASORT-FKEK-3" auswähle
    Then dann wird die Schaltfläche auf die Funkstelle "1-H-RFD-DASORT-FKEK-3" umgeschaltet