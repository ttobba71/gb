//"use strict";
var browser = false;
var stationsInfo = null;
//window.localStorage.setItem('forceUpdate', false);

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
    console.log('executing...' + func);
    var rval = null;
    setTimeout(rval = func, 0);
    return rval;
}

function executeAsync(func, data) {
    console.log('executing...' + func);
    var rval = null;
    setTimeout(rval = func(data), 0);
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

function updateView(result) {
    console.debug('updateView...' + result);
    $('#prices').empty();
    $.each(result.LocalPrices, function(i, prices) {
        var day = prices.ReadDate.split("T");
        var time = day.length > 1 ? day[1].split(".") : '';
        day = day.length > 0 ? day[0] : '';
        $('#prices').append('<tr><td>' + prices.LocationName + '</td><td>$' + prices.Price + '</td><td>' + day + '</td></tr>');
    });
    $('gasTable').table("refresh");
}
/*
function clicked(index) {
    console.debug('1clicked-' + index);
    updateStationInfo(index);
    console.debug('2clicked-' + index);
    $('#showPageBtn').trigger("stationInfo", index);
    console.debug('3clicked-' + index);
    return true;
}
*/
function updateLocalPriceTable(result) {
    console.debug('updateLocalPriceTable: ' + result);
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
        console.debug('i: ' + i);
    });
}

function loadMap(start) {
    var mapUrlBase = 'comgooglemaps://';
    var gmapUrl = '?q={0}&zoom=14&views=traffic'.format(start);
    var mapUrl =  '?q={0}'.format(start);
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
    $('#stationDetailLst').listview("refresh");
}

function buildGasFeedAreaURL() {
    var baseUrl = 'http://crmweb.emersonnetworkpower.com/gasboy/api/stations/';
    var apiKey = '1a2b3c4d5e6f';
    var url = baseUrl + geoInfo.lat + '/' + geoInfo.lng + '/' + apiKey;
    console.debug('buildGasFeedURL: ' + url);
    return url;
}

function getDataFromSql() {
    try {
        console.debug('before getDataFromSql');
        executeAsync(gasBoyDBObj.getResults);
        console.debug('after getDataFromSql...');
    } catch (err) {
        console.debug(err.message);
    }
}

function saveStationsLocally(stations) {
    try {
        console.debug('before saveLocally');
        executeAsync(gasBoyDBObj.saveStationInfo, stations);
        console.debug('after saveLocally...');
    } catch (err) {
        console.debug(err.message);
    }
}

function savePricesLocally(prices) {
    try {
        console.debug('before saveLocally');
        executeAsync(gasBoyDBObj.savePriceInfo, prices);
        console.debug('after saveLocally...');
    } catch (err) {
        console.debug(err.message);
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
        async: true,
        //crossdomain: true,
        datatype: 'json',
        cache: false,
        contentType: 'application/json',
        success: function(data) {
            try {
                stationsInfo = data;
                if( stationsInfo == null)
                    getDataFromSql();
                console.debug('after parse...');
                saveStationsLocally(stationsInfo.stations);
                updateLocalPriceTable(data.stations);
            } catch (err) {
                if (!sameDay(window.localStorage.getItem('results'), new Date(Date.now()))) getDataFromSql();
                console.log('updating UI from DB');
                updateLocalPriceTable(gasBoyDBObj.StationResults);
                console.log('getSurroundingAreaData...error: ' + err.message);
            }
        },
        onFail: function() {
            console.error('getSurroundingAreaData...onFail');
            if (!sameDay(window.localStorage.getItem('results'), new Date(Date.now()))) getDataFromSql();
            console.log('updating UI from DB');
            updateLocalPriceTable(gasBoyDBObj.StationResults);
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
        async: true,
        //crossdomain: true,
        datatype: 'json',
        cache: false,
        contentType: 'application/json',
        success: function(data) {
            try {
                result = data;
                if( result == null )
                    getDataFromSql();
                savePricesLocally(result.LocalPrices);
                updateView(result);
            } catch (err) {
                console.log('getPriceData...error ' + err.message);
                if (!sameDay(window.localStorage.getItem('results'), new Date(Date.now()))) getDataFromSql();
                console.log('updating UI from DB');
                updateView(gasBoyDBObj.PriceData);
            }
        },
        onFail: function() {
            console.error('getPriceData... error: ');
            if (!sameDay(window.localStorage.getItem('results'), new Date(Date.now()))) getDataFromSql();
            console.log('updating UI from DB');
            updateView(gasBoyDBObj.PriceData);
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
    //alert( 'navigate... data..' + data.state );
});
$(window).on("orientationchange", function(event) {
    console.debug('orientation changed');
    //alert("Orientation changed to: " + event.orientation);
});
$(document).on("mobileinit", function() {
    console.debug('mobileinit');
    $.mobile.page.prototype.options.domCache = false;
    $.mobile.loader.prototype.options.disabled = true;
});
$(document).on("swipe", "#main", function(e) {
    console.debug('swipe');
    //if (browser) executeAsync(testData);
    //else executeAsync(getPriceData);
    //executeAsync(getCurrentPosition);
});
$("#station").on("pagechange", function(event) {
    console.debug('station changed......');
});
$(document).on("pagecreate", "#station", function(e) {
    console.debug('page station loaded...');
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
    $(".ui-loader").hide();
    executeAsync(getCurrentPosition);
    executeAsync(cancelAllNotifications);
    //if (browser) executeAsync(testData);
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
        if (browser) executeAsync(testData);
        else executeAsync(getPriceData);
        saveLocally(stationsInfo.stations);
    });
    $('#main').bind("swipe", function(event) {
        console.debug('swipe debug');
        executeAsync(AddLocalNotification);
    });
});