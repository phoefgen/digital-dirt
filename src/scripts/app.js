/* Primary Entry point for dana30
*/

let trucks = [];
let truckMap = '';
let infowindow;

/********************************************************************************************* */
// Collect truck data
/********************************************************************************************* */

function getData(cb) {
    // Data source does not support CORS, requires local cors proxy in dev, and local api proxy
    // in production.

    fetch("http://localhost:1337/data.streetfoodapp.com/1.1/schedule/vancouver/")
        .then(
        function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            response.json().then(
                function (data) {
                    cb(data);
                });
        }).catch(function (error) {
            alert(`ohno! Unable to retrieve foodtruck API data: ${error} `);
        });
}

class truck {
    constructor(truck, index) {
        // translate API data
        this.name = truck.name;
        this.email = truck.email;
        this.rating = truck.rating;
        this.description_long = truck.description;
        this.id = index;
        this.position = { lat: truck.last.latitude, lng: truck.last.longitude };

        // Not all valid trucks have short descriptions.
        if (truck.description_short !== null) {
            this.description_short = truck.description_short;
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
    createMarker(name, position, infowindow, id) {
        const marker = new google.maps.Marker({    // map is explicitly excluded here, and used to control the UX later.
            title: name,
            icon: '../img/truck.png',
            position: position,
            animation: google.maps.Animation.DROP,
        });
        window.google.maps.event.addListener(marker, 'click', function () {
            // On click, close all open truck info windows, stop the animation and then open the infowindow
            // that was called.
            trucks.forEach(function (truck) {
                truck.marker.setAnimation(null);
                truck.infowindow.close(truckMap, truck.marker);
            });

            // Re orient and open the info window for the marker:
            const truck = trucks[id];
            truckMap.panTo(truck.marker.position);
            truck.infowindow.open(truckMap, truck.marker);

            // Animate the selected marker:
            marker.setAnimation(google.maps.Animation.BOUNCE);
        });
        return marker;
    }
    createInfoWindowContent() {
        // Return constructed infowindow formatting.
        return `<div id="truckDetail">
                    <h1>${this.name}</h1>
                    <h3>${this.description_short}</h3>
                    <p>${this.description_long}</p>
                    `;
    }
}

var ViewModel = function () {
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
        } else
            return ko.utils.arrayFilter(self.visibleTrucks(), function (truck) {
                // Combine name and description search (food type is likely mentioned in the description)

                // sanitize text input
                let filter = self.searchString().toLowerCase();

                // enable searching the description fields
                let target = truck.name + truck.description_short + truck.description_long;

                // Determine match status.
                let match = target.toLowerCase(target).includes(filter);

                // Support backspace.
             /*   let match = function(){
                    if (target.toLowerCase.indexOf(filter) >= 0) {
                        return false;
                    } else{
                        return true;
                    }
                }; */

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
        let nameVendors = Object.keys(data.vendors);
        let numVendors = nameVendors.length;
        let cleanVendors = [];

        for (let i = 0; i < numVendors; i++) {
            // Some trucks are incomplete (especially those that are registered but have never
            // checked in.)
            let dirtyTruck = data.vendors[nameVendors[i]];
            if (typeof data.vendors[nameVendors[i]].last != "undefined") {
                cleanVendors.push(dirtyTruck);
            }
        }
        // fill the JS array
        for (let i = 0; i < cleanVendors.length; i++) {
            trucks.push(new truck(cleanVendors[i], i));
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
    });
    // Place food trucks on it.
    getTrucks();

}