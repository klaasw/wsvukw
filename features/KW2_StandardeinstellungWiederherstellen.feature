Feature: KW2 Kanalwechsel Mehrkanalanlage - Standardeinstellung wiederherstellen

  Als NvD/Na möchte ich die Standardeinstellungen der Mehrkanalanlage meines Arbeitsplatzes wieder herstellen,
  um definierte Arbeitsbedingungen bspw. bei Schichtwechsel gewährleisten zu können.

  #todo Mehrkanal noch nicht implementiert
  #@watch
  Scenario: 21 Standardzuordnung Mehrkanalanlagen wiederherstellen
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Standardzuordnungen wiederherstellen" klicke
    Then sind die in der Konfiguartion derfinierten Standardeinstellungen wiederhergestellt
