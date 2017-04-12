Feature: ST2 Schalten/Trennen von Sprechwegen - Fester Sprechweg Gruppenschaltung

Als NvD/Na schalte ich einen festen Sprechweg bei Gruppenschaltung auf,
mit dem Ziel über diesen Sprechweg mit Teilnehmern mehrerer Kanäle zu kommunizieren.
  #ready
  @watch
  Scenario: 14 für Gruppenschaltung aufschalten und trennen
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltflächen klicke
      | Zeile |Spalte|
      | 1 | 1 |
      | 3 | 4 |
      | 1 | 4 |
    And ich auf die Standardschaltflächen klicke
      | Zeile |Spalte|
      | 1 | 1 |
      | 3 | 4 |
      | 1 | 4 |

    Then ist keine Schaltfläche aktiv

  #todo
  #@watch
  Scenario: 16  Aufschalten einer Gruppenschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich die "Gruppenschaltung" aktiviere
    And eine Mehrkanalschaltfläche anklicke
    And eine weitere Standardschaltflächen aufschalte
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanalschaltfläche
