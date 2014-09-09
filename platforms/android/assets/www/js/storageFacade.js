/*jshint multistr: true */
var priceObj = null;
var sqlConfig = {
    StationsQuery: 'select * from Stations order by distance',
    PriceQuery: 'select * from Prices order by id desc',
    createTableDDL: ['CREATE TABLE IF NOT EXISTS Stations (country, zip, reg_price, mid_price, pre_price, diesel_price, reg_date, mid_date, pre_date, diesel_date, address, diesel, id unique, lat, lng, station, region, city, distance, load_date )', 'CREATE TABLE IF NOT EXISTS Prices (id, location, price, readDate, load_date)'],
    dropTableDDL: ['DROP TABLE IF EXISTS Stations', 'DROP TABLE IF EXISTS Prices']
};
var dbConfig = {
    forceUpdate: window.localStorage.getItem('forceUpdate'),
    dbName: "PriceDB",
    dbVersion: "1.0",
    dbDescription: "Price Storage",
    dbSize: 100000,
    createDB: function(tx) {
        console.debug( 'forceUpdate:' + forceUpdate );
        if (dbConfig.forceUpdate) {
            console.debug( 'drop and create DB...');
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
var gasBoyDBObj = {
    PriceData: null,
    StationResults: [],
    PriceResults: [],
    sdb: null,
    pdb: null,
    priceInsValue: null,
    stationInsValue: null,
    init: function() {
        console.debug('start gasBoyDBObj.init');
        dbConfig.forceUpdate = true;
        dbConfig.init();
        gasBoyDBObj.pdb = window.openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
        gasBoyDBObj.sdb = window.openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
    },
    _saveStationInfo: function(tx) {
        console.debug('start _saveStationInfo');
        $.each(gasBoyDBObj.stationInsValue, function(i, value) {
            try {
                var update = 'update Stations set country=?, zip=?, reg_price=?, mid_price=?, pre_price=?, diesel_price=?, \
                            reg_date=?, mid_date=?, pre_date=?, diesel_date=?, address=?, diesel=?, \
                            lat=?, lng=?, station=?, region=?, city=?, distance=?, load_date=? \
                            where id = ?';
                console.debug(update);
                tx.executeSql(update, [value.country, value.zip, value.reg_price, value.mid_price, value.pre_price, value.diesel_price, value.reg_date, value.mid_date, value.pre_date, value.diesel_date, value.address, value.diesel, value.lat, value.lng, value.station, value.region, value.city, value.distance, new Date(Date.now()), value.id], gasBoyDBObj.updateStationSuccess, gasBoyDBObj.fail);
            } catch (err) {
                console.error('saveStationInfo error... ' + err.message);
            }
        });
    },
    _savePriceInfo: function(tx) {
        console.debug('start _savePriceInfo');
        $.each(gasBoyDBObj.priceInsValue, function(i, value) {
            try {
                var update = 'Update Prices set price=?, readDate=?, load_date=? \
                             where location = ?';
                console.debug(update);
                tx.executeSql(update, [value.Price, value.ReadDate, new Date(Date.now()), value.LocationName], gasBoyDBObj.updatePriceSuccess, gasBoyDBObj.fail);
            } catch (err) {
                console.error('_savePriceInfo error... ' + err.message);
            }
        });
    },
    saveStationInfo: function(sInfo) {
        console.debug('start saveStationInfo');
        gasBoyDBObj.stationInsValue = sInfo;
        if (gasBoyDBObj.sdb === undefined || gasBoyDBObj.sdb === null) {
            gasBoyDBObj.init();
        }
        gasBoyDBObj.sdb.transaction(gasBoyDBObj._saveStationInfo);
    },
    savePriceInfo: function(pInfo) {
        console.debug('start savePriceInfo');
        gasBoyDBObj.priceInsValue = pInfo;
        if (gasBoyDBObj.pdb === undefined || gasBoyDBObj.pdb === null) {
            gasBoyDBObj.init();
        }
        gasBoyDBObj.pdb.transaction(gasBoyDBObj._savePriceInfo);
    },
    dateConvert: function(strDate) {
        try {
            var d = new Date(strDate);
            return d;
        } catch (err) {
            console.debug('dateConvert..error.' + err.message);
        }
    },
    updateStationSuccess: function(tx, results) {
        console.info('Success...');
        if (!results.rowsAffected) {
            var insert = 'INSERT INTO Stations ( country, zip, reg_price, mid_price, pre_price, diesel_price, \
                            reg_date, mid_date, pre_date, diesel_date, address, diesel, id, \
                            lat, lng, station, region, city, distance, load_date) \
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            console.debug(insert);
            $.each(gasBoyDBObj.stationInsValue, function(i, value) {
                try {
                    tx.executeSql(insert, [value.country, value.zip, value.reg_price, value.mid_price, value.pre_price, value.diesel_price, value.reg_date, value.mid_date, value.pre_date, value.diesel_date, value.address, value.diesel, value.id, value.lat, value.lng, value.station, value.region, value.city, value.distance, new Date(Date.now())], gasBoyDBObj.success, gasBoyDBObj.fail);
                } catch (err) {
                    console.error('updateStationSuccess error... ' + err.message);
                }
            });
        }
    },
    updatePriceSuccess: function(tx, results) {
        console.info('Success...');
        if (!results.rowsAffected) {
            var insert = 'INSERT INTO Prices (id, location, price, readDate, load_date ) VALUES (?,?,?,?,?)';
            console.debug(insert);
            $.each(gasBoyDBObj.priceInsValue, function(i, value) {
                try {
                    tx.executeSql(insert, [(i + 1), value.LocationName, value.Price, value.ReadDate, new Date(Date.now())], gasBoyDBObj.success, gasBoyDBObj.fail);
                } catch (err) {
                    console.error('updatePriceSuccess error... ' + err.message);
                }
            });
        }
    },
    success: function(ex, results) {
        console.info('Success...');
    },
    fail: function(err, results) {
        console.error(err.code + ': ' + err.message);
    },
    _queryForResults: function(tx) {
        tx.executeSql(sqlConfig.PriceQuery, this.PriceResults, this.querySuccess, this.fail);
        tx.executeSql(sqlConfig.StationsQuery, this.StationResults, this.querySuccess, this.fail);
        window.localStorage.setItem('results', new Date(Date.now()));
    },
    querySuccess: function(tx, results) {
        console.debug('row count: ' + results.rows.length);
    },
    getPriceResults: function() {
        console.debug('start getResults');
        if (gasBoyDBObj.pdb === undefined || gasBoyDBObj.pdb === null) {
            gasBoyDBObj.init();
        }
        gasBoyDBObj.pdb.transaction(gasBoyDBObj._queryForResults, gasBoyDBObj.fail, gasBoyDBObj.success);
    },
    getStationResults: function() {
        console.debug('start getResults');
        if (gasBoyDBObj.sdb === undefined || gasBoyDBObj.sdb === null) {
            gasBoyDBObj.init();
        }
        gasBoyDBObj.sdb.transaction(gasBoyDBObj._queryForResults, gasBoyDBObj.fail, gasBoyDBObj.success);
    },
    CleanResults: function() {
        console.debug('getResults...');
        var r = null;
        try {
            if (gasBoyDBObj.db === null) gasBoyDBObj.init();
            //if (this.PriceResults !== undefined && this.PriceResults.length === 0) return null;
            for (var row = 0; i < gasBoyDBObj.PriceResults.length; i++) {
                gasBoyDBObj.priceData = new LocalPrice();
                lp.LocationName = gasBoyDBObj.PriceResults.location;
                lp.ReadDate = gasBoyDBObj.PriceResults.readDate;
                lp.Price = gasBoyDBObj.PriceResults.price;
                r.LocalPrices[i] = lp;
            }
        } catch (err) {
            console.error('getRusults Error... ' + err.message);
        }
        return r;
    }
};