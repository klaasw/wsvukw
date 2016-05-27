Feature: UKW Display austesten

  Als Benutzer des UKW Display
  teste ich die wesentlichen Funktionen der Seite

  Scenario: Aufruf UKWDisplay für Arbeitsplatz "JA NvD"
    When  Webseite "UKWDisplay/" aufgerufen wird
    Then  lautet der Titel "UKW Display"

  Scenario: Schalte Button11 ein
    Given Webseite "UKWDisplay/ukw_gr" aufgerufen wird
    And   Webseite "UKWDisplay/ukw_kl" aufgerufen wird
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "blau"

  Scenario: Schalte Button11 aus
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "weiss"




  Scenario: Schalte Button11 ein
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "blau"

  Scenario: Nur der letzte Button wird blau
    When  Button "Button12" geschaltet wird
    Then  wird in "Button11" der Hintergrund "weiss"
    And   wird in "Button12" der Hintergrund "blau"



  Scenario: Mehrkanalanlage umschalten auf Kanal 5
    When  Mehrkanalanlage "Button22" auf Kanal "5" umgeschaltet wird
    Then  wird in "Button22" der Kanal "5" angezeigt

  Scenario: Mehrkanalanlage umschalten auf Kanal 1 5
    When  Mehrkanalanlage "Button22" auf Kanaleingabefeld "1 5" eingegeben wird
    Then  wird in "Button22" der Kanal "15" angezeigt



  Scenario: Gruppenschaltung aktivieren
    Given Navigationselement Gruppe_Einzel "Einzelschaltung" anzeigt
    When  Navigationselement Gruppe_Einzel aktiviert wird
    Then  Navigationselement Gruppe_Einzel "Gruppenschaltung" anzeigt




  Scenario: Sende Mocknachricht
    When  SIPNachricht "RX" mit state "1" an FunkstellenID "1-H-RFD-BHVVTA-FKEK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "rot"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "RX" mit state "0" an FunkstellenID "1-H-RFD-BHVVTA-FKEK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "weiss"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "TX" mit state "1" an FunkstellenID "1-H-RFD-BHVVTA-FKEK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "gruen"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "TX" mit state "1" an FunkstellenID von "Button11" gesendet wird
    Then  wird in "Button11" der Hintergrund "gruen"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "TX" mit state "0" an FunkstellenID "1-H-RFD-BHVVTA-FKEK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "weiss"
    And   Test jetzt beenden
