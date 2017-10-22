'use strict';

/* Primary Entry point for dana30
*/

// Define config per tab
var americas = {
    center: { lat: 29.766083, lng: -95.358810 },
    regions: [{
        name: 'North Carolina',
        loc: { lat: 35.782169, lng: -80.793457 }
    }, {
        name: 'Montreal',
        loc: { lat: 45.644768, lng: -73.564453 }
    }, {
        name: 'North California',
        loc: { lat: 37.926868, lng: -122.519531 }
    }, {
        name: 'Ohio',
        loc: { lat: 40.513799, lng: -82.705078 }
    }, {
        name: 'Oregon',
        loc: { lat: 43.834527, lng: -120.9375 }
    }, {
        name: 'Sao Paulo',
        loc: { lat: -23.533773, lng: -46.625290 }
    }],
    services: ['S3', 'EC2', 'API', 'Route53'],
    zoom: 2
};

var europe = {
    center: { lat: 48.864716, lng: 2.349014 },
    regions: [{
        name: 'Frankfurt',
        loc: { lat: 50.110924, lng: 8.682127 }
    }, {
        name: 'Dublin',
        loc: { lat: 53.350140, lng: -6.266155 }
    }, {
        name: 'London',
        loc: { lat: 51.509865, lng: -0.118092 }
    }],
    services: [''],
    zoom: 6
};

var asia = {
    center: { lat: 4.399493, lng: 113.991386 },
    regions: [{
        name: 'Mumbai',
        loc: { lat: 18.947622, lng: 72.834442 }
    }, {
        name: 'Seoul',
        loc: { lat: 37.532600, lng: 127.024612 }
    }, {
        name: 'Singapore',
        loc: { lat: 1.290270, lng: 103.851959 }
    }, {
        name: 'Sydney',
        loc: { lat: -33.865143, lng: 151.209900 }
    }, {
        name: 'Tokyo',
        loc: { lat: 35.652832, lng: 139.839478 }
    }],
    services: [''],
    zoom: 3
};

// Define application configuration
var appConf = {
    defaultRegion: asia
};

// Control Map loading.
function initMap(region) {
    var conf = void 0;

    // Cant pass region variables on page load.
    if (!region) {
        conf = appConf.defaultRegion;
    } else {
        conf = region;
    }
    // Generate primary Map.
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: conf.zoom,
        center: conf.center,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'none',
        scrollwheel: false
    });

    // Loop over the regions, and place markers.
    for (var i = 0; i < conf.regions.length; i++) {
        var marker = new google.maps.Marker({
            position: conf.regions[i].loc,
            map: map,
            title: conf.regions[0].name
        });
    };
}

// Maps are returned centered on  the viewport at page load. This breaks the centering
window.onresize = function () {
    initMap(northAmerica);
};

// Turn down the active menu item glow after a few seconds.
setTimeout(function () {
    $('.activeRegion').addClass('calmActiveRegion');
}, 2000);