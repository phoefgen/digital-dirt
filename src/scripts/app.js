/* Primary Entry point for dana30
*/

let trucks = ko.observableArray();
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
            response.json().then(
                function (data) {
                    cb(data);
                });
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
    }
    createMarker(name, position, infowindow, id) {
        const marker = new google.maps.Marker({
            title: name,
            icon: '../img/truck.png',
            position: position,
          //  map: truckMap,
            animation: google.maps.Animation.DROP,
        });
        window.google.maps.event.addListener(marker, 'click', function () {
            // On click, close all open truck info windows and open the infowindow
            // that was called.
            trucks().forEach(function (truck) {
                truck.infowindow.close(truckMap, truck.marker);
            });
            const truck = trucks()[id];
            truck.infowindow.open(truckMap, truck.marker);
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

function buildList() {
    ko.applyBindings(trucks);
}

function getTrucks() {
    // get truck data
    getData(function (data) {
        // Build an array of custom truck objects from the API data.
        let nameVendors = Object.keys(data.vendors);
        let numVendors = nameVendors.length;
        let cleanVendors = [];
        console.log(data);

        for (let i = 0; i < numVendors; i++) {
            // Some trucks are incomplete (especially those that are registered but have never
            // checked in.)
            let dirtyTruck = data.vendors[nameVendors[i]];
            if (typeof data.vendors[nameVendors[i]].last != "undefined") {
                cleanVendors.push(dirtyTruck);
            }
        }
        // fill the knockout observable array with truck markers.
        for (let i = 0; i < cleanVendors.length; i++) {
            trucks.push(new truck(cleanVendors[i], i));
        }

        buildList();
    });
}



/********************************************************************************************* */
// Map functions.
/********************************************************************************************* */

function initMap() {

    // Generate a map of Vancouver
    truckMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 49.246292, lng: -123.116226 },
    });

    // Generate a single, reusable infowindow

    // Place food trucks on it.
    getTrucks();
}