'use strict';

(function (window, document, $) {

	WSV.Utils = {
		audioAlarm: {},
		init: function () {
			this.audioAlarm = new Audio('burst4.wav');
		},

		//Pruefe ob Wert in Objekt vorkommt
		hatWert: function (obj, value) {
			for (const id in obj) {
				if (obj[id] == value) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Werte eines Objektes als Key eines Objektes zurueckgben
		 * Tausche Key - Value
		 * @param  {Object} obj Objekt
		 * @return {Obejkt}     Objekt mit den Werten als KEy
		 */
		objektWerteAlsKey: function (obj) {
			const neuesObjekt = []
			for (const key in obj) {
				neuesObjekt[obj[key]] = key
			}
			return neuesObjekt
		},

		sammelStatusAendern: function (elementeListe) {
			let sammelStatus = '0'
			$(elementeListe.selector).each( function() {
				if ($(this).attr('geraetStatus') == 1) {
					sammelStatus = '1'
				}
			})

			return sammelStatus
		}
	}

})(window, document, jQuery);
