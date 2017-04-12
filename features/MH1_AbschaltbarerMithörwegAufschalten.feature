Feature: MH1 Mithören - Abschaltbarer/nicht abschaltbarer Mithörweg aufschalten

  Als NvD/Na schalte ich Mithörwege auf,
  um Kommunikationen über diese Wege mithören zu können.

  #todo Mithören noch nicht implementiert
  #@watch
  Scenario: 17 Abschaltbarer Mithörweg
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf die MHAN einer nicht aktiven Schaltfläche klicke
    And ich einen auf diesen Kanal aufgeschalteten Arbeitsplatz auswähle
    Then kann ich bei der Kommunikation mithören