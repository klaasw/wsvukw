'use strict';

const express = require('express');
const app     = express();
const fs      = require('fs');
const http    = require('http');

const path         = require('path');
const favicon      = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const tools        = require('./tools.js');

const debug             = require('debug')('ukwserver:server');
const FileStreamRotator = require('file-stream-rotator');

const env = process.env.NODE_ENV || 'development'; // Linux Umgebungsvariable für die Laufzeit
                                                   // Umgebung. zu Setzen mit export $NODE_ENV=production

/**
 * logging access log
 * @type {morgan}
 */
const morgan       = require('morgan');
const logDirectory = __dirname + '/log';

/**
 * ensure log directory exists
 */
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

/**
 * create a rotating write stream
 * @type {Stream}
 */
const accessLogStream = FileStreamRotator.getStream({
	date_format: 'YYYYMMDD',
	filename:    logDirectory + '/access-%DATE%.log',
	frequency:   'daily',
	verbose:     false
});

app.use(morgan(':date[iso] :remote-addr :remote-user :method :url, :http-version :status :res[content-length] :response-time', {stream: accessLogStream}));

const cfg = require('./cfg.js');
const log = require('./log.js');
// can be used to integrate morgen access log and winston log entries in one file:
// app.use(require('morgan')('combined', {stream: logger.stream}));

/**
 * view engine setup
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const routes       = require('./routes/index.js');
const users        = require('./routes/benutzer.js');
const verbindungen = require('./routes/verbindungen.js');

app.use('/', routes);
app.use('/user', users); //nach Anpassung des Scriptes deutsche Route verwenden
app.use('/benutzer', users);
app.use('/verbindungen', verbindungen);

const ukw = require('./ukw.js');

/**
 * catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
	const err  = new Error('Not Found');
	err.status = 404;
	next(err);
});

/**
 * development error handler
 * will print stacktrace
 */
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error:   err
		});
	});
}

/**
 * production error handler
 * no stacktraces leaked to user
 */
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	log.info('cfg bei error: ' + JSON.stringify(cfg));
	res.render('error', {
		message: err.message,
		error:   {}
	});
});


/**
 * Get port from environment and store in Express.
 */
const port = tools.normalizePort(process.env.PORT || cfg.port);
app.set('port', port);
app.set('trust proxy', 'loopback');

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);

const db = require('./datenbank.js'); // Module zur Verbindung zur Datenbank
db.verbindeDatenbank(function (db) {

	// Für Prodoktionsumgebung ist ein vorgeschalteter ProxyServer (z.B. nginx) notwenig,
	// der die Anfrage an den localhost weiterleitet.
	if (env === 'production') {
		server.listen(port, '127.0.0.1', function () {
			console.log('Server läuft %s in %s mode', server.address().address, app.settings.env);
		});
	}

	if (env === 'development') {
		server.listen(port, function () {
			console.log('Server läuft %s in %s mode', server.address().address, app.settings.env);

			// if (db.error) {
			// 	throw new Error(db);
			// }

		});
	}

});

server.on('listening', onListening);

const socket = require('./socket.js');
socket.socket(server);

if (cfg.intervall !== 0) {
	// Setze Intervall fuer Pruefung
	const Intervall = setInterval(function () {
		ukw.pruefeRfdWS()
	}, cfg.intervall);
}

/**
 * Event listener for HTTP server "error" event.
 * @param {object} error
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}