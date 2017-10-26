'use strict';

/* Primary Entry point for dana30
*/

/********************************************************************************************* */
// Collect truck data
/********************************************************************************************* */

function createInfoWindow(truck) {
    return '<div id="truckDetail">\n                <h1>' + truck.name + '</h1>\n                <h3>' + truck.description_short + '</h3>\n                <p>' + truck.description_long + '</p>\n                ';
}

function createMarker(truck, truckMap) {
    // Create a marker to be added to the truck object.
    // Explicitly omit a map reference, and modify the object from the ui later
    // to control display.
    var marker = new google.maps.Marker({
        title: truck.name,
        icon: '../img/truck.png',
        position: truck.position,
        map: truckMap,
        animation: google.maps.Animation.DROP
    });

    return marker;
}

function getData(cb) {
    // Data source does not support CORS, requires local cors proxy in dev, and local api proxy
    // in production.

    fetch("http://localhost:1337/data.streetfoodapp.com/1.1/schedule/vancouver/").then(function (response) {
        response.json().then(function (data) {
            cb(data);
        });
    });
}

function getTrucks(truckMap) {
    // get truck data
    getData(function (data) {
        // Build an array of custom truck objects from the API data.
        var nameVendors = Object.keys(data.vendors);
        var numVendors = nameVendors.length;

        for (var i = 0; i <= numVendors; i++) {
            // In some cases, a truck is registered but has never been on the road and does
            // not have a 'last' attribute. Guess how many hours that took to figure out.

            if (data.vendors[nameVendors[i]] && 'last' in data.vendors[nameVendors[i]]) {
                (function () {
                    // Build a custom truck object containing the marker, and referencing the position and
                    // details from the api call.
                    var truck = {
                        name: data.vendors[nameVendors[i]].name,
                        position: {
                            lat: data.vendors[nameVendors[i]].last.latitude,
                            lng: data.vendors[nameVendors[i]].last.longitude
                        },
                        email: data.vendors[nameVendors[i]].email,
                        rating: data.vendors[nameVendors[i]].rating,
                        description_long: data.vendors[nameVendors[i]].description,
                        description_short: data.vendors[nameVendors[i]].description_short
                    };

                    // create an infowindow by reference to itself
                    var infoContent = createInfoWindow(truck);
                    truck.infowindow = new google.maps.InfoWindow({ content: infoContent });

                    // build a clickable marker.
                    truck.marker = createMarker(truck, truckMap);
                    truck.marker.addListener('click', function () {
                        truck.infowindow.open(truckMap, truck.marker);
                    });

                    // add new truck object to the global array.
                    trucks.push(truck);
                })();
            }
        }
    });
}

var openWindow = void 0;
var trucks = [];

/********************************************************************************************* */
// Map functions.
/********************************************************************************************* */

function initMap() {

    // Generate a map of Vancouver
    var truckMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 49.246292, lng: -123.116226 }
    });

    // Place food trucks on it.
    getTrucks(truckMap);
}