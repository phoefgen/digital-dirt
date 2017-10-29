'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Primary Entry point for dana30
*/

var trucks = [];
var truckMap = '';
var infowindow = void 0;

/********************************************************************************************* */
// Collect truck data
/********************************************************************************************* */

function getData(cb) {
    // Data source does not support CORS, requires local cors proxy in dev, and local api proxy
    // in production.

    fetch("http://localhost:1337/data.streetfoodapp.com/1.1/schedule/vancouver/").then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        response.json().then(function (data) {
            cb(data);
        });
    }).catch(function (error) {
        alert('ohno! Unable to retrieve foodtruck API data: ' + error + ' ');
    });
}

var truck = function () {
    function truck(_truck, index) {
        _classCallCheck(this, truck);

        // translate API data
        this.name = _truck.name;
        this.email = _truck.email;
        this.rating = _truck.rating;
        this.description_long = _truck.description;
        this.id = index;
        this.position = { lat: _truck.last.latitude, lng: _truck.last.longitude };

        // Not all valid trucks have short descriptions.
        if (_truck.description_short !== null) {
            this.description_short = _truck.description_short;
        } else {
            this.description_short = ' ';
        }
        // Buildinfowindow, and create marker using infowindow.
        this.infowindowContent = this.createInfoWindowContent();
        this.infowindow = new google.maps.InfoWindow({ content: this.infowindowContent });
        this.marker = this.createMarker(this.name, this.position, this.infowindow, this.id);

        // Make all trucks visibile by default
        this.visible = true;
    }

    _createClass(truck, [{
        key: 'createMarker',
        value: function createMarker(name, position, infowindow, id) {
            var marker = new google.maps.Marker({ // map is explicitly excluded here, and used to control the UX later.
                title: name,
                icon: '../img/truck.png',
                position: position,
                animation: google.maps.Animation.DROP
            });
            window.google.maps.event.addListener(marker, 'click', function () {
                // On click, close all open truck info windows, stop the animation and then open the infowindow
                // that was called.
                trucks.forEach(function (truck) {
                    truck.marker.setAnimation(null);
                    truck.infowindow.close(truckMap, truck.marker);
                });

                // Re orient and open the info window for the marker:
                var truck = trucks[id];
                truckMap.panTo(truck.marker.position);
                truck.infowindow.open(truckMap, truck.marker);

                // Animate the selected marker:
                marker.setAnimation(google.maps.Animation.BOUNCE);

                // Hide the search bar:
                $('.sidebar').css('display', 'none');
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

var ViewModel = function ViewModel() {
    var self = this;

    // map global array of passed in trucks to observableArray of truck objects.
    self.trucks = ko.observableArray(trucks);

    // Fire the pre defined click event if a list item is selected.
    self.selectedTruck = function (truck) {
        google.maps.event.trigger(truck.marker, 'click');
    };

    // init with null value to allow placeholder txt to be dispalyed.
    self.searchString = ko.observable('');

    // Manipulate the list and marker visibility with a text search
    // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    // modify the members of visible trucks with search
    self.visibleTrucks = ko.computed(function () {
        // make no changes if there is nothing in the search box (init state)
        if (self.searchString() === '') {
            ko.utils.arrayForEach(self.trucks(), function (truck) {
                truck.marker.setMap(truckMap);
            });
            return self.trucks();
        } else return ko.utils.arrayFilter(self.visibleTrucks(), function (truck) {
            // Combine name and description search (food type is likely mentioned in the description)

            // sanitize text input
            var filter = self.searchString().toLowerCase();

            // enable searching the description fields
            var target = truck.name + truck.description_short + truck.description_long;
            target = target.toLowerCase();

            // Determine match status.
            var match = target.indexOf(filter) >= 0;

            //update map view model
            if (match) {
                truck.marker.setMap(truckMap);
            } else {
                truck.marker.setMap(null);
            }

            // pop matches to the visibleTrucks observable array.
            return match;
        });
    });
};

function getTrucks() {
    // get truck data
    getData(function (data) {
        // Build an array of custom truck objects from the API data.
        var nameVendors = Object.keys(data.vendors);
        var numVendors = nameVendors.length;
        var cleanVendors = [];

        for (var i = 0; i < numVendors; i++) {
            // Some trucks are incomplete (especially those that are registered but have never
            // checked in.)
            var dirtyTruck = data.vendors[nameVendors[i]];
            if (typeof data.vendors[nameVendors[i]].last != "undefined") {
                cleanVendors.push(dirtyTruck);
            }
        }
        // fill the JS array
        for (var _i = 0; _i < cleanVendors.length; _i++) {
            trucks.push(new truck(cleanVendors[_i], _i));
        }

        // Create a view model, and bind the view to it.
        ko.applyBindings(new ViewModel());
    });
}

/********************************************************************************************* */
// Map functions.
/********************************************************************************************* */

function initMap() {

    // Generate a map of Vancouver BC
    truckMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 49.246292, lng: -123.116226 },
        mapTypeControl: false,
        streetViewControl: false
    });
    // Place food trucks on it.
    getTrucks();

    // Add ability to hide menu
    $('#toggleButton').click(function () {
        console.log($('#toggleButton').css('display'));
        if ($('.sidebar').css('display') == 'none') {
            console.log('display  == none');
            $('.sidebar').css('display', 'block');
        } else {
            console.log('display == block');
            $('.sidebar').css('display', 'none');
        }
    });
}