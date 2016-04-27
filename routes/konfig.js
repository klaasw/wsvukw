var files = require('fs')// Zugriff auf das Dateisystem
var winston = require('winston')// Modul für verbessertes Logging

//neuen logger intanzieren
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        'timestamp':true,
        'prettyPrint':true,
        'colorize':true,
      })
    ]
});

FILENAME=__filename.slice(__dirname.length + 1)

//var exports = module.exports = leseKonfig;
var Konfig = exports;

Konfig.leseKonfig = function() {
	files.readFile("konfig/konfig.json", 'utf8', function (err, data) {
		if(err){
			logger.error(FILENAME+' Funktion: lese Konfig: konfig.json nicht vorhanden')
		}
		else {
			logger.info(FILENAME+' Funktion: lese Konfig: konfig.json Inhalt: '+ data)
			return data

		}
		
	})
};
	


//module.exports = Konfig;
