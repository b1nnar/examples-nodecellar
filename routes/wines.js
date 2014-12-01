const DB_NAME = 'winedb';
const DB_COLLECTION = 'wines';

var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db(DB_NAME, server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to " + DB_NAME + " database");
        db.collection(DB_COLLECTION, {strict: true}, function (err, collection) {
            if (err) {
                console.log("The " + DB_COLLECTION + " collection doesn't exist. Creating it with sample data...");
                populateDbCollection();
            }
        });
    }
});

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    db.collection(DB_COLLECTION, function (err, collection) {
        collection.findOne(
            {'_id': new BSON.ObjectID(id)}, function (err, item) {
                res.send(item);
            });
    });
};

exports.findAll = function (req, res) {
    db.collection(DB_COLLECTION, function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};


exports.addWine = function (req, res) {
    var wine = req.body;
    console.log('Adding wine: ' + JSON.stringify(wine));
    db.collection(DB_COLLECTION, function (err, collection) {
        collection.insert(wine, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occured'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateWine = function (req, res) {
    var id = req.params.id;
    var wine = req.body;

    console.log("Updating wine: " + id);
    console.log(JSON.stringify(wine));

    db.collection(DB_COLLECTION, function (err, collection) {
        collection.update(
            {'_id': new BSON.ObjectID(id)}, wine, {safe: true}, function (err, result) {
                if (err) {
                    console.log('Error updating wine: ' + err);
                    res.send({'error': 'An error has occured'});
                } else {
                    console.log(result + ' document(s) updated');
                    res.send(wine);
                }
            });
    });
};

exports.deleteWine = function (req, res) {
    var id = req.params.id;
    console.log('Deleting wine ' + id);

    db.collection(DB_COLLECTION, function (err, collection) {
        collection.remove(
            {'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
                if (err) {
                    console.log('Error deleting wine: ' + err);
                    res.send({'error': 'An error has occured'});
                } else {
                    console.log(result + ' document(s) deleted');
                    res.send(req.body);
                }
            }
        );
    });
};

var populateDbCollection = function () {
    console.log("Populating DB collection...");

    var wines = [
        {
            name: "CHATEAU DE SAINT COSME",
            year: "2009",
            grapes: "Grenache /Syrah",
            country: "France",
            region: "Southern Rhone",
            description: "The aromas of fruit and space...",
            picture: "images/saint_cosme.jpg"
        },
        {
            name: "LAN RIOJA CRIANZA",
            year: "2006",
            grapes: "Tempranillo",
            country: "Spain",
            region: "Rioja",
            description: "A resurgence of interest in boutique vineyards...",
            picture: "images/lan_rioja.jpg"
        }
    ];

    db.collection(DB_COLLECTION, function (err, collection) {
        collection.insert(wines, {safe: true}, function (err, result) {
            console.log(result);
        });
    });
};