Feature: Indienststellung des Arbeitsplatzes - DUE/ RFD-Status prüfen

  Als UKW Display Nutzer möchte ich den Status der DUE- und RFD-Anlagen prüfen,
  um die Verfügbarkeit der Serveranlagen zu erfahren.
  #@watch
  Scenario: 7 DUE/RFD alle betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Serveranlagen" klicke
    And alle Serveranlagen den Status "grün" anzeigen
    Then sind alle Anlagen betriebsbereit
  #@watch
  Scenario: 8 Nicht alle DUE/RFD betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Serveranlagen" klicke
    And ein Server den Status "rot" anzeigt
    Then dann sind nicht alle Server betriebsbereit
  #@watch
  Scenario: 9 Wechsel der Serveranlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And ausgewählt ist die defekte Serveranlage "WHV"
    When ich auf den Button "Serveranlagen" klicke
    And ich auf die Serveranlage "LUV" klicke
    Then wird die Serveranlage umgeschaltet von "WHV" auf "LUV"