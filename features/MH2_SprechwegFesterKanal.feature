Feature: Mithören - Sprechweg zum Mithören aufschalten

  Als NvD/Na schalte ich einen bestimmten Sprechweg auf,
  dieser kann entweder ein fester Sprechweg oder ein Mehrkanalweg sein, um diesen mitzuhören.

  Scenario: 18 Sprechweg zum Mithören aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich auf "Einstellungen einer nicht aktiven Schaltfläche" klicke
    And ich einen auf diesen Kanal aufgeschalteten Arbeitsplatz auswähle
    Then kann ich bei der Kommunikation mithören