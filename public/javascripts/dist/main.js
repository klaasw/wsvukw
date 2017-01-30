'use strict';

const WSV = window.WSV || {};

// =========================== JS Init ================================== //
$(window).load(function () {

	WSV.Utils.init();
	WSV.Themes.init();
	WSV.Display.init();
});
// eof JS Init;'use strict';

(function (window, document, $) {

	WSV.Display = {

		// TODO: Darstellung des Status von SPAN und MHAN in die GUI einbringen
		ApID:                '', //zb.JA NvD
		SPAN:                '', //zb. 1-H-RFD-WHVVKZ-SPAN-01
		MhanZuordnung:       {}, //"MHAN01": "1-H-RFD-WHVVTA-FKEK-2", "MHAN02": "1-H-RFD-TETTEN-FKEK-2"
		ApFunkstellen:       {},
		ArbeitsplatzGeraete: {},
		Einzel:              true,
		einzelStatus:        '',
		gruppenStatus:       '',
		IpConfig:            '',
		socket:              {},
		aktuellerUKWserver:  '',
		aktuellerBenutzer:   {},
		defaultServer:       '',

		init: function () {

			this.aktuellerUKWserver = location.protocol + '//' + location.hostname + ':' + location.port;
			this.setDefaultServer();
			this.ladeBenutzer();
			this.ladeKonfig();
		},

		setDefaultServer: function () {
			this.defaultServer = $('.server-toggle').data('label');
		},

		/**
		 * Variablen zum Arbeitsplatz laden
		 */
		ladeKonfig: function () {

			const _self = this;

			$.get('/ukwKonfig', function (data) { //IP-Adress nur als Platzhalter zum Testen
				// console.log(data); //TODO: unwichtige, sicherheitsrelevante Informationen nicht uebermitteln

				_self.ApFunkstellen       = data.Konfigdaten.FunkstellenDetails;
				_self.SPAN                = data.Konfigdaten.ArbeitsplatzGeraete.SPAN01;
				_self.MhanZuordnung       = data.Konfigdaten.MhanZuordnung;
				_self.ArbeitsplatzGeraete = data.Konfigdaten.ArbeitsplatzGeraete;
				_self.ApID                = data.Arbeitsplatz;
				_self.IpConfig            = data.Konfigdaten.IpConfig;

				console.log(data.Konfigdaten.IpConfig);

				_self.socket = io(_self.aktuellerUKWserver);

				_self.ereignisUeberwachung();
				_self.verbindungsPruefung();
				_self.lautsprecherAufschalten(_self.MhanZuordnung);

			}).fail(function () {
				console.log('ukwKonfig konnte nicht geladen werden - Kanalzuordnung kann nicht angezeigt werden.');
				// TODO Fehlerdetail uebergeben: ukwKonfig konnte nicht geladen werden
				$('#errorModalDUE').modal('show');
			});
		},

		/**
		 *
		 */
		ereignisUeberwachung: function () {
			const _self = this;

			//Alle eingehenden WebSocket Nachrichten einhaengen TYP 'statusMessage'
			this.socket.on('statusMessage', function (msg) {

				if (msg === null) {
					return;
				}

				const dienst = msg.dienst;
				const status = msg.status.Status;
				const url    = msg.status.URL;
				let urlVtrIp = url.split('.');
				urlVtrIp     = urlVtrIp[2];
				let ort      = null;

				for (let i = 0; i < _self.IpConfig.alternativeIPs.length; i++) {
					const vergleich    = _self.IpConfig.alternativeIPs[i];
					let vergleichVtrIp = vergleich[1].split('.');
					vergleichVtrIp     = vergleichVtrIp[2];

					if (vergleichVtrIp == urlVtrIp) {
						ort = vergleich[0]
					}
				}

				if (status == 'OK') {
					$('#button' + ort + '_' + dienst).removeClass('label-danger');
					$('#button' + ort + '_' + dienst).addClass('label-success');
					$('#buttonAktiv' + ort + '_' + dienst).removeClass('label-danger');
					$('#buttonAktiv' + ort + '_' + dienst).addClass('label-success');

					$('#button' + ort + '_' + dienst).closest('button').removeAttr('disabled');
					$('#button' + ort + '_' + dienst).closest('li').removeClass('disabled')
				}
				else if (status == 'Error') {
					$('#button' + ort + '_' + dienst).removeClass('label-success');
					$('#button' + ort + '_' + dienst).addClass('label-danger');
					$('#button' + ort + '_' + dienst).closest('button').attr('disabled', 'disabled');

					$('#buttonAktiv' + ort + '_' + dienst).removeClass('label-success');
					$('#buttonAktiv' + ort + '_' + dienst).addClass('label-danger');

					$('#button' + ort + '_' + dienst).closest('li').addClass('disabled');


					//button add attribute disabled="disabled" und auf dem li class="disabled"

					//Alarm und Fenster nur zeigen wenn aktueller Server betroffen ist
					//audioAlarm.play();
					//$('#errorModalRFD').modal('show')
				}
			});

			//eingehende ZustandsMessage für gespeicherte Schaltzustaende
			this.socket.on('zustandsMessage', function (msg) {
				console.log(msg);
				lautsprecherAufschalten(msg)
			});

			//eingehende Socket Nachrichten vom TYP rfdMessage, Statusmeldungen verarbeitebn
			this.socket.on('ukwMessage', function (msg) {
				// console.log("ukwMessage received: " + JSON.stringify(msg));
				const msgKeys = Object.keys(msg); //z.B. RX, FSTSTATUS
				const msgTyp  = msgKeys[0];
				// console.log(msgTyp);
				if (typeof msg === 'object' && _self.ApFunkstellen.hasOwnProperty(msg[msgTyp].$.id)) {
					//Empfangen aktiv0
					if ('RX' in msg && msg.RX.$.state === '1') {
						//suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.RX.$.id).parent().parent().offsetParent().attr('id');

						//Kanalflaeche faerben
						$('#' + button + ' .button_flaeche').addClass('bg-danger');
						$('#' + button + ' .button_flaeche h2').addClass('text-danger');

						$.notify({
							message: 'Empfang:<br>' + _self.ApFunkstellen[msg.RX.$.id].sname
						}, {
							type: 'danger'
						});
						console.log("RX state 1: " + msg.RX.$.id)
					}
					//Empfangen deaktiv
					if ('RX' in msg && msg.RX.$.state === '0') {
						//suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.RX.$.id).parent().parent().offsetParent().attr('id');

						//Kanalflaeche entfaerben
						$('#' + button + ' .button_flaeche').removeClass('bg-danger');
						$('#' + button + ' .button_flaeche h2').removeClass('text-danger');

						console.log("RX state 0: " + msg.RX.$.id)
					}
					//Senden aktiv
					if ('TX' in msg && msg.TX.$.state === '1') {
						//Pruefen ob SPAN ID in TX Objekt
						if (msg.TX.$.id.indexOf('SPAN') != -1) {
							//erstmal nichts machen. ggf in SPAN Element etwas anzeigen
							console.log("TX state 1 ohne SPAN: " + msg.TX.$.id)
						}
						else {
							//suche Schaltflaeche zu FunkstellenID
							const button = $('#' + msg.TX.$.id).parent().parent().offsetParent().attr('id');

							//Kanalflaeche faerben
							$('#' + button + ' .button_flaeche').addClass('bg-success');
							$('#' + button + ' .button_flaeche h2').addClass('text-success');

							console.log("TX state 1 mit SPAN: " + msg.TX.$.id)
						}
					}
					//Senden deaktiv
					if ('TX' in msg && msg.TX.$.state === '0') {
						if (msg.TX.$.id.indexOf('SPAN') != -1) {
							//erstmal nichts machen. ggf in SPAN Element etwas anzeigen
							console.log("TX state 0 ohne SPAN: " + msg.TX.$.id)
						}
						else {
							//suche Schaltflaeche zu FunkstellenID
							const button = $('#' + msg.TX.$.id).parent().parent().offsetParent().attr('id');

							//Kanalflaeche entfaerben
							$('#' + button + ' .button_flaeche').removeClass('bg-success');
							$('#' + button + ' .button_flaeche h2').removeClass('text-success');
							console.log("TX state 0 mit SPAN: " + msg.TX.$.id)
						}
					}

					if ('FSTSTATUS' in msg && msg.FSTSTATUS.$.state === '0') {
						$('#' + msg.FSTSTATUS.$.id + ' span.label').removeClass('label-danger').addClass('label-success').text('OK');
						$('#' + msg.FSTSTATUS.$.id).attr('fstStatus', '0');

						const standortButton = $('#' + msg.FSTSTATUS.$.id).parent().prev();
						$(standortButton[0]).children().addClass('label-success').removeClass('label-danger').text('OK');

						//console.log(msg.FSTSTATUS.$.id);

						//Bei Kanalaenderung die Kanalnummer setzen
						if (msg.FSTSTATUS.$.channel > -1) {
							const button = $('#' + msg.FSTSTATUS.$.id).parent().parent().offsetParent().attr('id');
							$('#' + button + ' .button_kanalNr > span').text(msg.FSTSTATUS.$.channel)
						}

					}
					// -SEN- darf nicht in der ID vorkommen
					if ('FSTSTATUS' in msg && msg.FSTSTATUS.$.state === '1' && msg.FSTSTATUS.$.id.indexOf('-SEN-') == -1) {
						$('#' + msg.FSTSTATUS.$.id + ' span.label').removeClass('label-success').addClass('label-danger').text('Error');
						$('#' + msg.FSTSTATUS.$.id).attr('fstStatus', '1');
						const standortButton = $('#' + msg.FSTSTATUS.$.id).parent().prev();
						$(standortButton[0]).children().addClass('label-danger').removeClass('label-success').text('Error');

						//Notify by Störung
						$.notify({
							message: 'Störung:<br>' + _self.ApFunkstellen[msg.FSTSTATUS.$.id].sname
						}, {
							type: 'danger'
						});
						//Funktionen von "getrennt"
						//suche SChaltflaeche zu FunkstellenID
						const button = $('#' + msg.FSTSTATUS.$.id).offsetParent().attr('id');
						//$('#'+button+' > div > div.panel-heading > span').text( "getrennt" )
						$('#' + button + ' > div').removeClass('panel-primary').css('background-color', '');

						$('#' + button + ' > div > div:nth-child(3)').removeClass('bg-primary');
						_self.ApFunkstellen[msg.FSTSTATUS.$.id].aufgeschaltet = false;
						$.notify('Getrennt: <br>' + _self.ApFunkstellen[msg.FSTSTATUS.$.id].sname);

						//geschaltetet Zustände an Server übertragen
						socket.emit('clientMessageSchaltzustand', {
							'Zustand':      _self.ApFunkstellen,
							'Arbeitsplatz': _self.ApID
						});

						//console.log(msg.FSTSTATUS.$.id);

					}
					//Schalten fuer SPrechANlagen und MitHoerANlagen
					if ('geschaltet' in msg && msg.geschaltet.$.state === '1') {
						// pruefen ob diese Meldung zu diesem Arbeitsplatz gehoert
						if (WSV.Utils.hatWert(_self.ArbeitsplatzGeraete, msg.geschaltet.$.Ap) && _self.ApFunkstellen[msg.geschaltet.$.id] !== 'frei') {

							//aendern Darstellung fuer MHAN
							if (msg.geschaltet.$.Ap.indexOf('MHAN') != -1) {
								//aendern der Darstellung fuer SPAN auf MHAN schalten. Mithoeren von Lotsen
								if (msg.geschaltet.$.Ap.indexOf('MHAN') != -1 && msg.geschaltet.$.id.indexOf('SPAN') != -1) {
									$('#' + msg.geschaltet.$.id).addClass('btn-primary');
									$.notify('Aufgeschaltet: <br>' + _self.ApFunkstellen[msg.geschaltet.$.id].sname);
									//nur MHAN aufschaltungen
								}
								else {
									//suche Schaltflaeche zu FunkstellenID
									const button = $('#' + msg.geschaltet.$.id).parent().parent().offsetParent().attr('id');
									$('#' + button + ' .button_mhan').removeClass('btn-default').addClass('btn-primary');
								}

								const geraet = msg.geschaltet.$.Ap;

								_self.ApFunkstellen[msg.geschaltet.$.id].mhan_aufgeschaltet = {
									[geraet]: true
								};
							}
							//aendern Darstellung fuer SPAN
							if (msg.geschaltet.$.Ap.indexOf('SPAN') != -1) {
								//suche Schaltflaeche zu FunkstellenID
								const button = $('#' + msg.geschaltet.$.id).parent().parent().offsetParent().attr('id');

								//$('#'+button+' > div > div.panel-heading > span').text( "aufgeschaltet" )
								$('#' + button + ' > div').addClass('panel-primary');
								$('#' + button + ' .button_span').addClass('btn-primary');

								_self.ApFunkstellen[msg.geschaltet.$.id].aufgeschaltet = true;
								$.notify('Aufgeschaltet: <br>' + _self.ApFunkstellen[msg.geschaltet.$.id].sname);
								console.log(msg.geschaltet.$.id);
							}
						}
					}

					//Trennen fuer SPrechANlagen und MitHoerANlagen
					if ('getrennt' in msg && msg.getrennt.$.state === '1') {

						if (WSV.Utils.hatWert(_self.ArbeitsplatzGeraete, msg.getrennt.$.Ap)) {

							//Aendern Darstellung fuer MHAN
							if (msg.getrennt.$.Ap.indexOf('MHAN') != -1) {
								//aendern der Darstellung fuer SPAN auf MHAN schalten. Mithoeren von Lotsen
								if (msg.getrennt.$.Ap.indexOf('MHAN') != -1 && msg.getrennt.$.id.indexOf('SPAN') != -1) {
									$('#' + msg.getrennt.$.id).removeClass('btn-primary');
									$.notify('Getrennt: <br>' + _self.ApFunkstellen[msg.getrennt.$.id].sname);
									//nur MHAN Aufschaltungen
								}
								else {
									//suche Schaltflaeche zu FunkstellenID
									const button = $('#' + msg.getrennt.$.id).offsetParent().attr('id');
									$('#' + button + ' .button_mhan_ship').css('background-color', '#f5f5f5').removeClass('bg-primary');
								}
								const geraet = msg.getrennt.$.Ap;

								_self.ApFunkstellen[msg.getrennt.$.id].mhan_aufgeschaltet = {
									[geraet]: false
								};

							}
							//Aendern Darstellung fuer SPAN
							if (msg.getrennt.$.Ap.indexOf('SPAN') != -1) {

								//suche Schaltflaeche zu FunkstellenID
								const button = $('#' + msg.getrennt.$.id).parent().parent().offsetParent().attr('id');
								//$('#'+button+' > div > div.panel-heading > span').text( "getrennt" )

								$('#' + button + ' > div').removeClass('panel-primary');
								$('#' + button + ' .button_span').removeClass('btn-primary');


								_self.ApFunkstellen[msg.getrennt.$.id].aufgeschaltet = false;

								$.notify('Getrennt: <br>' + _self.ApFunkstellen[msg.getrennt.$.id].sname);
								//console.log(msg.getrennt.$.id)
							}
						}
						else {
							//console.log("")
						}
					}

				}  // Ende if (typeof msg === 'object')
				// TODO: pruefen was mit anderen Meldungen vom RFD geschehen soll. Ert
				else {
					//msgText = msg.replace("<", "")
					//msgText = msgText.replace("\>", "")

					//RFD Fehler
					const msgText = JSON.stringify(msg);

					if (msgText.indexOf('fehlgeschlagen') > -1) {
						//     //-console.log('RFD Aufruf fehlgeschlagen')
						$(_self.defaultServer + '_RFD').removeClass('label-success').addClass('label-danger');

						$.notify({
							message: 'Störung:<br>' + JSON.stringify(msg)
						}, {
							type: 'danger'
						})
					}

					//else {
					//     console.log(" sonstige ukwMessage: " + msgText)
					// }
					//$.notify('Meldung: '+JSON.stringify(msg))

					//$('#messages').append($('<li>').text(msg));
					//$('#messages').append($.text(msg));
				}
			});
		}, // Ende EreignisUeberwachung

		/**
		 * Mithoerlautsprecher aufschalten
		 * @param mhan
		 */
		lautsprecherAufschalten: function (mhan) {

			// console.log(mhan);
			const _self = this;

			for (const funkstelle in mhan) {
				this.socket.emit('clientMessage', {
					'FstID':         funkstelle,
					'ApID':          _self.ApID,
					'SPAN':          _self.ArbeitsplatzGeraete[mhan[funkstelle]],
					'aktion':        'schaltenEinfach',
					'span_mhanApNr': mhan[funkstelle]
				});
			}
		},

		/**
		 * Ereignisse fuer Verbindungsueberwachung
		 * Dafuer in der Navleiste eine Statusflaeche einbauen
		 * Wenn lokaler DUE getrennt dann lokaler RFD auf undefined -- grau
		 */
		verbindungsPruefung: function () {
			const _self = this;

			const serverButton = $('#button' + _self.defaultServer + '_DUE');

			this.socket.on('connect', function () {
				// console.log('check 2------------------------VERBUNDEN', _self.socket.connected);
				serverButton.removeClass('label-danger').addClass('label-success');
				$('#buttonAktiv' + _self.defaultServer + '_DUE').removeClass('label-danger').addClass('label-success');
			});

			this.socket.on('disconnect', function () {
				// console.log('check 2-----------------------GETRENNT', _self.socket.connected);
				serverButton.removeClass('label-success').addClass('label-danger');
				$('#buttonAktiv' + _self.defaultServer + '_DUE').removeClass('label-success').addClass('label-danger');

				// TODO: Wiederverbindung versuchen, waehrend dieser Zeit kein Fehler zeigen, sondern erst dann?
				//Zeige Error Modal Fenster
				// WSV.Utils.audioAlarm.play();
				$('#errorModalDUE').modal('show');
			});
		},

		/**
		 * Pruefe welches Element geklickt wurde
		 * Vermeide aufschalten/trennen bei MKA Dropdown, MHAN Button und SPAN Button
		 * @param {object} event
		 * @param {object} element
		 * @returns {boolean}
		 */
		angeklickt: function (event, element) {
			const geklicktesElement = event.srcElement;

			if (element == geklicktesElement) {
				return true;
			}

			const geklicktesButtonElement = $(geklicktesElement).data('buttonElement');

			return (geklicktesButtonElement == 'atis' || geklicktesButtonElement == 'Flaeche');
		},

		/**
		 * setze Variable geklickteMKA fuer geklickte MKA Funkstellen ID
		 * @param {object} event
		 * @param {object} element
		 */
		setzeKanalMka: function (event, element) {
			if (this.angeklickt(event, element)) {
				//Eltern Element finden
				const button = $(element).offsetParent().attr('id');
				//Funkstellen ID finden
				//geklickteMKA=$('#'+button +'> div > div:nth-child(2) > div:nth-child(2) > span').attr('class')
				//geklickteMKA=$('#'+button +'> div > div:nth-child(2) > div > span').attr('id')
				geklickteMKA = $('#' + button + ' .button_anlage1').attr('id');
				//console.log("Dropdown von:" + geklickteMKA)
			}
		},

		/**
		 * Kanalschalten
		 * Pruefe zunaechst ob Element geklickt wurde
		 * @param event
		 * @param element
		 * @param geraet
		 */
		schalteKanal: function (event, element, geraet) {
			if (this.angeklickt(event, element)) {
				if (geraet === 'SPAN') {
					//uebergeordnetes Element finden
					const button = $(element).offsetParent().attr('id');

					const geklickteFstHaupt = $('#' + button + ' .button_anlage1').attr('id');
					const geklickteFstReserve = $('#' + button + ' .button_anlage2').attr('id');

					const geklickteSPAN = $('#' + button + ' .button_span').attr('id');

					const geklicktespan_mhanApNr = $('#' + button + ' .button_span').data('span');

					//Status der Funkstellen aus HTML Elementen auslesen
					const geklickteFstHauptStatus = $('#' + geklickteFstHaupt).attr('fstStatus');
					const geklickteFstReserveStatus = $('#' + geklickteFstReserve).attr('fstStatus');

					//nur schalten, wenn Status 0 bzw. ok
					if (geklickteFstHauptStatus === '0') {
						this.schalteKanalID(geklickteFstHaupt, geklickteSPAN, 'SPAN', geklicktespan_mhanApNr)
					}

					//TODO: versuche Reserveanlage zu schalten
					else {
						$.notify({
							message: 'Hauptanlage gestört'
						}, {
							type: 'danger'
						});
						//TODO: hier Reserveanlage schalten
					}
				}
				else if (geraet === 'SPAN_MHAN') { //Schalten aus Modal Mithoeren
					const mhan          = $('#mithoerenModal .btn-primary').attr('id');
					const span          = element.id;
					const span_mhanApNr = $('#mithoerenModal .btn-group-vertical .btn-primary').text();
					this.schalteKanalID(span, mhan, 'SPAN_MHAN', span_mhanApNr);
					//console.log();
				}
				else { //Schalten MHAN
					//uebergeordnetes Element
					const buttonMHAN = $('#' + element.id).offsetParent().attr('id');
					const buttonFst  = element.offsetParent.id;

					const geklickteFstHaupt = $('#' + buttonFst + ' > div div:nth-child(2) > div > div:nth-child(1)').attr('id');
					const geklickteFstReser = $('#' + buttonFst + ' > div div:nth-child(2) > div > div:nth-child(2)').attr('id');

					const geklickteMHAN = ($('#' + buttonMHAN + ' div > div').attr('id'));

					console.log(buttonMHAN);
					console.log(buttonFst);

					//Status der Funkstellen
					const geklickteFstHauptStatus = $('#' + geklickteFstHaupt).attr('fstStatus');
					const geklickteFstReserStatus = $('#' + geklickteFstReser).attr('fstStatus');

					this.schalteKanalID(geklickteFstHaupt, geklickteMHAN, 'MHAN');
				}
			}
		},

		/**
		 * Funktion zur Prüfung ob aufgeschaltet ODER getrennt werden soll
		 * @param geklickteFstID
		 * @param geklickteSPANMHAN
		 * @param SPAN
		 * @param geklicktespan_mhanApNr
		 */
		schalteKanalID: function (geklickteFstID, geklickteSPANMHAN, SPAN, geklicktespan_mhanApNr) {
			console.log("Klick: " + geklickteFstID);
			//$.notify('test:'+ApFunkstellen[geklickteID].kurzname);
			const _self = this;

			//SPAN schalten
			if (SPAN === 'SPAN') {

				if (this.Einzel === true) {
					$.each(this.ApFunkstellen, function (key, value) {
						if (value.aufgeschaltet === true && key != geklickteFstID) {
							//console.log(key, value.aufgeschaltet)
							_self.trennen(key, geklickteSPANMHAN, geklicktespan_mhanApNr)
						}
						//trenne aufgeschaltet
					})
				}
				//Gruppenschaltung
				if (this.ApFunkstellen[geklickteFstID] != undefined) {
					if (this.ApFunkstellen[geklickteFstID].aufgeschaltet === true) {
						this.trennen(geklickteFstID, geklickteSPANMHAN, geklicktespan_mhanApNr)

					}
					else {
						this.schalten(geklickteFstID, geklickteSPANMHAN, geklicktespan_mhanApNr)

					}
				}
			}
			//SPAN zum Mithoeren aufschalten - trenen
			if (SPAN === 'SPAN_MHAN') {
				if (this.ApFunkstellen.hasOwnProperty(geklickteFstID)) {
					if (this.ApFunkstellen[geklickteFstID].aufgeschaltet === true) {
						this.trennen(geklickteFstID, geklickteSPANMHAN, geklicktespan_mhanApNr);
						this.ApFunkstellen[geklickteFstID].aufgeschaltet = false;
					}
					else {
						this.schalten(geklickteFstID, geklickteSPANMHAN, geklicktespan_mhanApNr);
						this.ApFunkstellen[geklickteFstID].aufgeschaltet = true;
					}
				}
				else {
					this.ApFunkstellen[geklickteFstID]               = {};
					this.ApFunkstellen[geklickteFstID].aufgeschaltet = true;
					this.ApFunkstellen[geklickteFstID].sname         = 'Fremd Span';
					this.schalten(geklickteFstID, geklickteSPANMHAN, geklicktespan_mhanApNr)
				}
			}

			//MHAN schalten
			if (SPAN === 'MHAN') {
				if (this.ApFunkstellen[geklickteFstID].mhan_aufgeschaltet[geklickteSPANMHAN] == true) {
					this.trennen(geklickteFstID, geklickteSPANMHAN)
				}
				else {
					this.schalten(geklickteFstID, geklickteSPANMHAN)
				}

			}
		},

		/**
		 *
		 * @param geklickteID
		 * @param geklickteSPANMHAN
		 * @param geklicktespan_mhanApNr
		 */
		trennen: function (geklickteID, geklickteSPANMHAN, geklicktespan_mhanApNr) {
			const _self = this;
			this.socket.emit('clientMessage', {
				'FstID':         geklickteID,
				'ApID':          _self.ApID,
				'SPAN':          geklickteSPANMHAN,
				'aktion':        'trennenEinfach',
				'span_mhanApNr': geklicktespan_mhanApNr
			});
			$.notify('Trenne: <br>' + this.ApFunkstellen[geklickteID].sname);
		},

		/**
		 *
		 * @param geklickteID
		 * @param geklickteSPANMHAN
		 * @param geklicktespan_mhanApNr
		 */
		schalten: function (geklickteID, geklickteSPANMHAN, geklicktespan_mhanApNr) {
			const _self = this;
			this.socket.emit('clientMessage', {
				'FstID':         geklickteID,
				'ApID':          _self.ApID,
				'SPAN':          geklickteSPANMHAN,
				'aktion':        'schaltenEinfach',
				'span_mhanApNr': geklicktespan_mhanApNr
			});
			$.notify('Schalte: <br>' + this.ApFunkstellen[geklickteID].sname)
		},

		/**
		 *
		 * @param geklickteID
		 * @param level
		 * @param funkstelle
		 */
		setzeLautstaerke: function (geklickteID, level, funkstelle) {

			this.socket.emit('clientMessage', {
				'FstID':  funkstelle,
				'SPAN':   geklickteID,
				'aktion': 'SetzeAudioPegel',
				'Kanal':  level
			});
			$.notify('Lautstaerke: ' + this.ApFunkstellen[funkstelle].sname + ' ...');

			const button = $('#' + funkstelle).parent().parent().offsetParent().attr('id');
			//Lautstärke in HTML Attribut setzen
			$('#' + button + ' button_mhan').attr('data-lautstaerke', level)
		},

		/**
		 *
		 * @param buttonID
		 */
		gruppen: function (buttonID) {
			//Wechsel zu Gruppenschaltung
			if (this.Einzel === true) {
				this.Einzel       = false;
				this.einzelStatus = JSON.stringify(this.ApFunkstellen); //speichere geschalteten Zustand

				$('#' + buttonID).toggleClass('active');
				$('#' + buttonID + ' > a').text('Gruppenschaltung');
				zustandWiederherstellen(JSON.parse(this.gruppenStatus)); // lade Gruppenzustand
			}
			else {
				this.Einzel        = true;
				this.gruppenStatus = JSON.stringify(this.ApFunkstellen); //speichere geschalteten Zustand
				$('#' + buttonID).toggleClass('active');
				$('#' + buttonID + ' > a').text('Einzelschaltung');
				zustandWiederherstellen(JSON.parse(this.einzelStatus)); //lade Einzelzustand

			}
		},

		/**
		 *
		 * @param AufschalteZustand
		 */
		zustandWiederherstellen: function (AufschalteZustand) {
			//Backup, da die Funktionen schalten und trennen mit Rueckmeldung schon in ApFunkstellen schreiben
			const backupApFunkstellen = this.ApFunkstellen;
			const _self               = this;
			$.each(backupApFunkstellen, function (key, value) {
				if (AufschalteZustand[key] !== undefined) {
					//console.log("AktuellerStand: key=" + key + "', value='" + JSON.stringify(value.aufgeschaltet) + "'")
					//console.log("neuer    Stand: key=" + JSON.stringify(AufschalteZustand[key].id) + "value=" + JSON.stringify(AufschalteZustand[key].aufgeschaltet))

					if (value !== 'frei') {// Da in FunkstellenDetails frei mitgeschleppt wird
						if (value.aufgeschaltet == true && AufschalteZustand[key].aufgeschaltet == true) {
							//nix
						}
						if (value.aufgeschaltet == true && AufschalteZustand[key].aufgeschaltet == false || AufschalteZustand[key].aufgeschaltet == undefined) {
							//trennen
							_self.trennen(AufschalteZustand[key].id, _self.SPAN)
						}
						if (value.aufgeschaltet == false && AufschalteZustand[key].aufgeschaltet == true) {
							//schalten
							_self.schalten(AufschalteZustand[key].id, _self.SPAN)
						}
						if (value.aufgeschaltet == false && AufschalteZustand[key].aufgeschaltet == false) {
							//nix
						}
					}
				}
			});


			//console.log("Funkstellen ID nicht vorhanden: "+Id)
		},

		/**
		 *
		 * @param element
		 */
		setzeKanal: function (element) {
			let neuerKanal = '';

			//Kanal wurde über Spinbox geändert
			if (element != undefined) {
				neuerKanal = element.innerText
			}
			//Kanal wurde über direkt auswahl geändet
			else {
				neuerKanal = $('.spinbox-input').val()
			}
			//console.log('clientMessage', {'FstID': geklickteMKA, 'Kanal': neuerKanal, 'aktion': 'setzeKanal'})
			this.socket.emit('clientMessage', {'FstID': geklickteMKA, 'Kanal': neuerKanal, 'aktion': 'setzeKanal'});
			//  $.notify('Setze Kanal: '+ApFunkstellen[geklickteMKA].sname +' auf '+ element.innerText +' ...')
		},

		/**
		 * Aktuellen Windowsbenutzer aus DB laden via REST
		 */
		ladeBenutzer: function () {
			const _self = this;
			$.get('/benutzer/zeigeWindowsBenutzer/selectip', function (data) {
				if (typeof data._id != 'undefined') {
					_self.aktuellerBenutzer = data;

					if (typeof data.theme == 'undefined') {
						data.theme = 'default';
					}
					WSV.Themes.switch(data.theme, false);
				}
			});
		},
	}

})(window, document, jQuery);;'use strict';

(function (window, document, $) {

	WSV.Themes = {

		path:         'stylesheets/bootstrap',
		list:         {
			'default': 'bootstrap-theme.css',
			'darkly':  'darkly.css',
			'flatly':  'flatly.css',
			'cyborg':  'cyborg.css',
		},
		themesheet:   '',
		currentTheme: 'default',

		init: function () {

			const _self     = this;
			this.themesheet = $('<link href="' + this.getThemeUrl() + '" rel="stylesheet" />');
			this.themesheet.appendTo('head');

			$('.theme-switcher .switch-theme').on('click', function () {
				_self.switch($(this).data('theme'), true)
			});
		},

		/**
		 * Liefert die aktuelle Theme-URL zurück
		 * @param {string} theme
		 * @returns {string} - relativer Pfad zum aktuellen Theme
		 */
		getThemeUrl: function (theme) {
			theme = theme || 'default';
			return this.path + '/' + this.list[theme];
		},

		/**
		 * Wechselt das aktuelle Theme im Frontend und speichert die Konfiguration
		 * @param {string} theme - das zu wechselnde Theme
		 * @param {boolean} saveConfig - legt fest ob die Konfig gespeichert werden soll
		 */
		switch: function (theme, saveConfig) {
			if (typeof theme == 'undefined' || theme == this.currentTheme)
				return;

			this.currentTheme = theme;
			this.themesheet.attr('href', this.getThemeUrl(this.currentTheme));
			$('.theme-switcher .switch-theme').parents('li').removeClass('active');
			$('.theme-switcher a[data-theme="' + this.currentTheme + '"]').parent().addClass('active');
			if (saveConfig) {
				this.saveThemeConfig();
			}
		},

		/**
		 * Speichert das aktuelle Theme in die Datenbank via REST
		 */
		saveThemeConfig: function () {

			const benutzer = WSV.Display.aktuellerBenutzer;
			benutzer.theme = this.currentTheme;

			$.ajax({
				url:     WSV.Display.aktuellerUKWserver + '/benutzer/schreibeTheme',
				type:    'POST',
				data:    benutzer,
				success: function (result) {
					console.log('ajax post success');
					console.log(result);
				}
			});
		}
	}


})(window, document, jQuery);;'use strict';

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