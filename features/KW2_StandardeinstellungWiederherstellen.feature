Feature: Kanalwechsel Mehrkanalanlage - Standardeinstellung wiederherstellen

  Als NvD/Na möchte ich die Standardeinstellungen der Mehrkanalanlage meines Arbeitsplatzes wieder herstellen,
  um definierte Arbeitsbedingungen bspw. bei Schichtwechsel gewährleisten zu können.

  Scenario: 21 Standardzuordnung Mehrkanalanlagen wiederherstellen
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich auf den Button "Standardzuordnungen wiederherstellen" klicke
    Then sind die in der Konfiguartion derfinierten Standardeinstellungen wiederhergestellt
