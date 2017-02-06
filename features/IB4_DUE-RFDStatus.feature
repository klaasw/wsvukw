Feature: Indienststellung des Arbeitsplatzes - DUE/ RFD-Status prüfen

  Als UKW-Display Nutzer möchte ich den Status der DUE- und RFD-Anlagen prüfen,
  um die Verfügbarkeit der Server-Anlagen zu erfahren.

  Scenario: 7 DUE/RFD alle betriebsbereit
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich auf den Button "Server-Anlagen" klicke
    And alle Server-Anlagen den Status "grün" anzeigen
    Then sind alle Anlagen betriebsbereit

  Scenario: 8 Nicht alle DUE/RFD betriebsbereit
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich auf den Button "Server-Anlagen" klicke
    And ein Server den Status "rot" anzeigt
    Then dann sind nicht alle Server betriebsbereit

  Scenario: 9 Wechsel der Server-Anlage
    Given ist der Arbeitsplatz UKW-Display NvD
    And ausgewählt ist die defekte Server-Anlage "WHV"
    When ich auf den Button "Server-Anlagen" klicke
    And ich auf die Server-Anlage "LUV" klicke
    Then wird die Server-Anlage umgeschaltet von "WHV" auf "LUV"