/* Modul zur Herstellung der Verbindung zur Mongo Datenbank
* In Bearbeitung....
*
* @Author: Klaas Wuellner
*
*/

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var cfg = require('./cfg.js');
var log = require('./log.js');

FILENAME = __filename.slice(__dirname.length + 1);

var dbVerbindung; //Zur Nutzung der Datenbank Verbindung. Verhindert dauerndes öffen und schließen
var verbundenMitPrimary;



// Connection URL
var url = cfg.mongodb+'&readPreference=nearest';
//var url2 = 'mongodb://ukwserver:due@10.160.2.80:27017,10.160.1.80:27017,10.160.3.80:27017/ukw?replicaSet=dueReplicaSet'

//vor dem Schreiben prüfen ob eine Verbindung besteht:
//TODO: ReplicaSet, Ausfall, Umschwenken, Zustandsmeldungen nur von einem Server senden
exports.schreibeInDb = function (collection, selector, inhalt) {
	//console.log(dbVerbindung)
    if (dbVerbindung == undefined){
        //exports.verbindeDatenbank( function(){
            // Insert a single document
        //	schreibeInDb2(collection, selector, inhalt)
        //})
    }

    else{
        if (verbundenMitPrimary == true){
            schreibeInDb2(collection, selector, inhalt);
        }

    }
};


//finde Dokumente
exports.findeElement = function (collection, element, callback) {
	//console.log(dbVerbindung)
    if (dbVerbindung == undefined){
       // exports.verbindeDatenbank( function(){
            // Insert a single document
        //	findeElement2(collection, element, function(doc){
        //	    callback(doc)
          //  })
       // })
    }

    else{
        findeElement2(collection, element, function(doc){
        	callback(doc);
        });
    }
};


function findeElement2 (collection, element, callback){
	var tmp = dbVerbindung.collection(collection);
	var selector = {};
    log.debug(JSON.stringify(element));

    if (element != undefined ) {
        selector = element;
    }


    tmp.find(selector).toArray(function(err, docs){
		assert.equal(err,null);
		//console.log(docs)
		log.debug(FILENAME + ' Funktion: findeElement2 aus DB gelesen');
        callback(docs);
	});
}

// tatsächlich in DB schreiben, Ausführung als Upsert
function schreibeInDb2 (collection, selector, inhalt){
	log.debug('TEST in DB ' + collection + ' -- ' + selector + ' -- ' +inhalt);

    tmp = dbVerbindung.collection(collection);
        tmp.updateOne(selector, inhalt, {upsert : true, w : 1}).then(function(result){
            assert.equal(1, result.result.n);
    	    console.log('in DB geschrieben');
            log.debug(FILENAME + ' Funktion: schreibeInDb2 in DB geschrieben');
    });

    /*
	// Insert a single document
	dbVerbindung.collection(collection).insertOne(element, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
        console.log('in DB geschrieben')
		})
	*/
}


// Verbindung zur DB aufbauen. Dies wird beim ersten Aufruf von finde oder schreibe aufgerufen
exports.verbindeDatenbank = function(aktion){
	console.log(url);
        MongoClient.connect(url, {
            connectTimeoutMS : 2000,
            socketTimeoutMS: 2000
            }, function(err, db) {

            if(err){
                console.log(err);

            }

            //console.log(db)


            assert.equal(null, err);
            console.log(err);
            log.info(FILENAME + ' Funktion: verbindeDatenbank Verbindung erfolgreich hergestellt');
            log.debug(FILENAME + ' Funktion: verbindeDatenbank' + JSON.stringify(db.topology.isMasterDoc));
            log.debug(db.topology.isMasterDoc.primary);

            dbVerbindung = db;
            pruefeLokaleVerbindung(dbVerbindung.topology.isMasterDoc.primary);


            if(err) throw err;
            if (typeof aktion === "function"){
                aktion();
            }

            //console.log(db.topology)

            //Ereignislister fuer Topologie Aenderungen im ReplicaSet
            db.topology.on('serverDescriptionChanged', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverDescriptionChanged');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('serverHeartbeatStarted', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatStarted');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('serverHeartbeatSucceeded', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatSucceeded');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('serverHeartbeatFailed', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverHeartbeatFailed');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('serverOpening', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverOpening');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('serverClosed', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received serverClosed');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('topologyOpening', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyOpening');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('topologyClosed', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyClosed');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));
            });

            db.topology.on('topologyDescriptionChanged', function(event) {
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener: received topologyDescriptionChanged');
                log.debug(FILENAME + ' Funktion: verbindeDatenbank Listener:' + JSON.stringify(event));

                if (event.newDescription.topologyType == 'ReplicaSetWithPrimary'){
                    pruefeLokaleVerbindung(event.newDescription.servers[0].address);
                }



            });

        });
};

//Prueft ob der PRIMARY der Mongo-Datenbank und die Anwendung im selben VTR laufen und
//setzt die entsprechende Variable
function pruefeLokaleVerbindung(primaryServer){
    //Hostnamen teilen um Standort zu vergleichen
    ukwServer = cfg.aktuellerHostname.split("-");
    primaryDbServer = primaryServer.split("-");

    //nur den Standort in Variable schreiben
    ukwServerVTR = ukwServer[1];
    primaryDbServerVTR = primaryDbServer[1];

    //Standortpruefung
    if (ukwServerVTR == primaryDbServerVTR) {
        verbundenMitPrimary = true;
    }
    else {
        verbundenMitPrimary = false;
    }
    log.info(FILENAME + ' Funktion: pruefeLokaleVerbindung');
    log.debug(FILENAME + ' Funktion: pruefeLokaleVerbindung ukwServer=' + ukwServer + ' primaryDbServer=' + primaryDbServer + ' Ergebnis=' + verbundenMitPrimary);
}
