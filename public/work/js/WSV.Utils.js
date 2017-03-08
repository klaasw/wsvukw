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

		/**
		 * Ermittlung des Sammelstatus fuer die ArbeitsplatzGeraete
		 * Hier gibt es keine "Gelbmeldung"
		 * @param  {jQueryObject} elementeListe Alle HTML Elemente der Schaltflaeche Geraete
		 * @return {String}               Zahlenstring fuer den Summenstatus 0=gruen,
		 * 1=rot
		 */
		sammelStatusAendernSpanMhan: function (elementeListe) {
			let sammelStatus = '0'
			$(elementeListe).each( function() {
				if ($(this).attr('geraetStatus') == 1) {
					sammelStatus = '1'
				}
			})
			return sammelStatus
		},

		/**
		 * Attribut 'geraetStatus' eines HTML Elements pruefen
		 * @param  {htmlElement} element Einzelnes HTML Element
		 * @return {Integer}         Integer fuer Zustand 1=Fehler, 0=OK
		 */
		pruefeGeraetStatus: function (element) {
			if (element.attr('geraetStatus') == 1 || element.attr('geraetStatus') == -1) {
				return 1
			}
			else {
				return 0
			}
		},


		/**
		 * Ermittlung des Sammelstatus fuer Funkstellen bei mehrfach
		 * Zuordnung zu Schaltflaechen bei Redundanzanlagen und Gleichwellen
		 * Anlagen.
		 * @param  {jqueryObject} elementeListe Alle HTML Elemente der Schaltflaeche
		 * @return {String}                     Zahlenstring fuer den Summenstatus 0=gruen,
		 * 1=rot, 2=gelb
		 */
		sammelStatusAendernFunkstellen: function (elementeListe) {
			let sammelStatus     = '0'
			let anzahlFkgw       = 0;
			let anzahlFkgwError  = 0;
			let sammelStatusFkgw = null;
			let anzahlGwst       = 0;
			let anzahlGwstError  = 0;
			let sammelStatusGwst = null;
			let anzahlFkek       = 0;
			let anzahlFkekError  = 0;
			let sammelStatusFkek = null;
			// Durch elementeListe laufen und Inhalte pruefen
			$(elementeListe).each( function() {
				const test = elementeListe.length
				if ($(this).attr('id').indexOf('FKGW') > -1 ) {
					anzahlFkgw      += 1;
					anzahlFkgwError += WSV.Utils.pruefeGeraetStatus($(this));
					sammelStatusFkgw = anzahlFkgw - anzahlFkgwError;
				}
				if ($(this).attr('id').indexOf('GWST') > -1) {
					anzahlGwst      += 1;
					anzahlGwstError += WSV.Utils.pruefeGeraetStatus($(this));
					sammelStatusGwst = anzahlGwst - anzahlGwstError;
				}
				if ($(this).attr('id').indexOf('FKEK') > -1 || $(this).attr('id').indexOf('FKMK') > -1) {
					anzahlFkek      += 1;
					anzahlFkekError += WSV.Utils.pruefeGeraetStatus($(this));
					sammelStatusFkek = anzahlFkek - anzahlFkekError;
				}
			})

			//setzen des sammelStatus anhand des Schleifendurchgangs
			if (sammelStatusFkgw > 0 && sammelStatusFkgw < anzahlFkgw) {
				sammelStatus = '2'; // Status gelb
			}
			if (sammelStatusGwst > 0 && sammelStatusGwst < anzahlGwst) {
				sammelStatus = '2'; // Status gelb
			}
			if (sammelStatusFkek > 0 && sammelStatusFkek < anzahlFkek) {
				sammelStatus = '2'; // Status gelb
			}
			if (sammelStatusFkgw === 0 || sammelStatusGwst === 0 || sammelStatusFkek === 0) {
				sammelStatus = '1'; // Status rot
			}

			return sammelStatus;

		}
	}

})(window, document, jQuery);
