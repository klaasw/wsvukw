Feature: IB3 Indienststellung des Arbeitsplatzes - Funktionalität SPAN-/ MHAN-Status prüfen

  Als UKW Display Nutzer möchte ich den Status der SPAN und MHAN prüfen, um die Funktion der Arbeitsplatz-Geräte sicherzustellen.
  #ready
  #@watch
  Scenario: 5 Alle SPAN und MHAN betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Arbeitsplatzgeräte" klicke
    And eine Liste mit allen Arbeitsplatzgeräten mit Status wird angezeigt
    Then zeigen alle Geräte den Status "grün", d.h. sie sind betriebsbereit

  #todo Mock nicht fertig
  #@watch
  Scenario: 6 Nicht alle SPAN und MHAN  betriebsbereit
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Arbeitsplatzgeräte" klicke
    And ein Gerät den Status "rot" anzeigt
    Then sind nicht alle Arbeitsplatzgeräte betriebsbereit