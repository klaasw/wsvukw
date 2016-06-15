Feature: Gruppenschaltung austesten

  Als Benutzer des UKW Display
  teste ich die Mehrkanal-Eigenschaften

  Scenario: Mehrkanalanlage umschalten auf Kanal 5
    Given Webseite "UKWDisplay/" aufgerufen wird
    And wird in "Button22" der Kanal "69" angezeigt
    When  Mehrkanalanlage "Button22" mit FunkstellenID "1-H-RFD-EMSVTA-FKMK-1" auf Kanal "5" umgeschaltet wird
    Then  wird in "Button22" der Kanal "5" angezeigt
    And Button "Button11" geschaltet wird
#sonst Problem mit dem Schließen des Mehrkanal-Dialogfensters

  Scenario: Mehrkanalanlage umschalten auf Kanal 6
    Given wird in "Button22" der Kanal "5" angezeigt
    When  Mehrkanalanlage "Button22" mit FunkstellenID "1-H-RFD-EMSVTA-FKMK-1" auf Kanal "6" umgeschaltet wird
    Then  wird in "Button22" der Kanal "6" angezeigt
    And Button "Button12" geschaltet wird
#sonst Problem mit dem Schließen des Mehrkanal-Dialogfensters

  Scenario: Mehrkanalanlage zurücksschalten 7
    Given wird in "Button22" der Kanal "6" angezeigt
    When  Mehrkanalanlage "Button22" mit FunkstellenID "1-H-RFD-EMSVTA-FKMK-1" auf Kanal "7" umgeschaltet wird
    Then  wird in "Button22" der Kanal "7" angezeigt
    And Button "Button21" geschaltet wird
#sonst Problem mit dem Schließen des Mehrkanal-Dialogfensters


#  Scenario: Mehrkanalanlage umschalten auf Kanal 1 5
#    When  Mehrkanalanlage "Button22" mit FunkstellenID "1-H-RFD-EMSVTA-FKMK-1" im Kanaleingabefeld "1 5" eingegeben wird
#    Then  wird in "Button22" der Kanal "15" angezeigt
