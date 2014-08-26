                    var result = {
                        LocalPrices: [{
                            ReadDate: '',
                            Price: '',
                            LocationName: '',
                            ReadDate: '',
                        }],
                        StatePrices: {
                            state: '',
                            regular: '',
                            mid: '',
                            premium: '',
                            diesel: ''
                        }
                    }
                    $(window).on("orientationchange", function(event) {
                        console.debug('orientation changed');
                        //alert("Orientation changed to: " + event.orientation);
                    });

                    function alertDismissed() {
                        alert('dismissed');
                    }

                    function showAlert() {
                        //alert( 'in show alert...' );
                        console.debug('in show alert');
                        try {
                            navigator.notification.alert('You are the winner!', // message
                                alertDismissed, // callback
                                'Game Over', // title
                                'Done' // buttonName
                            );
                        } catch (err) {
                            logger.error('error in show alert..' + err.message);
                        }
                    }

                    function executeAsync(func) {
                        setTimeout(func, 0);
                    }
                    /*
        function AddLocalNotification(){
        localNotifier.addNotification({
                    fireDate        : Math.round(new Date().getTime()/1000 + 5),
                alertBody       : "This is a new local notification.",
            repeatInterval  : "daily",
                soundName       : "horn.caf",
                    badge           : 1,
            notificationId  : 123,
                foreground      : function(notificationId){
                alert("Hello World forground! This alert was triggered by notification " + notificationId);
            },
            background  : function(notificationId){
                alert("Hello World background! This alert was triggered by notification " + notificationId);
                    }
        });
        }
        */
                    function testScope(){
                        console.log( 'testScope...');
                    }
                    function cancelAllNotifications() {
                        try {
                            window.plugin.notification.local.cancelAll(function() {
                                alert('canceled all notificatons...')
                            }, testScope);
                        } catch (err) {
                            alert(err.message + " cancel notification...")
                        }
                    }

                    function AddLocalNotification() {
                        var now = new Date().getTime(),
                            _10_seconds_from_now = new Date(now + 10 * 1000);
                        window.plugin.notification.local.add({
                            id: 1,
                            title: 'Reminder',
                            message: 'Dont forget to buy some flowers.',
                            badge: 1,
                            autoCancel: true,
                            repeat: 'weekly',
                            date: _10_seconds_from_now
                        });
                    }

                    function getPriceData() {
                        console.debug('getPriceData..');
                        var url = "http://crmweb.emersonnetworkpower.com/gasboy/api/prices";
                        $.ajax({
                            url: url,
                            type: "GET",
                            async: true,
                            crossdomain: true,
                            datatype: 'jsonp',
                            cache: false,
                            contentType: 'application/json',
                            success: function(data) {
                                try {
                                    result = $.parseJSON(data);
                                    result.LocalPrices = $.parseJSON(result.LocalPrices);
                                    result.StatePrices = $.parseJSON(result.StatePrices);
                                    //$('#prices').empty();
                                    $.each(result.LocalPrices, function(i, prices) {
                                        var day = prices.ReadDate.split("T");
                                        var time = day.length > 1 ? day[1].split(".") : '';
                                        day = day.length > 0 ? day[0] : '';
                                        $('#prices').append('<tr><td>' + prices.LocationName + '</td><td>' + prices.Price + '</td><td>' + day + '</td></tr>');
                                    });
                                    $('gasTable').table("refresh");
                                    $('#statePrice').empty();
                                    $('#statePrice').append('<h5>' + result.StatePrices.state + '</h5>');
                                    $('#statePrice').append('<div class="ui-bar ui-mini" style="height:20px"><h6>Regular: ' + result.StatePrices.regular + '</h6></div>');
                                    $('#statePrice').append('<div class="ui-bar ui-mini" style="height:20px"><h6>Mid: ' + result.StatePrices.mid + '</h6></div>');
                                    $('#statePrice').append('<div class="ui-bar ui-mini" style="height:20px"><h6>Premium: ' + result.StatePrices.premium + '</h6></div>');
                                    $('#statePrice').append('<div class="ui-bar ui-mini" style="height:20px"><h6>Diesel: ' + result.StatePrices.diesel + '</h6></div>');
                                } catch (err) {
                                    console.log('error');
                                }
                            },
                            done: function() {
                                alert('done');
                            },
                            fail: function() {
                                alert('fail');
                            },
                            completed: function() {
                                alert('completed')
                            }
                        });
                    }
                    $(document).on("swipeleft swiperight", "#one", function(e) {
                        console.debug('swipe-left and right');
                        if ($(".ui-page-active").jqmData("panel") !== "open") {
                            $("#refresh-panel").panel("open", {
                                display: "overlay"
                            });
                            getPriceData();
                            setTimeout(function() {
                                $("#refresh-panel").panel("close");
                            }, 1000);
                        }
                    });
                    $(document).on("pagecreate", "#one", function(event) {
                        getPriceData();
                        $('#one').bind("tap", function(event) {
                            console.debug('tap debug');
                            executeAsync(cancelAllNotifications);
                            //executeAsync(AddLocalNotification());
                        });
                    });