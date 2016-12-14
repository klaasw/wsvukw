'use strict';

(function (window, document, $) {

    WSV.Utils = {
        init: function () {
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