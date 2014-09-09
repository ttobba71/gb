/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function cancelAllNotifications() {
    try {
        if (window.plugin !== undefined) {
            window.plugin.notification.local.cancelAll(function() {
                console.debug('canceled all notificatons...');
            }, testScope);
        }
    } catch (err) {
        console.debug(err.message + " cancel notification...");
    }
}

function checkConnection() {
    console.debug('checkConnection');
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';

    //alert('Connection type: ' + states[networkState]);

    if( networkState == Connection.NONE) return false;
    else return true;

}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("resume", this.onResume, false);
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },
    onOnline: function() {
        //alert( 'online');
        console.debug('onOnline...');
        setTimeout(isOnLine = checkConnection, 0);
    },
    onOffline: function() {
        //alert( 'offline');
        console.debug('onOffline');
        setTimeout(isOnLine = checkConnection, 0);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        checkConnection();
        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 2000);
    },
    onResume: function() {
        console.debug('onResume...');
        cancelAllNotifications();
    },
    onPause: function() {
        console.debug('onPause...');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
    }
};