Feature: Indienststellung des Arbeitsplatzes - Display reinigen

  Als UKW-Display Nutzer möchte ich das Display reinigen können und das Farbschema ändern, mit dem Ziel eine problemlose Verwendung der Anwendung garantieren zu können.

 @watch
  Scenario: 1 Kein Aufschalten bei Displaysperrung
    #Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Display sperren" klicke
    Then  kann ich in den nächsten "30" Sekunden keine Kommunikation aufschalten

  @watch
  Scenario: 3.A Farbschema ändern - Variante A: 'Standard' -> 'Flach'
    #Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Farbschema" klicke
    And ich das Design "Flach" auswähle
    Then ändert sich die Farbe der Navigationsleiste in "#2c3e50"

  @watch
  Scenario: 3.B Farbschema ändern - Variante A: 'Standard' -> 'Marineblau'
   #Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Farbschema" klicke
    And ich das Design "Dunkel / marineblau" auswähle
    Then ändert sich die Farbe der Navigationsleiste in "#ffffff"

  @watch
  Scenario: 3.C Farbschema ändern - Variante A: 'Standard' -> 'Hellblau'
   #Given ist der Arbeitsplatz "UKWDisplay/" NvD
    When ich auf den Button "Farbschema" klicke
    And ich das Design "Dunkel / hellblau" auswähle
    Then ändert sich die Farbe der Navigationsleiste in "#888888"