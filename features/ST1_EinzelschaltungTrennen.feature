Feature: Schalten/Trennen von Sprechwegen - Fester Sprechweg Einzelschaltung

  Als NvD/Na schalte ich einen festen Sprechweg bei Einzelschaltung auf,
  mit dem Ziel über diesen Sprechweg mit einem Teilnehmer eines Kanals zu kommunizieren.

  Scenario: 13 Fester Sprechweg für Einzelschaltung aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Einzelschaltung aktiviere
    And ich eine inaktive Standard-Schaltfläche anklicke
    Then ist der Status der Schaltfläche "aktiv"

  Scenario: 32 Fester Sprechweg für Einzelschaltung trennen
    Given ist der Arbeitsplatz UKW-Display NvD
    And Einzelschaltung und Standard-Schaltfläche ist aktiv
    When ich eine aktive Standard-Schaltfläche anklicke
    Then ist der Status der Schaltfläche "inaktiv"

  Scenario: 15 Aufschalten einer Einzelschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Einzelschaltung aktiviere
    And ich eine Mehrkanal-Schaltfläche anklicke
    And ich einen Kanal auswähle
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanal-Schaltfläche