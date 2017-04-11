Feature: Einzel- und Gruppenschaltung - Zwischen Schaltungen wechseln

  Als NvD/Na möchte ich zwischen Einzel- und Gruppenschaltung hin- und herschalten,
  um je nach Nachrichtenlage meine Kommunikationsreichweite zu bestimmen, beim Wechsel der Schaltungen
  werden die zuletzt in diesem Modus aktiven Schaltzustände wiederhergestellt.

  #ready
  @watch
  Scenario: 27A Wechsel von Gruppenschaltung zu Einzelschaltung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Gruppenschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltfläche Zeile "1", Spalte "1" klicke
    And ich auf die Standardschaltfläche Zeile "1", Spalte "3" klicke
    And "Einzelschaltung" ist aktiviert
    And "Gruppenschaltung" ist aktiviert
    Then ist die Schaltfläche Zeile "1", Spalte "1" aktiviert
    And ist die Schaltfläche Zeile "1", Spalte "3" aktiviert

  #ready
  @watch
  Scenario: 27B Wechsel von Einzelschaltung zu Gruppenschaltung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    And "Einzelschaltung" ist aktiviert
    And alle Schaltflächen sind deaktiviert
    When ich auf die Standardschaltfläche Zeile "3", Spalte "1" klicke
    And "Gruppenschaltung" ist aktiviert
    And "Einzelschaltung" ist aktiviert
    Then ist die Schaltfläche Zeile "3", Spalte "1" aktiviert