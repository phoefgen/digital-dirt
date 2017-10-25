/* Polls the AWS RSS feeds for current service status details.
// Requires a json data structure to fill called statusData.json
*/

// Global Vars
let schema;
let currentData;

function getData() {
    // REQUIRES localhost CORS proxy
    // `npm install -g corsproxy && corsproxy`

    // updating the global var with the current state of AWS services.
    fetch("http://localhost:1337/status.aws.amazon.com/data.json")
        .then(
        function (response) {
            console.log('getting data');
            response.json().then(
                function (data) {
                    console.log('setting data');

                    currentData = data;
                });
        });
}



function main() {
    // Setup initial dataset on page load.
    console.log(schema);
    console.log(currentData);

    // Update the realtime status of the AWS api for dashboard display.
    // Update Data every 5 minutes
    setInterval(getData(), 60 * 1000);
}


/* Setup env before starting update loop */

// Main entry point; Collect data schema, and initial outage data
function setup(schema, currentData) {
    fetch("data/statusData.json")
        .then(function (response) {
            //Take HTTP response and parse JSON
            response.json();
        })
        .then(function (data) {
            //Take JSON and store it in memory
            schema = data;
        })
        .then(function () {
            //Collect initial AWS status and store in memory.
            currentData = getData();
        })
        .then(main());
}

setup(schema, currentData);