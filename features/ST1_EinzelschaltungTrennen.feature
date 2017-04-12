Feature: ST1 Schalten/Trennen von Sprechwegen - Fester Sprechweg Einzelschaltung

  Als NvD/Na schalte ich einen festen Sprechweg bei Einzelschaltung auf,
  mit dem Ziel über diesen Sprechweg mit einem Teilnehmer eines Kanals zu kommunizieren.

  #ready
  #@watch
  Scenario: 32 Fester Sprechweg für Einzelschaltung trennen
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Einzelschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltflächen klicke
    | Zeile |Spalte|
    | 1 | 1 |
    | 3 | 4 |
    | 1 | 1 |
    Then ist die Schaltfläche Zeile "3", Spalte "4" nicht aufgeschaltet

  #todo Mehrkanal nocht nicht implementiert
  #@watch
  Scenario: 15 Aufschalten/Trennen einer Einzelschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf die Standardschaltfläche klicke
    And ich eine Mehrkanalschaltfläche anklicke
    And ich einen Kanal auswähle
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanalschaltfläche
