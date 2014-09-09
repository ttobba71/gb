//"use strict";
var browser = false;
var stationsInfo = null;
var gbdb = new gasBoyDBObj();
window.localStorage.setItem('forceUpdate', false);

function onGeoSuccess(position) {
    geoInfo.lat = position.coords.latitude;
    geoInfo.lng = position.coords.longitude;
    geoInfo.altitude = position.coords.altitude;
    geoInfo.accuracy = position.coords.accuracy;
    geoInfo.altAccuracy = position.coords.altitudeAccuracy;
    geoInfo.heading = position.coords.heading;
    geoInfo.speed = position.coords.speed;
    geoInfo.timestamp = new Date(position.timestamp);
    console.debug(geoInfo);
    executeAsync(getSurroundingAreaData);
}

function onGeoError(error) {
    console.error('getCurrentPosition error: ' + error.message);
}

function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);
}

function executeAsync(func) {
    console.log('executing... Async');
    var rval = null;
    try {
        setTimeout(rval = func, 0);
    } catch (e) {
        alert(e.message);
    }
    return rval;
}

function executeAsync(func, data) {
    console.log('executing... Async with data');
    var rval = null;
    try {
        setTimeout(rval = func(data), 0);
    } catch (e) {
        alert(e.message);
    }
    return rval;
}

function testScope() {
    console.log('testScope...');
}

function AddLocalNotification() {
    var now = new Date().getTime(),
        _10_seconds_from_now = new Date(now + 10 * 1000);
    window.plugin.notification.local.add({
        id: 1,
        title: 'GasBoy',
        message: 'Gas prices updates available.',
        badge: 1,
        autoCancel: true,
        repeat: 'weekly',
        date: _10_seconds_from_now
    });
}

function updateView(presult) {
    console.debug('updateView...');
    $('#prices').empty();
    $.each(presult.LocalPrices, function(i, prices) {
        var day = prices.ReadDate.split("T");
        var time = day.length > 1 ? day[1].split(".") : '';
        day = day.length > 0 ? day[0] : '';
        $('#prices').append('<tr><td>' + prices.LocationName + '</td><td>$' + prices.Price + '</td><td>' + day + '</td></tr>');
    });
    $('gasTable').table("refresh");
}

function updateLocalPriceTable(result) {
    console.debug('updateLocalPriceTable: ');
    if( stationsInfo === null || stationsInfo === undefined) {
        stationsInfo = {};
        stationsInfo.stations  = result
    }
    $('#localPriceContent').empty();
    var count = 0;
    $.each(result, function(i, stion) {
        if (count++ <= 3) {
            $('#localPriceContent').append('<tr><td><a href="#station" id="showPageBtn_' + i + '" data-transition="slidedown">' + (stion.station === null ? 'NA' : stion.station) + '</a></td><td>' + (stion.distance === null ? 'NA' : stion.distance) + '</td><td>$' + (stion.reg_price === null ? 'NA' : stion.reg_price) + '</td></tr>');
            $('#showPageBtn_' + i).on('click', {
                value: i
            }, function(event) {
                console.debug('button clicked... updating status...index' + event.data.value);
                executeAsync(updateStationInfo, event.data.value);
            });
        }
        //console.debug('i: ' + i);
    });
}

function loadMap(start) {
    var mapUrlBase = 'comgooglemaps://';
    var gmapUrl = '?q={0}&zoom=14&views=traffic'.format(start);
    var mapUrl = '?q={0}'.format(start);
    console.debug('loadMap: ' + mapUrlBase + gmapUrl);
    try {
        document.location = mapUrlBase + gmapUrl;
        setTimeout(function() {
            document.location = 'maps://' + mapUrl;
        }, 300);
    } catch (error) {
        console.debug(error.message);
    }
}

function updateStationInfo(index) {
    console.debug('updateStationInfo--' + index);
    var stDetails = stationsInfo.stations[index];
    $('#stationDetailLst').empty();
    $('#stationDetailLst').append('<li><b>Name:</b> ' + (stDetails.station === null ? 'NA' : stDetails.station) + '</li>');
    $('#stationDetailLst').append('<li><b>Distance to Station:</b> ' + (stDetails.distance === null ? 'NA' : stDetails.distance) + '</li>');
    $('#stationDetailLst').append('<li><b>Regular:</b> ' + (stDetails.reg_price === null ? 'NA' : stDetails.reg_price) + '</li>');
    $('#stationDetailLst').append('<li><b>Mid:</b> ' + (stDetails.mid_price === null ? 'NA' : stDetails.mid_price) + '</li>');
    $('#stationDetailLst').append('<li><b>Premium:</b> ' + (stDetails.pre_price === null ? 'NA' : stDetails.pre_price) + '</li>');
    $('#stationDetailLst').append('<li><b>Diesel:</b> ' + (stDetails.diesel_price === null ? 'NA' : stDetails.diesel_price) + '</li>');
    $('#stationDetailLst').append('<li><b>Address:</b> ' + (stDetails.address === null ? 'NA' : stDetails.address) + '</li>');
    $('#stationDetailLst').append('<li><b>City, Zip:</b> ' + (stDetails.city === null ? 'NA' : stDetails.city) + ',' + (stDetails.zip === null ? 'NA' : stDetails.zip) + '</li>');
    $('#stationDetailLst').append('<li><a id="mapLink" href="#">View on Map</a></li>');
    $('#mapLink').on('click', function() {
        loadMap(stDetails.lat + ',' + stDetails.lng);
        return false;
    });
    if ($('#stationDetailLst').hasClass('ui-listview')) $('#stationDetailLst').listview('refresh');
    else $('#stationDetailLst').trigger('create');
}

function buildGasFeedAreaURL() {
    var baseUrl = 'http://crmweb.emersonnetworkpower.com/gasboy/api/stations/';
    var apiKey = '1a2b3c4d5e6f';
    var url = baseUrl + geoInfo.lat + '/' + geoInfo.lng + '/' + apiKey;
    console.debug('buildGasFeedURL: ' + url);
    return url;
}

function saveStationsLocally(stations) {
    try {
        console.debug('before saveLocally');
        executeAsync(gbdb.saveStationInfo, stations);
        console.debug('after saveLocally...');
    } catch (err) {
        console.error(err.message);
        throw 'saveStationsLocally...' + err.message;
    }
}

function savePricesLocally(prices) {
    try {
        console.debug('before saveLocally');
        executeAsync(gbdb.savePriceInfo, prices);
        console.debug('after saveLocally...');
    } catch (err) {
        console.error(err.message);
        throw 'savePricesLocally...' + err.message;
    }
}

function sameDay(d1, d2) {
    if (d1 === null || d2 === null) return false;
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);
    return d1.getUTCFullYear() == d2.getUTCFullYear() && d1.getUTCMonth() == d2.getUTCMonth() && d1.getUTCDate() == d2.getUTCDate();
}

function getSurroundingAreaData() {
    console.debug('getSurroundingStationData..');
    $.ajax({
        url: buildGasFeedAreaURL(),
        type: "GET",
        async: false,
        //crossdomain: true,
        datatype: 'json',
        cache: true,
        contentType: 'application/json',
        success: function(data) {
            try {
                stationsInfo = data;
                console.debug('after parse...');
                saveStationsLocally(stationsInfo.stations);
                updateLocalPriceTable(data.stations);
            } catch (err) {
                gbdb.getStationResults(updateLocalPriceTable);
                console.error('getSurroundingAreaData...error: ' + err.message);
            }
        },
        error: function() {
            gbdb.getStationResults(updateLocalPriceTable);
            console.info('Load Station UI from DB');
        }
    });
}

function getPriceData() {
    console.debug('getPriceData..');
    var apiKey = '1a2b3c4d5e6f';
    var url = "http://crmweb.emersonnetworkpower.com/gasboy/api/prices/" + apiKey;
    $.ajax({
        url: url,
        type: "GET",
        async: false,
        //crossdomain: true,
        datatype: 'json',
        cache: false,
        contentType: 'application/json',
        success: function(data) {
            try {
                result = data;
                savePricesLocally(result.LocalPrices);
                updateView(result);
            } catch (err) {
                console.error('Error...getPriceData...error ' + err.message);
                updateView(gbdb.PriceResults);
            }
        },
        error: function(xhr, status, error) {
            gbdb.getPriceResults(updateView);
            console.info('load Price from DB');
        }
    });
}

function testData() {
    var r = result;
    r.LocalPrices = [{
        ReadDate: new Date(Date.now()).toISOString(),
        Price: '3.09',
        LocationName: 'Columbus'
    }, {
        ReadDate: new Date(Date.now()).toISOString(),
        Price: '3.13',
        LocationName: 'Delaware'
    }];
    r.StatePrices = {
        state: 'Ohio',
        regular: '3.05',
        mid: '3.10',
        premium: '3.16',
        diesel: '3.31'
    };
    updateView(r);
    updateLocalPriceTable(gasFeedTest.stations);
}
$(window).on("navigate", function(event, data) {
    console.log(data.state);
});
$(window).on("orientationchange", function(event) {
    console.debug('orientation changed');
});
$(document).on("mobileinit", function() {
    console.debug('mobileinit');
    $.mobile.page.prototype.options.domCache = false;
    $.mobile.loader.prototype.options.disabled = true;
});
$(document).on("swipe", "#main", function(e) {
    console.debug('swipe');
});
$("#station").on("pagechange", function(event) {
    console.debug('station changed......');
});
$(document).on("pageinit", "#station", function(e) {
    console.debug('page station init...');
    alert('statin-pi-isOnline: ' + isOnLine);
    $('#station').bind("swipe", function(event) {
        console.debug('swipe debug');
        $.mobile.navigate("#main");
    });
});
$(document).on("pagecreate", "#about", function(e) {
    console.debug('page about loaded...');
});
$(document).on("pagecreate", "#main", function(event) {
    console.debug('main pagecreate');
    console.debug('main-pc-isOnline: ' + isOnLine);
    $(".ui-loader").hide();
    executeAsync(cancelAllNotifications);
    executeAsync(getCurrentPosition);
    executeAsync(getPriceData);
    executeAsync(getSurroundingAreaData);
    $('body').on('pagecontainertransition', function(event, ui) {
        console.debug('pagecontainertransition');
        //gets the id you programatically give to your page
        id_url = $("body").pagecontainer("getActivePage")[0].id;
        //compare the actual event data (ui.toPage) 
        if (ui.toPage[0] == $('#' + id_url)[0]) {
            // failsafe
            if (typeof(window[id_url].initPage) === "function") {
                // call the dynamically created init function
                window[id_url].initPage();
            }
        }
    });
    $('#showPageBtn').on('tap', function(event, data) {
        console.debug('showPageBtn..tap.' + data);
    });
    $('#refreshDataBtn').on('tap', function(event) {
        console.debug('tapped refresh...');
        executeAsync(getCurrentPosition);
        executeAsync(getPriceData);
        executeAsync(getSurroundingAreaData);
    });
    $('#main').bind("swipe", function(event) {
        console.debug('swipe debug');
        executeAsync(AddLocalNotification);
    });
});