'use strict';

(function (window, document, $) {

	WSV.Themes = {

		path:         'stylesheets/bootstrap',
		list:         {
			'bootstrap-theme': 'bootstrap-theme.css',
			'darkly':          'darkly.css',
			'flatly':          'flatly.css',
			'cyborg':          'cyborg.css',
		},
		currentTheme: 'bootstrap-theme',

		init: function () {

			const _self = this;
			this.currentTheme = $('#theme-switcher li.active .switch-theme').data('theme');

			$('#theme-switcher .switch-theme').on('click', function () {
				_self.switch($(this).data('theme'), true);
			});
		},

		/**
		 * Liefert die aktuelle Theme-URL zurück
		 * @returns {string} - relativer Pfad zum aktuellen Theme
		 */
		getThemeUrl: function () {
			return this.path + '/' + this.list[this.currentTheme];
		},

		/**
		 * Wechselt das aktuelle Theme im Frontend und speichert die Konfiguration
		 * @param {string} theme - das zu wechselnde Theme
		 * @param {boolean} saveConfig - legt fest ob die Konfig gespeichert werden soll
		 */
		switch: function (theme, saveConfig) {
			if (typeof theme == 'undefined' || theme == this.currentTheme) {
				return;
			}

			this.currentTheme = theme;
			$('<link href="' + this.getThemeUrl() + '" id="themesheet-new" rel="stylesheet" />').appendTo('head');
			$('#themesheet').remove();
			$('#themesheet-new').attr('id', 'themesheet');

			$('#theme-switcher .switch-theme').parents('li').removeClass('active');
			$('#theme-switcher a[data-theme="' + this.currentTheme + '"]').parent().addClass('active');
			if (saveConfig) {
				WSV.Display.schreibeBenutzer();
			}
		}
	}
})(window, document, jQuery);