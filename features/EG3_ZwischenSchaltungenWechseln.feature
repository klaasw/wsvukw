Feature: Einzel- und Gruppenschaltung - Zwischen Schaltungen wechseln

  Als NvD/Na möchte ich zwischen Einzel- und Gruppenschaltung hin- und herschalten,
  um je nach Nachrichtenlage meine Kommunikationsreichweite zu bestimmen.
#@watch
  Scenario: 27 Wechsel zwischen Einzel- und Gruppenschaltung
    Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich von Einzelschaltung zu Gruppenschaltung und zurück wechsle
    Then stellt sich die zuletzt in diesem Modus bestehende Schaltstellung wieder her