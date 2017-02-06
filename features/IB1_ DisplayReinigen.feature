Feature: Indienststellung des Arbeitsplatzes - Display reinigen

  Als UKW Display Nutzer möchte ich die letzten Anrufe einsehen, um über vergangene Kommunikationen informiert zu sein.
 #@watch
  Scenario: 1 Kein Aufschalten bei Displaysperrung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Display sperren" klicke
    Then  kann ich in den nächsten "30" Sekunden keine Kommunikation aufschalten
  #@watch
  Scenario: 3 Farbschema ändern
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When wenn ich auf den Button "Farbschema" klicke
    And ich ein Design auswähle
    Then ändern die Schaltflächen ihre Farbe
    And ändert der Header seine Farbe