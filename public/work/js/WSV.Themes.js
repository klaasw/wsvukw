'use strict';

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


})(window, document, jQuery);