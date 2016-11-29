"use strict";

const express = require('express');
const fs = require('fs');
const http = require('http');

const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

const debug = require('debug')('ukwserver:server');

// logging access log - morgan
const FileStreamRotator = require('file-stream-rotator');

const morgan = require('morgan');
const logDirectory = __dirname + '/log';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
	date_format: 'YYYYMMDD',
	filename: logDirectory + '/access-%DATE%.log',
	frequency: 'daily',
	verbose: false
});

app.use(morgan(':date[iso] :remote-addr :remote-user :method :url, :http-version :status :res[content-length] :response-time', {stream: accessLogStream}));

const cfg = require('./cfg.js');
const log = require('./log.js');
// can be used to integrate morgen access log and winston log entries in one file:
// app.use(require('morgan')('combined', {stream: logger.stream}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// debugger;   // if in debugging mode, set breakpoint here
const routes = require('./routes/index.js');
const users = require('./routes/benutzer.js');
const verbindungen = require('./routes/verbindungen.js');

app.use('/', routes);
app.use('/user', users); //nach Anpassung des Scriptes deutsche Route verwenden
app.use('/benutzer', users);
app.use('/verbindungen', verbindungen);
const ukw = require('./ukw.js');


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	log.info("cfg bei error: " + JSON.stringify(cfg));
	res.render('error', {
		message: err.message,
		error: {}
	});
});


/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || cfg.port);
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

const socket = require('./socket.js');
socket.socket(server);

// Setze Intervall fuer Pruefung
const Intervall = setInterval(function () {
	ukw.pruefeRfdWS()
}, cfg.intervall);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	const port = parseInt(val, 10);
	if (isNaN(port)) {
		// named pipe
		return val;
	}
	if (port >= 0) {
		// port number
		return port;
	}
	return false;
}
/*** Event listener for HTTP server "error" event. */
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
/*** Event listener for HTTP server "listening" event. */
function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}


