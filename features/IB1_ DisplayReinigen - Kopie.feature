Feature: Indienststellung des Arbeitsplatzes - Display reinigen

  Als UKW-Display Nutzer möchte ich die letzten Anrufe einsehen, um über vergangene Kommunikationen informiert zu sein.

  Scenario: Liste der letzten Anrufe prüfen
    Given ist der Arbeitsplatz UKW-Display NvD
    When wenn ich auf letzte Anrufe klicke
    Then  dann sehe ich die Liste der letzten 5 Anrufe