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
		einzel:              true,
		IpConfig:            '',
		socket:              {},
		aktuellerUKWserver:  '',
		aktuellerBenutzer:   {},
		defaultServer:       '',
		aktuelleMKA:         {},
		geschalteteSPAN:     {},

		init: function () {

			this.aktuellerUKWserver = location.protocol + '//' + location.hostname + ':' + location.port;
			this.setDefaultServer();
			this.ladeBenutzer();
			this.ladeKonfig();

			const _self = this;

			//Eventlistener an #mithoerenModal binden. Dies dient der Steuerung von dynmischen Inhalten basierend auf der geklickten Kanalschaltfläche
			$('#mithoerenModal').on('shown.bs.modal', function (event) {
				const mhanButton     = $(event.relatedTarget).attr('id');
				const fuerFunkstelle = $(event.relatedTarget).data('funkstelle');
				const lautstaerke    = parseInt($(event.relatedTarget).attr('data-lautstaerke'));

				//Überschrift anpassen
				$('#mithoerenModal .modal-title').text('Mithören für Kanal: ' + ApFunkstellen[fuerFunkstelle].channel + ', ' + ApFunkstellen[fuerFunkstelle].sname + ', Komp-ID: ' + fuerFunkstelle);

				//angeklickten MHAN hervorheben
				$('#mithoerenModal #' + mhanButton).addClass('btn-primary');

				//Initialisierung Slider für Lautstärke im Modal #mithoerenModal
				$('#sliderModal').slider({
					tooltip: 'always'
				});

				//Lautstärke im Slider setzen
				$('#sliderModal').slider('setValue', lautstaerke);

				$('#sliderModal').on('change', function (ev) {

					//$('#' + geklickteID).prev().text(ev.value.newValue)
					_self.setzeLautstaerke(fuerFunkstelle, mhanButton, ev.value.newValue)
				}); //Slide Event zu

				//Arbeitsplaetze bzw SPAN zum Mithoeren laden
				$.getJSON('verbindungen/liesVerbindungen?funkstelle=' + fuerFunkstelle + '&aktiveVerbindungen=true', function (data) {

					const buttonsFuerArbeitsplaetze = [];
					const buttonOeffnen             = '<button class="btn btn-default" buttonElement="spanApButtonModal" id="';
					const buttonSchliessen          = '">';
					const buttonEnde                = '</button>';
					let button                      = '';

					$.each(data, function (key, val) {
						// Aus Verbindungen nur SPAN und ApID ungleich eigener AP verarbeiten
						if (val.span_mhan.indexOf('SPAN') > -1 && val.ApID !== ApID) {
							//Button Eigenschaften verkettten und in in Array schreiben
							button = buttonOeffnen + val.span_mhan + buttonSchliessen + val.ApID + buttonEnde;
							buttonsFuerArbeitsplaetze.push(button);
						}
					});
					$('#mithoerenModal [buttonElement="ap_mithoeren"]').html(buttonsFuerArbeitsplaetze);
					//"SPAN_MHAN" zur Kennung der Schaltvorgangs
					$('#mithoerenModal [buttonElement="spanApButtonModal"]').attr('onclick', 'schalteKanal(event, this, "SPAN_MHAN")');
					$.getJSON('verbindungen/liesVerbindungen?geraet=' + mhanButton, function (data) {
						$.each(data, function (key, val) {
							if (val.funkstelle.indexOf('SPAN') > -1 && val.zustand.aufgeschaltet === true) {
								$('#' + val.funkstelle).addClass('btn-primary')
							}
						})
					});
				});
			});

			//Event zum schliessen an mithoerenModal binden
			$('#mithoerenModal').on('hidden.bs.modal', function (event) {
				$('#mithoerenModal [buttonElement="mhanButtonModal"]').removeClass('btn-primary');
				$('#sliderModal').slider('destroy')
			});


			//Initialisierung Slider für Lautstärke im Modal #mithoerenModal
			$('#sliderModal').slider({
				tooltip: 'always'
			});

			//Optionen fuer Notify festlegen
			$.notifyDefaults({
				// settings
				element:         'body',
				position:        null,
				type:            'info',
				allow_dismiss:   true,
				newest_on_top:   true,
				showProgressbar: false,
				placement:       {
					from:  'top',
					align: 'right'
				},
				offset:          {
					x: 10,
					y: 50
				},
				spacing:         10,
				z_index:         1031,
				delay:           5000,
				timer:           1000,
				url_target:      '_blank',
				mouse_over:      null,
				animate:         {
					enter: 'animated fadeInDown',
					exit:  'animated fadeOutUp'
				},
				onShow:          null,
				onShown:         null,
				onClose:         null,
				onClosed:        null,
				icon_type:       'class',
				template:        '<div data-notify="container" class="col-xs-11 col-sm-2 alert alert-{0}" style="padding: 5px" role="alert">' +
				                 '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
				                 '<span data-notify="icon"></span> ' +
				                 '<span data-notify="title">{1}</span> ' +
				                 '<span data-notify="message">{2}</span>' +
				                 '<div class="progress" data-notify="progressbar">' +
				                 '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
				                 '</div>' +
				                 '<a href="{3}" target="{4}" data-notify="url"></a>' +
				                 '</div>'
			});
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

		socketStatusMessage: function (msg) {

			if (msg === null) {
				return;
			}

			const dienst = msg.dienst;
			const status = msg.status.Status;
			const url    = msg.status.URL;
			let urlVtrIp = url.split('.');
			urlVtrIp     = urlVtrIp[2];
			let ort      = null;
			const _self  = this;

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
		},

		socketUkwMessage: function (msg) {

			if (msg === null) {
				return;
			}

			const msgKeys = Object.keys(msg); //z.B. RX, FSTSTATUS
			const msgTyp  = msgKeys[0];
			const _self   = this;

			// console.log("ukwMessage received: " + JSON.stringify(msg));
			// console.log(msgTyp);

			if (typeof msg === 'object' && _self.ApFunkstellen.hasOwnProperty(msg[msgTyp].$.id)) {

				// Empfangen aktiv0
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
					console.log('RX state 1: ' + msg.RX.$.id)
				}
				// Empfangen deaktiv
				if ('RX' in msg && msg.RX.$.state === '0') {
					//suche Schaltflaeche zu FunkstellenID
					const button = $('#' + msg.RX.$.id).parent().parent().offsetParent().attr('id');

					//Kanalflaeche entfaerben
					$('#' + button + ' .button_flaeche').removeClass('bg-danger');
					$('#' + button + ' .button_flaeche h2').removeClass('text-danger');

					console.log('RX state 0: ' + msg.RX.$.id)
				}
				//Senden aktiv
				if ('TX' in msg && msg.TX.$.state === '1') {
					//Pruefen ob SPAN ID in TX Objekt
					if (msg.TX.$.id.indexOf('SPAN') != -1) {
						//erstmal nichts machen. ggf in SPAN Element etwas anzeigen
						console.log('TX state 1 ohne SPAN: ' + msg.TX.$.id)
					}
					else {
						//suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.TX.$.id).parent().parent().offsetParent().attr('id');

						//Kanalflaeche faerben
						$('#' + button + ' .button_flaeche').addClass('bg-success');
						$('#' + button + ' .button_flaeche h2').addClass('text-success');

						console.log('TX state 1 mit SPAN: ' + msg.TX.$.id)
					}
				}
				//Senden deaktiv
				if ('TX' in msg && msg.TX.$.state === '0') {
					if (msg.TX.$.id.indexOf('SPAN') != -1) {
						//erstmal nichts machen. ggf in SPAN Element etwas anzeigen
						console.log('TX state 0 ohne SPAN: ' + msg.TX.$.id)
					}
					else {
						//suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.TX.$.id).parent().parent().offsetParent().attr('id');

						//Kanalflaeche entfaerben
						$('#' + button + ' .button_flaeche').removeClass('bg-success');
						$('#' + button + ' .button_flaeche h2').removeClass('text-success');
						console.log('TX state 0 mit SPAN: ' + msg.TX.$.id)
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

						// suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.geschaltet.$.id).parents('.button_panel');

						//aendern Darstellung fuer MHAN
						if (msg.geschaltet.$.Ap.indexOf('MHAN') != -1) {
							// aendern der Darstellung fuer SPAN auf MHAN schalten. Mithoeren von Lotsen
							if (msg.geschaltet.$.Ap.indexOf('MHAN') != -1 && msg.geschaltet.$.id.indexOf('SPAN') != -1) {
								$('#' + msg.geschaltet.$.id).addClass('btn-primary');
								$.notify('Aufgeschaltet: <br>' + _self.ApFunkstellen[msg.geschaltet.$.id].sname);
							}
							else { //nur MHAN aufschaltungen
								$('.button_mhan', button).removeClass('btn-default').addClass('btn-primary');
							}

							const geraet = msg.geschaltet.$.Ap;

							_self.ApFunkstellen[msg.geschaltet.$.id].mhan_aufgeschaltet = {
								[geraet]: true
							};
						}
						//aendern Darstellung fuer SPAN
						if (msg.geschaltet.$.Ap.indexOf('SPAN') != -1) {

							button.addClass('panel-primary');
							$('.button_span', button).addClass('btn-primary');

							_self.ApFunkstellen[msg.geschaltet.$.id].aufgeschaltet = true;
							this.geschalteteSPAN[msg.geschaltet.$.id]              = msg.geschaltet.$.Ap;

							$.notify('Aufgeschaltet: <br>' + _self.ApFunkstellen[msg.geschaltet.$.id].sname);
							console.log('geschaltet: ' + msg.geschaltet.$.id);
						}
					}
				}

				//Trennen fuer SPrechANlagen und MitHoerANlagen
				if ('getrennt' in msg && msg.getrennt.$.state === '1') {

					if (WSV.Utils.hatWert(_self.ArbeitsplatzGeraete, msg.getrennt.$.Ap)) {

						// suche Schaltflaeche zu FunkstellenID
						const button = $('#' + msg.getrennt.$.id).parents('.button_panel');

						//Aendern Darstellung fuer MHAN
						if (msg.getrennt.$.Ap.indexOf('MHAN') != -1) {
							//aendern der Darstellung fuer SPAN auf MHAN schalten. Mithoeren von Lotsen
							if (msg.getrennt.$.Ap.indexOf('MHAN') != -1 && msg.getrennt.$.id.indexOf('SPAN') != -1) {
								$('#' + msg.getrennt.$.id).removeClass('btn-primary');
								$.notify('Getrennt: <br>' + _self.ApFunkstellen[msg.getrennt.$.id].sname);
							}
							else { //nur MHAN Aufschaltungen
								$('.button_mhan', button).css('background-color', '#f5f5f5').removeClass('bg-primary');
							}
							const geraet = msg.getrennt.$.Ap;

							_self.ApFunkstellen[msg.getrennt.$.id].mhan_aufgeschaltet = {
								[geraet]: false
							};

						}
						//Aendern Darstellung fuer SPAN
						if (msg.getrennt.$.Ap.indexOf('SPAN') != -1) {

							button.removeClass('panel-primary');
							$('.button_span', button).removeClass('btn-primary');


							_self.ApFunkstellen[msg.getrennt.$.id].aufgeschaltet = false;
							delete this.geschalteteSPAN[msg.getrennt.$.id];

							$.notify('Getrennt: <br>' + _self.ApFunkstellen[msg.getrennt.$.id].sname);
							console.log('trennen: ' + msg.getrennt.$.id)
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
		},

		/**
		 * Setzt Events für die RFD Socket Nachrichten
		 */
		ereignisUeberwachung: function () {
			const _self = this;

			//Alle eingehenden WebSocket Nachrichten einhaengen TYP 'statusMessage'
			this.socket.on('statusMessage', function (msg) {
				_self.socketStatusMessage(msg);
			});

			// eingehende ZustandsMessage für gespeicherte Schaltzustaende
			this.socket.on('zustandsMessage', function (msg) {
				_self.lautsprecherAufschalten(msg);
			});

			//eingehende Socket Nachrichten vom TYP rfdMessage, Statusmeldungen verarbeitebn
			this.socket.on('ukwMessage', function (msg) {
				_self.socketUkwMessage(msg);
			});
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
		 * setze Variable aktuelleMKA fuer geklickte MKA Funkstellen ID
		 * @param {object} event
		 * @param {object} element
		 */
		setzeKanalMka: function (event, element) {
			if (this.angeklickt(event, element)) {
				//Eltern Element finden
				const button = $(element).offsetParent().attr('id');
				//Funkstellen ID finden
				//this.aktuelleMKA=$('#'+button +'> div > div:nth-child(2) > div:nth-child(2) > span').attr('class')
				//this.aktuelleMKA=$('#'+button +'> div > div:nth-child(2) > div > span').attr('id')
				this.aktuelleMKA = $('#' + button + ' .button_anlage1').attr('id');
				//console.log("Dropdown von:" + this.aktuelleMKA)
			}
		},

		/**
		 * Kanalschalten über UI-Element
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

					const geklickteFstHaupt   = $('#' + button + ' .button_anlage1').attr('id');
					const geklickteFstReserve = $('#' + button + ' .button_anlage2').attr('id');

					const geklickteSPAN = $('#' + button + ' .button_span').attr('id');

					const geklicktespan_mhanApNr = $('#' + button + ' .button_span').data('span');

					//Status der Funkstellen aus HTML Elementen auslesen
					const geklickteFstHauptStatus   = $('#' + geklickteFstHaupt).attr('fstStatus');
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

					const geklickteFstHaupt   = $('#' + buttonFst + ' > div div:nth-child(2) > div > div:nth-child(1)').attr('id');
					const geklickteFstReserve = $('#' + buttonFst + ' > div div:nth-child(2) > div > div:nth-child(2)').attr('id');

					const geklickteMHAN = ($('#' + buttonMHAN + ' div > div').attr('id'));

					console.log(buttonMHAN);
					console.log(buttonFst);

					//Status der Funkstellen
					const geklickteFstHauptStatus   = $('#' + geklickteFstHaupt).attr('fstStatus');
					const geklickteFstReserveStatus = $('#' + geklickteFstReserve).attr('fstStatus');

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
			console.log('Klick: ' + geklickteFstID);
			//$.notify('test:'+ApFunkstellen[geklickteID].kurzname);
			const _self = this;

			//SPAN schalten
			if (SPAN === 'SPAN') {

				if (this.einzel === true) {
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
		 * Mithoerlautsprecher aufschalten
		 * @param mhan
		 */
		lautsprecherAufschalten: function (mhan) {

			//console.log(mhan);
			const _self = this;

			for (const funkstelle in mhan) {
				this.schalten(funkstelle, _self.ArbeitsplatzGeraete[mhan[funkstelle]], mhan[funkstelle]);
			}
		},

		/**
		 * Kanal aufschalten via RFD Socket
		 * @param {string} FstID
		 * @param {string} SPAN_MAHN
		 * @param {string} SPAN_MAHN_ApNr
		 */
		schalten: function (FstID, SPAN_MAHN, SPAN_MAHN_ApNr) {

			SPAN_MAHN_ApNr = SPAN_MAHN_ApNr || 'SPAN01';

			const _self = this;
			this.socket.emit('clientMessage', {
				'FstID':         FstID,
				'ApID':          _self.ApID,
				'SPAN':          SPAN_MAHN,
				'aktion':        'schaltenEinfach',
				'span_mhanApNr': SPAN_MAHN_ApNr
			});
			$.notify('Schalte: <br>' + this.ApFunkstellen[FstID].sname);
			//console.log('(notify) schalte: ' + this.ApFunkstellen[FstID].sname);
		},

		/**
		 * Kanal trennen via RFD Socket
		 * @param FstID
		 * @param SPAN_MAHN
		 * @param SPAN_MAHN_ApNr
		 */
		trennen: function (FstID, SPAN_MAHN, SPAN_MAHN_ApNr) {
			const _self = this;
			this.socket.emit('clientMessage', {
				'FstID':         FstID,
				'ApID':          _self.ApID,
				'SPAN':          SPAN_MAHN,
				'aktion':        'trennenEinfach',
				'span_mhanApNr': SPAN_MAHN_ApNr
			});
			$.notify('Trenne: <br>' + this.ApFunkstellen[FstID].sname);
			//console.log('(notify) trenne: ' + this.ApFunkstellen[FstID].sname);
		},

		/**
		 * Lautstärke setzen via RFD Socket
		 * @param {string} FstID
		 * @param {string} SPAN_MAHN
		 * @param {string} level
		 */
		setzeLautstaerke: function (FstID, SPAN_MAHN, level) {

			this.socket.emit('clientMessage', {
				'FstID':  FstID,
				'SPAN':   SPAN_MAHN,
				'aktion': 'SetzeAudioPegel',
				'Kanal':  level
			});
			$.notify('Lautstaerke: ' + this.ApFunkstellen[FstID].sname + ' ...');

			const button = $('#' + FstID).parent().parent().offsetParent().attr('id');
			//Lautstärke in HTML Attribut setzen
			$('#' + button + ' button_mhan').attr('data-lautstaerke', level)
		},

		/**
		 * Wechselt zwischen Einzel- und Gruppenschaltung
		 */
		wechselEinzelGruppen: function () {

			$('#statusWechsel').toggleClass('active');

			if (this.einzel === true) { // Wechsel zu Gruppenschaltung
				this.einzel = false;
				$('#statusWechsel a').text('Gruppenschaltung');

				//console.log('Wechsel zu Gruppenschaltung');
				//console.log(this.geschalteteSPAN);
				//console.log(this.aktuellerBenutzer.schaltZustandGruppe);

				if (typeof this.aktuellerBenutzer.schaltZustandGruppe == 'undefined') {
					this.aktuellerBenutzer.schaltZustandGruppe = this.geschalteteSPAN;
				}

				this.aktuellerBenutzer.schaltZustandEinzel = this.geschalteteSPAN; //speichere geschalteten Zustand
				this.zustandWiederherstellen(this.aktuellerBenutzer.schaltZustandGruppe); // lade Gruppenzustand
			}
			else { // Wechsel zu Einzelschaltung
				this.einzel = true;
				$('#statusWechsel a').text('Einzelschaltung');

				//console.log('Wechsel zu Einzelschaltung');
				//console.log(this.geschalteteSPAN);
				//console.log(this.aktuellerBenutzer.schaltZustandEinzel);

				if (typeof this.aktuellerBenutzer.schaltZustandEinzel == 'undefined') {
					const keyZero                              = Object.keys(this.geschalteteSPAN)[0];
					this.aktuellerBenutzer.schaltZustandEinzel = {[keyZero]: this.geschalteteSPAN[keyZero]};
				}

				this.aktuellerBenutzer.schaltZustandGruppe = this.geschalteteSPAN; //speichere geschalteten Zustand
				this.zustandWiederherstellen(this.aktuellerBenutzer.schaltZustandEinzel); //lade Einzelzustand
			}

			this.schreibeBenutzer();
		},

		/**
		 * Schaltzustand wiederherstellen nach wechseln von Einzel- zu Gruppenschaltung
		 * @param {object} AufschalteZustand
		 */
		zustandWiederherstellen: function (AufschalteZustand) {

			if (typeof AufschalteZustand != 'object') {
				return false;
			}

			//Backup, da die Funktionen schalten und trennen mit Rueckmeldung schon in ApFunkstellen schreiben
			const backupApFunkstellen = this.ApFunkstellen;
			const _self               = this;

			$.each(backupApFunkstellen, function (key, value) {
				if (value !== 'frei') { // Da in FunkstellenDetails frei mitgeschleppt wird

					//console.log(key + ': ' + typeof AufschalteZustand[key]);

					if (AufschalteZustand.hasOwnProperty(key)) {
						console.log('wechsel schalten: ' + key);
						_self.schalten(key, _self.SPAN)
					}
					else if (value.aufgeschaltet == false) { // schalten
						if (value.aufgeschaltet == true) { // trennen
							console.log('wechsel trennen: ' + key);
							_self.trennen(key, _self.SPAN)
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
			//console.log('clientMessage', {'FstID': this.aktuelleMKA, 'Kanal': neuerKanal, 'aktion': 'setzeKanal'})
			this.socket.emit('clientMessage', {'FstID': this.aktuelleMKA, 'Kanal': neuerKanal, 'aktion': 'setzeKanal'});
			//  $.notify('Setze Kanal: '+ApFunkstellen[this.aktuelleMKA].sname +' auf '+ element.innerText +' ...')
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
					if (typeof data.einzel == 'undefined') {
						data.einzel = _self.einzel;
					}

					// TODO: initialen Zustand im PUG Template übergeben
					if (!data.einzel) {
						_self.wechselEinzelGruppen();
					}

					// TODO: initialen Zustand im PUG Template übergeben
					WSV.Themes.switch(data.theme, false);
				}
			});
		},

		/**
		 * Speichert den aktuellen Benutzer in die Datenbank via REST
		 */
		schreibeBenutzer: function () {

			const benutzer  = this.aktuellerBenutzer;
			benutzer.theme  = WSV.Themes.currentTheme;
			benutzer.einzel = this.einzel;

			if (this.geschalteteSPAN.length == 1) {
				benutzer.schaltZustandEinzel = JSON.stringify(this.geschalteteSPAN);
			}
			else if (this.geschalteteSPAN.length > 1) {
				benutzer.schaltZustandGruppe = JSON.stringify(this.geschalteteSPAN);
			}

			$.ajax({
				url:     WSV.Display.aktuellerUKWserver + '/benutzer/schreibeBenutzer',
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
				WSV.Display.schreibeBenutzer();
			}
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