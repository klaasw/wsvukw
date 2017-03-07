/**
 * Created by rwild on 02.02.2017.
 */

var cfg = require('../../../cfg.js');

var aktuelleSchaltung = "#statusWechsel>a";
var btnFarbschema = "#buttonThemeSwitcher";
var btnArbeitsplatzgeraete = "#buttonAGswitcher";
var stdTheme = ".theme1 .switch-theme.btn";
var flatTheme = ".theme2 .switch-theme.btn";
var darklyTheme = ".theme3 .switch-theme.btn";
var cyborgTheme = ".theme4 .switch-theme.btn";
var header_el = ".navbar-collapse.collapse";
var btnArbeitsplatzgeraete = "#buttonAG";
var listArbeitsplatzgeraete = "#AGListe";

widgets.open = {
    openSite: function(url){
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay", "");
        browser.url(openUrl);
    }
};

widgets.header = {
    clickDisplaysperre: function(){},

    setSchaltung: function(mode){
        if(mode =! browser.element(aktuelleSchaltung).getText()){
            browser.click(aktuelleSchaltung);
        }
    },
    clickFarbschema: function(){
        browser.click(btnFarbschema);
    },
    clickArbeitsplatzgeraete: function(){
        browser.click(btnArbeitsplatzgeraete);
    },
    selectFarbschema: function(color){
        switch(color) {
            case "Standard":
                browser.click(stdTheme);
                browser.pause(3000);
                break;
            case "Flach":
                browser.click(flatTheme);
                browser.pause(3000);
                break;
            case "Dunkel / marineblau":
                browser.click(darklyTheme);
                browser.pause(3000);
                break;
            case "Dunkel / hellblau":
                browser.click(cyborgTheme);
                browser.pause(3000);
                break;
        }
    },
    stateArbeitsplatzgerate: function(){
        return browser.elements(listArbeitsplatzgeraete+" #agspan01").getText();
    }
};

widgets.content = {
    clickOnSchaltfläche: function(sf_number){
        var sf = ".content #Button" + sf_number + "panel";
        browser.click(sf);
    },
    getHeaderHexColor: function(){
        var color = browser.element(header_el).getCssProperty('color');
        return color["parsed"].hex;
    }
};
