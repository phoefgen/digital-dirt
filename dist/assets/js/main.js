'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Primary Entry point for dana30
*/

/********************************************************************************************* */
// Collect truck data
/********************************************************************************************* */

function getData(cb) {
    // Data source does not support CORS, requires local cors proxy in dev, and local api proxy
    // in production.

    fetch("http://localhost:1337/data.streetfoodapp.com/1.1/schedule/vancouver/").then(function (response) {
        response.json().then(function (data) {
            cb(data);
        });
    });
}

var truck = function () {
    function truck(_truck, index) {
        _classCallCheck(this, truck);

        // translate API data
        this.name = _truck.name;
        this.position = { lat: _truck.last.latitude, lng: _truck.last.longitude };
        this.email = _truck.email;
        this.rating = _truck.rating;
        this.description_long = _truck.description;
        this.id = index;

        // Not all trucks have short descriptions.
        if (_truck.description_short !== null) {
            this.description_short = _truck.description_short;
        } else {
            this.description_short = ' ';
        }

        // In some cases, a truck is registered but has never been on the road and does
        // not have a 'last' attribute. Guess how many hours that took to figure out!
        if (_truck.last) {
            // Create a HTML string to be rendered for this truck in the infowindow.
            this.infowindowContent = this.createInfoWindowContent();
            this.infowindow = new google.maps.InfoWindow({ content: this.infowindowContent });
            this.marker = this.createMarker(this.name, this.position, this.infowindow, this.id);
        }
    }

    _createClass(truck, [{
        key: 'createMarker',
        value: function createMarker(name, position, infowindow, id) {
            var marker = new google.maps.Marker({
                title: name,
                icon: '../img/truck.png',
                position: position,
                map: truckMap,
                animation: google.maps.Animation.DROP
            });

            window.google.maps.event.addListener(marker, 'click', function () {
                trucks().forEach(function (truck) {
                    truck.infowindow.close(truckMap, truck.marker);
                });
                debugger;
                var truck = trucks()[id];
                debugger;
                truck.infowindow.open(truckMap, truck.marker);
                debugger;
            });
            return marker;
        }
    }, {
        key: 'createInfoWindowContent',
        value: function createInfoWindowContent() {
            // Return constructed infowindow formatting.
            return '<div id="truckDetail">\n                    <h1>' + this.name + '</h1>\n                    <h3>' + this.description_short + '</h3>\n                    <p>' + this.description_long + '</p>\n                    ';
        }
    }]);

    return truck;
}();

function getTrucks() {
    // get truck data
    getData(function (data) {
        // Build an array of custom truck objects from the API data.
        var nameVendors = Object.keys(data.vendors);
        var numVendors = nameVendors.length;

        for (var i = 0; i <= numVendors; i++) {
            trucks.push(new truck(data.vendors[nameVendors[i]], i));
        }
        //trucks()[0].infowindow.open(truckMap, trucks()[0].marker );
    });
}

var trucks = ko.observableArray();
var truckMap = '';
var infowindow = void 0;

/********************************************************************************************* */
// Map functions.
/********************************************************************************************* */

function initMap() {

    // Generate a map of Vancouver
    truckMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 49.246292, lng: -123.116226 }
    });

    // Generate a single, reusable infowindow

    // Place food trucks on it.
    getTrucks();
}