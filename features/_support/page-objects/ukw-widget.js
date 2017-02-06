/**
 * Created by rwild on 02.02.2017.
 */

var cfg = require('../../../cfg.js');
var root = '.content ';

var selectors = {
    sf11 : root + '#Button11panel',
    sf12 : root + '#Button12panel',
    sf13 : root + '#Button13panel'
};

widgets.open = {
    openSite: function(url){
        var ip = cfg.cfgIPs.httpIP;
        var port = cfg.port;
        var openUrl = "http://" + ip + ":" + port + url.replace("UKWDisplay", "");
        browser.url(openUrl);
    },
    clickOnSchaltfläche: function(sf_number){
        var sfClick = selectors.root + "#Button" + sf_number + "panel";
        console.log("#######################"+sfClick);
        browser.click(sfClick);
    }
};

widgets.schaltflächen = {
    clickOnSchaltfläche: function(sf_number){
        var sfClick = selectors.root + "#Button" + sf_number + "panel";
        console.log("#######################"+sfClick);
        browser.click(sfClick);
    }
}