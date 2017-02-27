Feature: Indienststellung des Arbeitsplatzes - Funktionalität SPAN-/ MHAN-Status prüfen

  Als UKW Display Nutzer möchte ich den Status der SPAN und MHAN prüfen, um die Funktion der Geräte sicherzustellen.
  #@watch
  Scenario: 5 Alle SPAN und MHAN betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Arbeitsplatzgeräte" klicke
    And alle Geräte den Status "grün" anzeigen
    Then sind alle Arbeitsplatzgeräte betriebsbereit
  #@watch
  Scenario: 6 Nicht alle SPAN und MHAN  betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Arbeitsplatzgeräte" klicke
    And ein Gerät den Status "rot" anzeigt
    Then sind nicht alle Arbeitsplatzgeräte betriebsbereit