var express = require('express');
var fs = require('fs');
var http = require('http');

var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var debug = require('debug')('ukwserver:server');

// logging access log - morgan
var FileStreamRotator = require('file-stream-rotator');

var morgan = require('morgan');
var logDirectory = __dirname + '/log';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
});

app.use(morgan(':date[iso] :remote-addr :remote-user :method :url, :http-version :status :res[content-length] :response-time', {stream: accessLogStream}));

//var cfg = require('./cfg.js');

var log = require('./log.js');
// can be used to integrate morgen access log and winston log entries in one file:
// app.use(require('morgan')('combined', {stream: logger.stream}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

debugger;   // if in debugging mode, set breakpoint here
var routes = require('./routes/index.js');

app.use('/', routes);
var ukw = require('./routes/ukw.js');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
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
    res.render('error', {
        message: err.message,
        error: {}
    });
});


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var io = require('socket.io');

/*var wsserver = http.createServer(app);
 wsserver.listen('3001');*/

io.listen(server).on('connect', function (socket) {
    log.debug('Benutzer hat sich per Websocket verbunden. IP: ' + socket.request.connection.remoteAddress);
    // TODO: Pruefung Berechtigung !

    socket.on('mock message', function (msg) {
        socket.broadcast.emit('mock message', msg);
        log.debug('mock message: ' + JSON.stringify(msg))
    });
    socket.on('chat message', function (msg) {
        //io.emit('chat message', msg);
        log.debug('chat message: ' + JSON.stringify(msg));
        ukw.sendeWebServiceNachricht(msg.FstID, msg.SPAN, msg.aktion, msg.Kanal);//Zum Testen eine Schleife als SIP Nachricht, die wieder als Web Nachricht zurueckgesendet wird
    });

    //'Standardnachrichten für Weiterleitung an RFD schalten,trennen, MKA'
    socket.on('clientMessage', function(msg){
        log.debug(FILENAME+' Funktion: empfangeWebNachricht '+'clientMessage: WebSocket Nachricht: '+JSON.stringify(msg))
        ukw.sendeWebServiceNachricht(msg.FstID,msg.SPAN,msg.aktion,msg.Kanal);//Sende WebServiceNachricht an RFD
    });

    //Speichern der Kanal Lotsenzuordnung
    socket.on('clientMessageSpeichern', function(msg){
        log.info(FILENAME+' Funktion: empfangeWebNachricht '+'clientMessageSpeichern: WebSocket Nachricht: '+JSON.stringify(msg))

        //Speichern
        for (var LotsenAp in msg.LotsenApBenutzer){
            ukw.speichereLotsenZuordnung(LotsenAp, JSON.stringify(msg.LotsenApBenutzer[LotsenAp]))
        }
    });

    //Speichern der Schaltzustände der Clients
    socket.on('clientMessageSchaltzustand', function(msg){

        ApID=msg.Arbeitsplatz.replace(/ /g, "_")
        Zustand=JSON.stringify(msg.Zustand)

        log.info(FILENAME+' Funktion: empfangeWebNachricht '+'clientMessageSchaltzustand: WebSocket Nachricht: '+JSON.stringify(msg))

        files.writeFile(ApID+'_Zustand.json', Zustand, 'utf8', function (err, data) {
            if(err){
                log.error(FILENAME+' Funktion: speichereSchaltzustand: '+ApID+'_Zustand.json konnte nicht geschrieben werden' + err)
            }
            else {
                log.info(FILENAME+' Funktion: speichereSchaltzustand: konfig.json '+ApID+'_Zustand.json geschrieben')
            }

        })

    });
    
    
    
    
    

});


// Setze Intervall fuer Pruefung
var Intervall=setInterval(function() {ukw.pruefeRfdWS()},1000)


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);
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
    var bind = typeof port === 'string'
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
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}


