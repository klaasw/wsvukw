/* Modul zur Herstellung der Verbindung zur Mongo Datenbank
* In Bearbeitung....
* 
* @Author: Klaas Wuellner
* 
*/


var MongoClient = require('mongodb').MongoClient
var assert = require('assert')


var dbVerbindung //Zur Nutzung der Datenbank Verbindung. Verhindert dauerndes öffen und schließen


// Connection URL
//TODO: url Konfig auslagern in ServerIPs
var url = 'mongodb://ukwserver:due@10.162.1.60:27017,10.162.1.70:27017,10.162.1.80:27017/ukw?replicaSet=dueReplicaSet';


//vor dem Schreiben prüfen ob eine Verbindung besteht:
//TODO: ReplicaSet, Ausfall, Umschwenken, Zustandsmeldungen nur von einem Server senden
exports.schreibeInDb = function (collection, selector, inhalt) {
	//console.log(dbVerbindung)
    if (dbVerbindung == undefined){
        verbindeDatenbank( function(){
            // Insert a single document
        	schreibeInDb2(collection, selector, inhalt)
        })
    } 
   
    else{
        schreibeInDb2(collection, selector, inhalt)
    }    
}


//finde Dokumente
exports.findeElement = function (collection, element, callback) {
	//console.log(dbVerbindung)
    if (dbVerbindung == undefined){
        verbindeDatenbank( function(){
            // Insert a single document
        	findeElement2(collection, element, function(doc){
        	    callback(doc)
            })
        })
    } 
   
    else{
        findeElement2(collection, element, function(doc){
        	callback(doc)
        })
    }    
}


function findeElement2 (collection, element, callback){
	var tmp = dbVerbindung.collection(collection)
	tmp.find({}).toArray(function(err, docs){
		assert.equal(err,null)
		//console.log(docs)
		callback(docs)
	})
}

// tatsächlich in DB schreiben, Ausführung als Upsert
function schreibeInDb2 (collection, selector, inhalt){
	tmp = dbVerbindung.collection(collection)
    tmp.updateOne(selector, inhalt, {upsert : true, w : 1}).then(function(result){
    	assert.equal(1, result.result.n)
    	console.log('in DB geschrieben')
    })

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
function verbindeDatenbank (aktion){
	MongoClient.connect(url, function(err, db) {
        
        assert.equal(null, err)
        console.log("Connected correctly to server")
        dbVerbindung = db
        
        if(err) throw err;

        aktion()
   
        
        //Ereignislister für Topologie Änderungen im ReplicaSet
        db.topology.on('serverDescriptionChanged', function(event) {
            console.log('received serverDescriptionChanged');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('serverHeartbeatStarted', function(event) {
            console.log('received serverHeartbeatStarted');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('serverHeartbeatSucceeded', function(event) {
            console.log('received serverHeartbeatSucceeded');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('serverHeartbeatFailed', function(event) {
            console.log('received serverHeartbeatFailed');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('serverOpening', function(event) {
            console.log('received serverOpening');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('serverClosed', function(event) {
            console.log('received serverClosed');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('topologyOpening', function(event) {
            console.log('received topologyOpening');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('topologyClosed', function(event) {
            console.log('received topologyClosed');
            console.log(JSON.stringify(event, null, 2));
        });
   
        db.topology.on('topologyDescriptionChanged', function(event) {
            console.log('received topologyDescriptionChanged');
            console.log(JSON.stringify(event, null, 2));
        });
    })
}

