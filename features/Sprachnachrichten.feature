Feature: UKW Display austesten

  Als Benutzer des UKW Display
  teste ich ankommende Sprachnachrichten

  Scenario: Aufruf UKWDisplay für Arbeitsplatz "EM NvD"
    When  Webseite "UKWDisplay/" aufgerufen wird
    Then  lautet der Titel "UKW Display"

  Scenario: Empfang beginnt auf EK-5
    When  SIPNachricht "RX" mit state "1" an FunkstellenID "1-H-RFD-EMSVTA-FKEK-5" gesendet wird
    Then  wird in "Button21" der Hintergrund "rot"

  Scenario: Empfang ende auf EK-5
    When  SIPNachricht "RX" mit state "0" an FunkstellenID "1-H-RFD-EMSVTA-FKEK-5" gesendet wird
    Then  wird in "Button21" der Hintergrund "weiss"

  Scenario: Senden beginnt auf EK-1
    When  SIPNachricht "TX" mit state "1" an FunkstellenID "1-H-RFD-EMSVTA-FKEK-1" gesendet wird
    Then  wird in "Button13" der Hintergrund "gruen"

  Scenario: Senden endet auf EK-1
    When  SIPNachricht "TX" mit state "0" an FunkstellenID "1-H-RFD-EMSVTA-FKEK-1" gesendet wird
    Then  wird in "Button13" der Hintergrund "weiss"


#Kommunikationskette:


  Scenario: Schalte Button11 ein
    Given Webseite "UKWDisplay/" aufgerufen wird
    And "Button11" Hintergrund ist "weiss"
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "blau"

  Scenario: Beginn ausgehende Übertragung TX an Funkstelle
    Given "Button11" Hintergrund ist "blau"
    When  SIPNachricht "TX" mit state "1" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "gruen"

  Scenario: Eingehende Übertragung RX an Funkstelle
    Given "Button11" Hintergrund ist "gruen"
    When  SIPNachricht "RX" mit state "1" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "rot"

  Scenario: Ende eingehende Übertragung RX an Funkstelle
    Given "Button11" Hintergrund ist "rot"
    When  SIPNachricht "RX" mit state "0" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "gruen"

  Scenario: Ende ausgehende Übertragung TX an Funkstelle
    Given "Button11" Hintergrund ist "gruen"
    When  SIPNachricht "TX" mit state "0" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "blau"

  Scenario: Schalte Button11 aus
    Given "Button11" Hintergrund ist "blau"
    When  Button "Button11" geschaltet wird
    Then  wird in "Button11" der Hintergrund "weiss"



  Scenario: Eingehende Übertragung während ausgehender Übertragung, Test ob rot "vorgeht"
    Given SIPNachricht "TX" mit state "1" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Given SIPNachricht "RX" mit state "0" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    And "Button11" Hintergrund ist "gruen"
    When  SIPNachricht "RX" mit state "1" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    Then  wird in "Button11" der Hintergrund "rot"
    And SIPNachricht "RX" mit state "0" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird
    And SIPNachricht "TX" mit state "0" an FunkstellenID "1-H-RFD-BORKLT-FKHK-1" gesendet wird

