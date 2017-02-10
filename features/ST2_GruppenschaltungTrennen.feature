Feature: Schalten/Trennen von Sprechwegen - Fester Sprechweg Gruppenschaltung

Als NvD/Na schalte ich einen festen Sprechweg bei Gruppenschaltung auf,
mit dem Ziel über diesen Sprechweg mit Teilnehmern mehrerer Kanäle zu kommunizieren.
  #@watch
  Scenario: 14 Feste Sprechwege für Gruppenschaltung aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich Gruppenschaltung aktiviere
    And eine Standardschaltflächen aufschalte
    And eine weitere Standardschaltflächen aufschalte
    Then ist der Status aller Schaltflächen "aktiv"
  #@watch
  Scenario: 16  Aufschalten einer Gruppenschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich die "Gruppenschaltung" aktiviere
    And eine Mehrkanalschaltfläche anklicke
    And eine weitere Standardschaltflächen aufschalte
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanalschaltfläche