/* Primary Entry point for dana30
*/

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
        this.position = { lat: truck.last.latitude, lng: truck.last.longitude };
        this.email = truck.email;
        this.rating = truck.rating;
        this.description_long = truck.description;
        this.id = index;

        // Not all trucks have short descriptions.
        if (truck.description_short !== null) {
            this.description_short = truck.description_short;
        } else {
            this.description_short = ' ';
        }

        // In some cases, a truck is registered but has never been on the road and does
        // not have a 'last' attribute. Guess how many hours that took to figure out!
        if (truck.last) {
            // Create a HTML string to be rendered for this truck in the infowindow.
            this.infowindowContent = this.createInfoWindowContent();
            this.infowindow = new google.maps.InfoWindow({ content: this.infowindowContent });
            this.marker = this.createMarker(this.name, this.position, this.infowindow, this.id);
        }
    }

    createMarker(name, position, infowindow, id) {
        const marker = new google.maps.Marker({
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
            debugger
            const truck = trucks()[id];
            debugger
            truck.infowindow.open(truckMap, truck.marker);
            debugger

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

function getTrucks() {
    // get truck data
    getData(function (data) {
        // Build an array of custom truck objects from the API data.
        let nameVendors = Object.keys(data.vendors);
        let numVendors = nameVendors.length;

        for (let i = 0; i <= numVendors; i++) {
            trucks.push(new truck(data.vendors[nameVendors[i]], i));
        }
        //trucks()[0].infowindow.open(truckMap, trucks()[0].marker );
    });

}

let trucks = ko.observableArray();
let truckMap = '';
let infowindow;


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



