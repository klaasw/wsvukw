/**
 * Created by rwild on 02.02.2017.
 */

var cfg = require('../../../cfg.js');

var aktuelleSchaltung = "#statusWechsel>a";
var btnColor = "#buttonThemeSwitcher";
var stdTheme = ".theme1 .switch-theme.btn";
var flatTheme = ".theme2 .switch-theme.btn";
var darklyTheme = ".theme3 .switch-theme.btn";
var cyborgTheme = ".theme4 .switch-theme.btn";
var header_el = ".navbar-collapse.collapse";
var btnArbeitsplatzgeraete = "#buttonAG";
var listArbeitsplatzgeraete = "#AGListe";
var btnServeranlagen = "#buttonServerWechsel";
var listServeranlagen = "#serverListe";
var ukwDisplayLogo = "#logo";

widgets.open = {
    openSite: function(url){
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay", "");
        browser.url(openUrl);
    }
};

widgets.header = {
    getMode: function(){
        return browser.element(aktuelleSchaltung).getText();
    },
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
    clickUkwDisplay: function(){
        browser.click(ukwDisplayLogo);
    },
    selectColor: function(color){
        switch(color) {
            case "Standard":
                browser.waitForExist(stdTheme);
                browser.click(stdTheme);
                //browser.pause(20000);
                break;
            case "Flach":
                browser.waitForExist(flatTheme);
                browser.click(flatTheme);
                break;
            case "Dunkel / marineblau":
                browser.click(darklyTheme);
                //browser.pause(20000);
                break;
            case "Dunkel / hellblau":
                browser.click(cyborgTheme);
                //browser.pause(20000);
                //browser.waitForExist(displaySperreModal) -> https://chimp.readme.io/docs/tutorial
                break;
        }
    },
    getStateDevices: function(){
        return browser.elements(listArbeitsplatzgeraete+">li");
    },
    stateServer: function(){
        var test = browser.elements(listServeranlagen+" #buttonWHV_DUE").getText();
    },
    checkIfDisplayBlocked: function(){
        return browser.isVisible('#displaySperreModal');
    }
};

widgets.content = {
    clickOnPanel: function(row,column){
        var sf = ".content #Button" + row + column + "panel";
        browser.click(sf);
    },
    clickOnFunkPanel: function(row,column){
        var fp = ".content #Button" + row + column + "panel #standortListe";
        browser.click(fp);
        return browser.elements(fp+"first-child");
            //"ul[aria-labelledby='standortListe']+>li");
    },
    getHeaderHexColor: function(){
        var color = browser.element(header_el).getCssProperty('color');
        return color["parsed"].hex;
    },
    isPanelActive: function(row,column){
        var activeSF = ".content #Button" + row + column + "panel>div>div>div.btn-primary";
        if(browser.isVisible(activeSF)){
            return true;
        }
        return false;
    },
    setAllPanelInactive: function(){
        var elements = browser.elements('.panel-primary');
        for (const element of elements.value) {
            const text = browser.elementIdClick(element.ELEMENT).value;
        }
    },
    setFunkstation: function(id_){
        var id = "ul [aria-labelledby='standortListe']";
        //console.log(id);
    console.log(browser.element(id).selectByValue(id_));
        browser.click(id);
    }
};
