Feature: Indienststellung des Arbeitsplatzes - Letzte Anrufe prüfen

  Als UKW-Display Nutzer möchte ich die letzten Anrufe einsehen, um über vergangene Kommunikationen informiert zu sein.

  Scenario: 4 Liste der letzten Anrufe prüfen
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich auf den Button "Letzte Anrufe" klicke
    Then  sehe ich die Liste der letzten "5" Anrufe