Feature: UKW Display austesten

  Als Benutzer des UKW Display
  teste ich Kanal-Umschaltungen

  Scenario: Aufruf UKWDisplay für Arbeitsplatz "EM NvD"
    When  Webseite "UKWDisplay/" aufgerufen wird
    Then  lautet der Titel "UKW Display"

  Scenario: Schalte Button11 ein
#    Given Webseite "UKWDisplay/ukw_gr" aufgerufen wird
#    And   Webseite "UKWDisplay/ukw_kl" aufgerufen wird
#    And   Webseite "UKWDisplay/ukw" aufgerufen wird
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


# FunkstellenID aus dem Button bestimmen (aus Konfig...)
#  Scenario: Sende Mocknachricht
#    When  SIPNachricht "TX" mit state "1" an FunkstellenID von "Button11" gesendet wird
#    Then  wird in "Button11" der Hintergrund "gruen"


