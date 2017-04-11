/**
 * Created by rwild on 02.02.2017.
 */

var cfg = require('../../../cfg.js');
var row, column;

//header elements & buttons
var header_el = ".navbar-collapse.collapse";
var ukwDisplayLogo = "#logo";
var aktuelleSchaltung = "#statusWechsel>a";
var btnColor = "#buttonThemeSwitcher";
var btnArbeitsplatzgeraete = "#buttonAG";
var listArbeitsplatzgeraete = "#AGListe";
var btnServeranlagen = "#buttonServerWechsel";

//header feature
var listServeranlagen = "#serverListe";
var fade_in = "div.modal.fade.in";
var displayLock = "#displaySperreModal";

//color themes
var stdTheme = ".theme1 .switch-theme.btn";
var flatTheme = ".theme2 .switch-theme.btn";
var darklyTheme = ".theme3 .switch-theme.btn";
var cyborgTheme = ".theme4 .switch-theme.btn";

function selectPanel(row, column){
    return ".content #Button" + row + column + "panel";
}


widgets.open = {
    openSite: function(url){
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay", "");
        browser.url(openUrl);
    }
};

widgets.header = {
    //gibt aktuelle Schaltung (Einzel- oder Gruppen) zurück
    getMode: function(){
        return browser.element(aktuelleSchaltung).getText();
    },
    //umschalten zwischen Einzel- und Gruppenschaltung
    setMode: function(mode){
        if(mode != browser.element(aktuelleSchaltung).getText()){
            browser.click(aktuelleSchaltung);
        }
    },
    clickColor: function(){
        browser.click(btnColor);
    },
    clickDevices: function(){
        browser.click(btnArbeitsplatzgeraete);
    },
    clickServer: function(){
        browser.click(btnServeranlagen);
    },
    //klickt auf das Logo und aktiviert die Displaysperre
    clickUkwDisplay: function(){
        browser.click(ukwDisplayLogo);
        browser.waitForExist(fade_in);
    },
    //schaltet das Farbschema um
    selectColor: function(color){
        switch(color) {
            case "Standard":
                browser.waitForExist(stdTheme);
                browser.click(stdTheme);
                break;
            case "Flach":
                browser.waitForExist(flatTheme);
                browser.click(flatTheme);
                break;
            case "Dunkel / marineblau":
                browser.waitForExist(darklyTheme);
                browser.click(darklyTheme);
                break;
            case "Dunkel / hellblau":
                browser.waitForExist(cyborgTheme);
                browser.click(cyborgTheme);
                break;
        }
    },
    //prüft den Status der Arbeitsgeräte
    getStateDevices: function(){
        return browser.elements(listArbeitsplatzgeraete+">li");
    },
    //prüft den Status der Serveranlage
    stateServer: function(){
        var test = browser.elements(listServeranlagen+" #buttonWHV_DUE").getText();
    },
    //prüft ob der Display gesperrt ist
    checkIfDisplayBlocked: function(){
        return browser.isVisible(displayLock);
    }
};

widgets.content = {
    //klickt auf spezifische Schaltfläche, bestimmt durch Zeile und Spalte in Desktop-View
    clickOnPanel: function(row,column){
        browser.click(selectPanel(row,column));
    },
    //klickt auf alle Schaltflächen der Datatable, bestimmt durch Zeile und Spalte in Desktop-View
    clickOnPanels: function(datatable){
        var data = datatable.rows();
            for (var i in data) {
                browser.click(selectPanel(data[i][0],data[i][1]));
            }

    },
    //klickt auf Funkstation einer Schaltfläche, bestimmt durch Zeile und Spalte in Desktop-View
    clickOnFunkPanel: function(row,column){
        var fp = selectPanel(row,column) +" #standortListe";
        browser.click(fp);
        return browser.elements(fp+"first-child");
    },
    //gibt Farbe des Headers zurück
    getHeaderHexColor: function(){
        var color = browser.element(header_el).getCssProperty('color');
        return color["parsed"].hex;
    },
    //prüft ob Schaltfläche aufgeschaltet ist
    isPanelActive: function(row,column){
        var activeSF = selectPanel(row,column) + ".panel-primary";
        if(browser.isVisible(activeSF)){
            return true;
        }
        return false;
    },
    //deaktiviert alle aufgeschalteten Schaltflächen
    setAllPanelInactive: function(){
        var elements = browser.elements(".panel-primary");
        for (const element of elements.value) {
            browser.elementIdClick(element.ELEMENT).value;
        }
    },
    //wählt eine Funkstation einer Schaltfläche aus
    setFunkstation: function(id){
        var id = "li[id='"+ id+"'] div.radio";
        var test = browser.elements(id);
        browser.click(id);
    },
    //gibt die aktive Funkstelle einer Schaltfläche zurück
    getActiveFunkstation: function(row,column){
        var panel = selectPanel(row,column);
        browser.click(panel+" #standortListe");
        var id = panel+" div.radio.checked";
        return browser.getText(id);
    }
};
