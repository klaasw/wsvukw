Feature: Einzel- und Gruppenschaltung - Sprechweg Einzelschaltung aufschalten

  Als NvD/Na schalte ich einen Einzelkanal
  zum Senden auf, um darüber zu kommunizieren.

  Scenario: 3.A Farbschema ändern - Variante A: 'Standard' -> 'Flach'
  Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Farbschema" klicke
    And ich das Design "Flach" auswähle
    Then ändert sich die Farbe der Navigationsleiste in "#2c3e50"
