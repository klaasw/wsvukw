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
        currentTheme: 'default',

        init: function () {

            const _self = this;
            this.themesheet = $('<link href="' + this.getThemeUrl() + '" rel="stylesheet" />');
            this.themesheet.appendTo('head');

            $('.theme-switcher .switch-theme').on('click', function () {
                _self.switch($(this))
            });
        },

        getThemeUrl: function (theme) {
            theme = theme || 'default';
            return this.path + '/' + this.list[theme];
        },

        switch: function (element) {
            this.currentTheme = element.data('theme');
            this.themesheet.attr('href', this.getThemeUrl(this.currentTheme));
            $('.theme-switcher .switch-theme').parents('li').removeClass('active');
            element.parent().addClass('active');
            this.setAPconfig();
        },

        // TODO: aktuelle Theme-Auswahl in der AP-Config speichern über REST Aufruf
        setAPconfig: function () {
            const data = {
                _id: '127.0.0.1',
                ip: '127.0.0.1',
                theme: this.currentTheme
            };
            // $.ajax({
            //     url: WSV.Display.aktuellerUKWserver + '/benutzer/schreibeWindowsBenutzer',
            //     type: 'PUT',
            //     data: data,
            //     success: function (result) {
            //         console.log('ajax post success');
            //         console.log(result);
            //     }
            // });
        }
    }


})(window, document, jQuery);