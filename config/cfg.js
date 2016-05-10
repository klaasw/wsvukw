var cfgIPs = {
    'httpIP': '10.22.30.1',    // 'httpIP': '10.22.30.100',
    'rfdIP': '10.22.30.1',
    'sipIP': '10.22.30.100',
};

var cfg = {
    'urlRFDWebservice': 'http://' + cfgIPs.rfdIP + ':8789/I_RFD_DUE_Steuerung',

    'jsSipConfiguration': {
        'ws_servers': 'ws://' + cfgIPs.sipIP + ':10080',
        'uri': 'sip:due@' + cfgIPs.httpIP + ':5060',
        'password': 'due'
        //'authorization_user': '1001',
        //'use_preloaded_route': true
        //'node_websocket_options': {
        //'origin': "192.168.56.104",
        // },
        //'hack_via_contact': true
    },
    'port': '3000',
    
    "intervall" : 5000

};

module.exports = cfg;

