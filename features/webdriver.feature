Feature: UKW Display austesten

  Als Benutzer des UKW Display
  teste ich die wesentlichen Funktionen der Seite

  Scenario: Aufruf UKWDisplay
    When  Webseite "http://10.22.30.1:3000" aufgerufen wird
    Then  lautet der Titel "UKW Display"

  @watch
  Scenario: Schalte Button11 ein
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "blau"

  @watch
  Scenario: Schalte Button11 aus
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "weiss"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "RX" mit state "0" an FunkstellenID "1" gesendet wird
    Then  wird in "Button11" der Hintergrund "gruen"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "RX" mit state "1" an FunkstellenID "1" gesendet wird
    Then  wird in "Button11" der Hintergrund "weiss"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "TX" mit state "0" an FunkstellenID "1" gesendet wird
    Then  wird in "Button11" der Hintergrund "rot"

  Scenario: Sende Mocknachricht
    When  SIPNachricht "TX" mit state "1" an FunkstellenID "1" gesendet wird
    Then  wird in "Button11" der Hintergrund "weiss"

