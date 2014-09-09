var priceObj = null;

function populateDB(tx, priceObj) {
    tx.executeSql('DROP TABLE IF EXISTS Prices');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Prices (id unique, location, price, readDate)');
    for (var i = priceObj.localPrices.length - 1; i >= 0; i--) {
        var lp = priceObj.localPrices[i];
        tx.executeSql('INSERT INTO Prices (id, location, price, readDate ) VALUES (i, "' + lp.LocationName + '", "' + lp.Price + '", "' + lp.ReadDate + '")');
    }
}

function errorCB(err) {
    alert("Error processing SQL: " + err.code);
}

function successCB() {
    alert("success!");
}

function seedPriceData(priceData) {
    priceObj = priceData;
    var db = window.openDatabase("PriceDB", "1.0", "Price Storage", 1000000);
    db.transaction(populateDB, errorCB, successCB);
}
