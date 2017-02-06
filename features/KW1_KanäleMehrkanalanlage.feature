Feature: Kanalwechsel Mehrkanalanlage - Kanäle für Mehrkanalanlage auswählen

  Als NvD/Na möchte ich die Kanäle für die Mehrkanalanlage auswählen,
  um eine Kommunikation über verschiedene Kanäle zu führen.

  Scenario: 19 Mehrkanalanlage gültig konfigurieren
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich eine Mehrkanal-Schaltfläche anklicke
    And ich einen gültigen Kanal auswähle
    Then sehe ich die neue Kanalnummer in der Mehrkanal-Schaltfläche

  Scenario: 20 Mehrkanalanlage ungültig konfigurieren
    Given ist der Arbeitsplatz UKW-Display NvD
    When ich eine Mehrkanal-Schaltfläche anklicke
    And ich einen ungültigen Kanal auswähle
    Then dann wird die Kanalnummer nicht geändert
    And die bestehende Aufschaltung bleibt