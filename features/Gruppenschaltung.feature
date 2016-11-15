Feature: Gruppenschaltung austesten

  Als Benutzer des UKW Display
  teste ich die Gruppen/Einzelschaltung aus

  Scenario: Gruppenschaltung aktivieren
    Given Webseite "UKWDisplay/" aufgerufen wird
    When Navigationselement Gruppe_Einzel "Einzelschaltung" anzeigt
    When  Navigationselement Gruppe_Einzel aktiviert wird
    Then  Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt


  Scenario: Schalte in Gruppenschaltung vier Kanäle ein
    Given Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt
    And "Button11" Hintergrund ist "weiss"
    And "Button12" Hintergrund ist "weiss"
    And "Button21" Hintergrund ist "weiss"
    And "Button22" Hintergrund ist "weiss"
    When Button "Button11" geschaltet wird
    And Button "Button12" geschaltet wird
    And Button "Button21" geschaltet wird
    And Button "Button22" geschaltet wird
    Then wird in "Button11" der Hintergrund "blau"
    And wird in "Button12" der Hintergrund "blau"
    And wird in "Button21" der Hintergrund "blau"
    And wird in "Button22" der Hintergrund "blau"


  Scenario: Schalte in Gruppenschaltung alle vier Kanäle wieder aus
    Given Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt
    And "Button11" Hintergrund ist "blau"
    And "Button12" Hintergrund ist "blau"
    And "Button21" Hintergrund ist "blau"
    And "Button22" Hintergrund ist "blau"
    When Button "Button11" geschaltet wird
    And Button "Button12" geschaltet wird
    And Button "Button21" geschaltet wird
    And Button "Button22" geschaltet wird
    Then wird in "Button11" der Hintergrund "weiss"
    And wird in "Button12" der Hintergrund "weiss"
    And wird in "Button21" der Hintergrund "weiss"
    And wird in "Button22" der Hintergrund "weiss"


  Scenario: Kanal-Schaltzustände bleiben bei Wechsel zurück in die Gruppenschaltung erhalten
    Given Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt
    And Button "Button21" geschaltet wird
    And Button "Button21" Hintergrund ist "blau"
    And Button "Button22" geschaltet wird
    And Button "Button22" Hintergrund ist "blau"
    When Navigationselement Gruppe_Einzel aktiviert wird
    And Navigationselement Gruppe_Einzel "Einzelschaltung" anzeigt
    And Button "Button21" Hintergrund ist "weiss"
    And Button "Button22" Hintergrund ist "weiss"
    And Button "Button12" geschaltet wird
    And Button "Button12" Hintergrund ist "blau"
    And Navigationselement Gruppe_Einzel aktiviert wird
    Then  Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt
    And "Button12" Hintergrund ist "weiss"
    And "Button21" Hintergrund ist "blau"
    And "Button22" Hintergrund ist "blau"

  Scenario: Kanal-Schaltzustand in Einzelschaltung aus vorherigem Test bleibt erhalten
    Given Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt
    When Navigationselement Gruppe_Einzel aktiviert wird
    And Navigationselement Gruppe_Einzel "Einzelschaltung" anzeigt
    Then wird in "Button12" der Hintergrund "blau"
    And ist in "Button21" der Hintergrund "weiss"
    And ist in "Button22" der Hintergrund "weiss"

