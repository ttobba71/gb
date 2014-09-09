//"use strict";
var gasFeedTest = {
    "status": {
        "error": "NO",
        "code": 200,
        "description": "none",
        "message": "Request ok"
    },
    "geoLocation": {
        "country_short": "US",
        "address": "111 River Walk Trl",
        "lat": "34.83853232584413",
        "lng": "-86.46735160619622",
        "country_long": "United States",
        "region_short": "AL",
        "region_long": "AL",
        "city_long": "New Market"
    },
    "stations": [{
        "country": "United States",
        "zip": "35811",
        "reg_price": "3.13",
        "mid_price": "3.47",
        "pre_price": "N\/A",
        "diesel_price": "3.62",
        "reg_date": "3 weeks ago",
        "mid_date": "3 weeks ago",
        "pre_date": "3 weeks ago",
        "diesel_date": "3 weeks ago",
        "address": "1979 Winchester Rd Ne",
        "diesel": "1",
        "id": "39853",
        "lat": "34.814388",
        "lng": "-86.500801",
        "station": "Texaco",
        "region": "Alabama",
        "city": "Huntsville",
        "distance": "2.5 miles"
    }, {
        "country": "United States",
        "zip": "35811",
        "reg_price": "3.11",
        "mid_price": "3.33",
        "pre_price": "N\/A",
        "diesel_price": "3.61",
        "reg_date": "3 weeks ago",
        "mid_date": "3 weeks ago",
        "pre_date": "3 weeks ago",
        "diesel_date": "3 weeks ago",
        "address": "1966 Winchester Rd Ne",
        "diesel": "1",
        "id": "110175",
        "lat": "34.814190",
        "lng": "-86.501167",
        "station": "Sunoco",
        "region": "Alabama",
        "city": "Huntsville",
        "distance": "2.6 miles"
    }]
};

var LocalPrice = {
        ReadDate: '',
        Price: '',
        LocationName: '' 
}
var result = {
    LocalPrices: []
};
var geoInfo = {
    lat: '',
    lng: '',
    altitude: '',
    accuracy: '',
    altAccuracy: '',
    heading: '',
    speed: '',
    timestamp: null
};
var station = {
    country: '',
    reg_price: '',
    mid_price: '',
    pre_price: '',
    diesel_price: '',
    address: '',
    diesel: '',
    id: 0,
    lat: 0,
    lng: 0,
    station: '',
    region: '',
    city: '',
    reg_date: '',
    mid_date: '',
    pre_date: '',
    diesel_date: '',
    distance: ''
};
var localPrc = {
    status: {
        error: 'NO',
        code: 200,
        description: '',
        message: 'Request ok'
    },
    geoLocation: {
        city_id: 0,
        city_long: '',
        region_short: '',
        region_long: '',
        country_long: '',
        country_id: 0,
        region_id: 0
    },
    stations: []
};
//format string implementation

var isOnLine = true;

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
function stringToBoolean (string){
    switch(string.toLowerCase()){
        case "true": case "yes": case "1": return true;
        case "false": case "no": case "0": case null: return false;
        default: return Boolean(string);
    }
}

function GBHashTable(obj) {
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }
    this.setItem = function(key, value) {
        var previous = null;
        if (this.hasItem(key)) {
            previous = this.items[key];
        } else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    };
    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    };
    this.hasItem = function(key) {
        return this.items.hasOwnProperty(key);
    };
    this.removeItem = function(key) {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        } else {
            return undefined;
        }
    };
    this.keys = function() {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
    this.values = function() {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    };
    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    };
    this.clear = function() {
        this.items = {};
        this.length = 0;
    };
}