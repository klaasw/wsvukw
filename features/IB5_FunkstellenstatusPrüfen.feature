Feature: Indienststellung des Arbeitsplatzes - Funkstellenstatus prüfen

  Als UKW-Display Nutzer möchte ich den Status der Funkstellen prüfen,
  um die Verfügbarkeit der Anlagen zu erfahren.

  Scenario: 10 Alle Funkstellen betriebsbereit
    Given ist der Arbeitsplatz UKW-Display NvD
    When alle Funkstellen-Anzeigen der Schaltflächen den Status "grün" anzeigen
    Then sind alle Funkstellen betriebsbereit

  Scenario: 11 Eine Funkstelle nicht betriebsbereit
    Given ist der Arbeitsplatz UKW-Display NvD
    When eine Funkstellen-Anzeige der Schaltflächen den Status "rot" anzeigt
    Then ist diese Funkstelle nicht betriebsbereit

  Scenario: 12 Wechsel der Funkstelle
    Given ist der Arbeitsplatz UKW-Display NvD
    And eine Funkstelle nicht betriebsbereit ist
    When ich auf den Button "Funkstelle" klicke
    And eine alternative Funkstelle auswähle
    Then dann wird auf diese Funkstelle umgeschaltet
    And der Status zeigt "grün"