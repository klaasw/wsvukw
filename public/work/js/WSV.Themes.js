'use strict';

(function (window, document, $) {

	WSV.Themes = {

		path: 'stylesheets/bootstrap',
		list: {
			'default': 'bootstrap-theme.css',
			'darkly': 'darkly.css',
			'flatly': 'flatly.css',
			'cyborg': 'cyborg.css',
		},
		themesheet: '',

		init: function () {

			const _self = this;
			this.themesheet = $('<link href="' + this.getThemeUrl() + '" rel="stylesheet" />');
			this.themesheet.appendTo('head');

			$('.theme-switcher .switch-theme').on('click', function () {
				_self.switch($(this).data('theme'))
			});
		},

		getThemeUrl: function(theme) {
			theme = theme || 'default';
			return this.path + '/' + this.list[theme];
		},

		switch: function (theme) {
			theme = theme || 'default';
			this.themesheet.attr('href', this.getThemeUrl(theme));
			this.setAPconfig(theme);
		},

		// TODO: aktuelle Theme-Auswahl in der AP-Config speichern über REST Aufruf
		setAPconfig: function(theme) {
			theme = theme || 'default';

		}
	}

})(window, document, jQuery);