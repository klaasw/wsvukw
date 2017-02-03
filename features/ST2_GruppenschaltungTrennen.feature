Feature: Schalten/Trennen von Sprechwegen - Fester Sprechweg Gruppenschaltung

Als NvD/Na schalte ich einen festen Sprechweg bei Gruppenschaltung auf,
mit dem Ziel über diesen Sprechweg mit Teilnehmern mehrerer Kanäle zu kommunizieren.

  Scenario: 14 Feste Sprechwege für Gruppenschaltung aufschalten
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich Gruppenschaltung aktiviere
    And eine Standard-Schaltflächen aufschalte
    And eine weitere Standard-Schaltflächen aufschalte
    Then ist der Status aller Schaltflächen "aktiv"

  Scenario: 16  Aufschalten einer Gruppenschaltung bei einer Mehrkanalanlage
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich die Gruppenschaltung aktiviere
    And eine Mehrkanal-Schaltfläche anklicke
    And eine weitere Standard-Schaltflächen aufschalte
    Then ist der Status aller Schaltflächen "aktiv"
    And sehe ich den ausgewählten Kanal in der Mehrkanal-Schaltfläche