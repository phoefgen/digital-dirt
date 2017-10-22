/* Primary Entry point for dana30
*/

// Define regional maps.
// TODO: TECH DEBT: These should be in a single conf object to allow iteration over N regions.
const americas = {
    center: { lat: 29.766083, lng: -95.358810 },
    regions: [{
        name: 'North Carolina',
        loc: { lat: 35.782169, lng: -80.793457 }
    },
    {
        name: 'Montreal',
        loc: { lat: 45.644768, lng: -73.564453 }
    },
    {
        name: 'North California',
        loc: { lat: 37.926868, lng: -122.519531 }
    },
    {
        name: 'Ohio',
        loc: { lat: 40.513799, lng: -82.705078 }
    },
    {
        name: 'Oregon',
        loc: { lat: 43.834527, lng: -120.9375 }
    },
    {
        name: 'Sao Paulo',
        loc: { lat: -23.533773, lng: -46.625290 }
    }],
    services: ['S3', 'EC2', 'API', 'Route53'],
    zoom: 3
};

const europe = {
    center: { lat: 48.864716, lng: 2.349014 },
    regions: [{
        name: 'Frankfurt',
        loc: { lat: 50.110924, lng: 8.682127 }
    },
    {
        name: 'Dublin',
        loc: { lat: 53.350140, lng: -6.266155 }
    },
    {
        name: 'London',
        loc: { lat: 51.509865, lng: -0.118092 }
    }],
    services: [''],
    zoom: 6
};

const asia = {
    center: { lat: 4.399493, lng: 113.991386 },
    regions: [{
        name: 'Mumbai',
        loc: { lat: 18.947622, lng: 72.834442 }
    },
    {
        name: 'Seoul',
        loc: { lat: 37.532600, lng: 127.024612 }
    },
    {
        name: 'Singapore',
        loc: { lat: 1.290270, lng: 103.851959 }
    },
    {
        name: 'Sydney',
        loc: { lat: -33.865143, lng: 151.209900 }
    },
    {
        name: 'Tokyo',
        loc: { lat: 35.652832, lng: 139.839478 }
    }],
    services: [''],
    zoom: 3
};

// Global region list is  constructed at runtime.
let globalRegion = {
    center: { lat: 16.77532, lng: -3.008265 },
    services: '',
    zoom: 2
};

// Define application configuration
const appConf = {
    defaultRegion: europe
};

// Control Map loading.
function initMap(region) {
    let conf;

    // Cant pass region variables on page load.
    if (!region) {
        conf = appConf.defaultRegion;
    } else {
        conf = region;
    }
    // Generate primary Map.
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: conf.zoom,
        center: conf.center,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'none',
        scrollwheel: false,
    });

    // Loop over the regions, and place markers.
    for (let i = 0; i < conf.regions.length; i++) {
        const marker = new google.maps.Marker({
            position: conf.regions[i].loc,
            map: map,
            title: conf.regions[0].name,
        });
    };

    // Enable map switching

}

/********************************************************************************************* */



/********************************************************************************************* */
// UI CONTROL.

// Maps are returned centered on  the viewport at page load. This breaks the centering
window.onresize = function () { initMap(americas); };

window.onload = function () {
    // Enable tab switching
    //TODO: Why do these need to be wrapped in a function? Something to do with scope.
    $('#americas').on('click', function () { initMap(americas); });
    $('#asia').on('click', function () { initMap(asia); });
    $('#europe').on('click', function () { initMap(europe); });
    $('#global').on('click', function () { initMap(globalRegion); });

    // Construct Data for global view
    // Combine the  AWS regions from all global slices.
    let globalRegions = europe.regions.concat(asia.regions).concat(americas.regions);
    console.log(globalRegions);
    globalRegion.regions = globalRegions
};


/********************************************************************************************* */
// Fluffy Effects

// Turn down the active menu item glow after a few seconds.
setTimeout(function () {
    $('.activeRegion').addClass('calmActiveRegion');
}, 2000);

