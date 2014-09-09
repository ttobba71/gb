/*jshint multistr: true */
var priceObj = null;
var sqlConfig = {
    StationsQuery: 'select * from Stations order by distance',
    PriceQuery: 'select * from Prices order by id desc',
    createTableDDL: ['CREATE TABLE IF NOT EXISTS Stations (country, zip, reg_price, mid_price, pre_price, diesel_price, reg_date, mid_date, pre_date, diesel_date, address, diesel, id unique, lat, lng, station, region, city, distance, load_date )', 'CREATE TABLE IF NOT EXISTS Prices (id unique, location unique, price, readDate, load_date)'],
    dropTableDDL: ['DROP TABLE IF EXISTS Stations', 'DROP TABLE IF EXISTS Prices']
};
var dbConfig = {
    forceUpdate: stringToBoolean(window.localStorage.getItem('forceUpdate')),
    dbName: "PriceDB",
    dbVersion: "1.0",
    dbDescription: "Price Storage",
    dbSize: 100000,
    createDB: function(tx) {
        console.debug('createDB...forceUpdate:' + dbConfig.forceUpdate);
        if (dbConfig.forceUpdate) {
            console.debug('drop and create DB...');
            $.each(sqlConfig.dropTableDDL, function(i, value) {
                tx.executeSql(value);
            });
            $.each(sqlConfig.createTableDDL, function(i, value) {
                tx.executeSql(value);
            });
        }
    },
    init: function() {
        console.debug('start dbConfig.init');
        var db = window.openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
        db.transaction(this.createDB, function(err) {
            console.error(err.code + ' : ' + err.message);
        }, function() {
            console.info('Database successfully created.');
            window.localStorage.setItem('forceUpdate', false);
        });
    }
};

function gasBoyDBObj() {
    _checkConnection = function(db) {
        return (db === undefined || db === null);
    };
    _queryForPriceResults = function(tx) {
        tx.executeSql(sqlConfig.PriceQuery, PriceResults, _priceSuccess, fail);
        window.localStorage.setItem('results', new Date(Date.now()));
    };
    _queryForStationResults = function(tx) {
        tx.executeSql(sqlConfig.StationsQuery, StationResults, _stationSuccess, fail);
        window.localStorage.setItem('results', new Date(Date.now()));
    };
    _saveStationInfo = function(tx) {
        console.debug('start _saveStationInfo');
        $.each(this.stationInsValue, function(i, value) {
            try {
                var update = 'update Stations set country=?, zip=?, reg_price=?, mid_price=?, pre_price=?, diesel_price=?, \
                            reg_date=?, mid_date=?, pre_date=?, diesel_date=?, address=?, diesel=?, \
                            lat=?, lng=?, station=?, region=?, city=?, distance=?, load_date=? \
                            where id = ?';
                //console.debug(update);
                tx.executeSql(update, [value.country, value.zip, value.reg_price, value.mid_price, value.pre_price, value.diesel_price, value.reg_date, value.mid_date, value.pre_date, value.diesel_date, value.address, value.diesel, value.lat, value.lng, value.station, value.region, value.city, value.distance, new Date(Date.now()), value.id], updateStationSuccess, fail);
            } catch (err) {
                console.error('saveStationInfo error... ' + err.message);
            }
        });
    };
    _savePriceInfo = function(tx) {
        console.debug('start _savePriceInfo');
        $.each(this.priceInsValue, function(i, value) {
            try {
                var update = 'Update Prices set price=?, readDate=?, load_date=? \
                             where location = ?';
                //console.debug(update);
                tx.executeSql(update, [value.Price, value.ReadDate, new Date(Date.now()), value.LocationName], updatePriceSuccess, fail);
            } catch (err) {
                console.error('_savePriceInfo error... ' + err.message);
            }
        });
    };
    success = function(ex, results) {
        console.info('Success...' + results.rowsAffected);
    };
    fail = function(tx, err) {
        console.info('Failed Sql ' + err.message);
    };
    _priceSuccess = function(results, CallBack) {
        //gasBoyDBObj.PriceResults = results.rows;
        var len = results.rows.length;
        PriceResults = {};
        PriceResults.LocalPrices = [];
        for (var i = 0; i < len; i++) {
            PriceResults.LocalPrices[i] = {};
            PriceResults.LocalPrices[i].ReadDate = results.rows.item(i).readDate;
            PriceResults.LocalPrices[i].Price = results.rows.item(i).price;
            PriceResults.LocalPrices[i].LocationName = results.rows.item(i).location;
            console.debug('location: ' + PriceResults.LocalPrices[i].LocationName);
        }
        CallBack(PriceResults);
    };
    _stationSuccess = function(results, CallBack) {
        var len = results.rows.length;
        for (var i = 0; i < len; i++) {
            StationResults[i] = {};
            StationResults[i].country = results.rows.item(i).country;
            StationResults[i].zip = results.rows.item(i).zip;
            StationResults[i].reg_price = results.rows.item(i).reg_price;
            StationResults[i].mid_price = results.rows.item(i).mid_price;
            StationResults[i].diesel_price = results.rows.item(i).diesel_price;
            StationResults[i].reg_date = results.rows.item(i).reg_date;
            StationResults[i].mid_date = results.rows.item(i).mid_date;
            StationResults[i].pre_date = results.rows.item(i).pre_date;
            StationResults[i].diesel_date = results.rows.item(i).diesel_date;
            StationResults[i].diesel = results.rows.item(i).diesel;
            StationResults[i].lat = results.rows.item(i).lat;
            StationResults[i].lng = results.rows.item(i).lng;
            StationResults[i].station = results.rows.item(i).station;
            StationResults[i].region = results.rows.item(i).region;
            StationResults[i].city = results.rows.item(i).city;
            StationResults[i].distance = results.rows.item(i).distance;
            console.debug('station: ' + results.rows.item(i).station);
        }
        console.debug('StationResults.length: ' + StationResults.length);
        CallBack( StationResults );
    };
    dateConvert = function(strDate) {
        try {
            var d = new Date(strDate);
            return d;
        } catch (err) {
            console.debug('dateConvert..error.' + err.message);
        }
    };
    updateStationSuccess = function(tx, results) {
        //console.info('updateStationSuccess...Success...' + results.rowsAffected);
        if (results.rowsAffected === 0) {
            var insert = 'INSERT INTO Stations ( country, zip, reg_price, mid_price, pre_price, diesel_price, \
                            reg_date, mid_date, pre_date, diesel_date, address, diesel, id, \
                            lat, lng, station, region, city, distance, load_date) \
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            //console.debug(insert);
            $.each(stationInsValue, function(i, value) {
                try {
                    tx.executeSql(insert, [value.country, value.zip, value.reg_price, value.mid_price, value.pre_price, value.diesel_price, value.reg_date, value.mid_date, value.pre_date, value.diesel_date, value.address, value.diesel, value.id, value.lat, value.lng, value.station, value.region, value.city, value.distance, new Date(Date.now())], success, fail);
                } catch (err) {
                    console.error('updateStationSuccess error... ' + err.message);
                }
            });
        }
    };
    updatePriceSuccess = function(tx, results) {
        //console.info('updatePriceSuccess...Success...' + results.rowsAffected);
        if (results.rowsAffected === 0) {
            var insert = 'INSERT INTO Prices (id, location, price, readDate, load_date ) VALUES (?,?,?,?,?)';
            //console.debug(insert);
            $.each(priceInsValue, function(i, value) {
                try {
                    tx.executeSql(insert, [(i + 1), value.LocationName, value.Price, value.ReadDate, new Date(Date.now())], success, fail);
                } catch (err) {
                    console.error('updatePriceSuccess error... ' + err.message);
                }
            });
        }
    };
    querySuccess = function(tx, results) {
        console.debug('row count: ' + results.rows.length);
    };
    getPriceResults = function(CallBack) {
        console.debug('start getResults');
        if (_checkConnection(rdb)) {
            init();
        }
        gbPriceTransaction(CallBack);
        //rdb.transaction(_queryForPriceResults);
    };
    gbPriceTransaction = function(CallBackToSource) {
        rdb.transaction(function(tx) {
            gbPriceExecuteSql(tx, sqlConfig.PriceQuery, CallBackToSource);
        });
    };
    gbPriceExecuteSql = function(tx, Query, CallBackToSource) {
        tx.executeSql(Query, PriceResults, function(tx, results) {
            _priceSuccess(results, CallBackToSource);
        }, fail);
    };
    getStationResults = function(CallBack) {
        console.debug('start getResults');
        if (_checkConnection(rdb)) {
            init();
        }
        gbStationTransaction(CallBack);
        // rdb.transaction(_queryForStationResults);
    };
    gbStationTransaction = function(CallBackToSource) {
        rdb.transaction(function(tx) {
            gbStationExecuteSql(tx, sqlConfig.StationsQuery, CallBackToSource);
        });
    };
    gbStationExecuteSql = function(tx, Query, CallBackToSource) {
        tx.executeSql(Query, StationResults, function(tx, results) {
            _stationSuccess(results, CallBackToSource);
        }, fail);
    };
    init = function() {
        console.debug('start gasBoyDBObj.init');
        dbConfig.init();
        if (_checkConnection(db)) db = window.openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
        if (_checkConnection(rdb)) rdb = window.openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
    };
    saveStationInfo = function(sInfo) {
        console.debug('start saveStationInfo');
        this.stationInsValue = sInfo;
        if (_checkConnection(db)) {
            init();
        }
        db.transaction(_saveStationInfo);
    };
    savePriceInfo = function(pInfo) {
        console.debug('start savePriceInfo');
        this.priceInsValue = pInfo;
        if (_checkConnection(db)) {
            init();
        }
        db.transaction(_savePriceInfo);
    };
    var that = this;
    var StationResults = [];
    var PriceResults = [];
    var db = null;
    var rdb = null;
    var priceInsValue = null;
    var stationInsValue = null;
    return {
        PriceResults: PriceResults,
        StationResults: StationResults,
        saveStationInfo: saveStationInfo,
        savePriceInfo: savePriceInfo,
        getStationResults: getStationResults,
        getPriceResults: getPriceResults
    };
}