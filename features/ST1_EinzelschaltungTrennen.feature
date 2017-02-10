Feature: Schalten/Trennen von Sprechwegen - Fester Sprechweg Einzelschaltung

  Als NvD/Na schalte ich einen festen Sprechweg bei Einzelschaltung auf,
  mit dem Ziel über diesen Sprechweg mit einem Teilnehmer eines Kanals zu kommunizieren.
  #@watch
  Scenario: 13 Fester Sprechweg für Einzelschaltung aufschalten
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf die Standardschaltfläche klicke
    And ich eine inaktive Standardschaltfläche anklicke
    Then ist der Status der Schaltfläche "aktiv"
  #@watch
  Scenario: 32 Fester Sprechweg für Einzelschaltung trennen
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And Einzelschaltung und Standardschaltfläche ist aktiv
    When ich eine aktive Standardschaltfläche anklicke
    Then ist der Status der Schaltfläche "inaktiv"
  #@watch
  Scenario: 15 Aufschalten einer Einzelschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf die Standardschaltfläche klicke
    And ich eine Mehrkanalschaltfläche anklicke
    And ich einen Kanal auswähle
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanalschaltfläche
