'use strict';

(function (window, document, $) {

    WSV.Utils = {

	    audioAlarm: {},

        init: function () {
	        this.audioAlarm = new Audio('burst4.wav');
        },

        //Pruefe ob Wert in Objekt vorkommt
        hatWert: function (obj, value) {
            for (var id in obj) {
                if (obj[id] == value) {
                    return true;
                }
            }
            return false;
        }
    }

})(window, document, jQuery);