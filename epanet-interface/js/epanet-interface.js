let map;
let inpString = '';
let markerGeojson = '';
let pipeGeojson = '';
let markerLayer;
let pipeLayer;

let pipeStyle = {
    "color": "green",
    "weight": 2,
    "opacity": 0.65
};

let markerStyle = {
    radius: 4,
    fillColor: "blue",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function ready(readyListener) {
    if (document.readyState !== "loading") {
        readyListener();
    } else {
        document.addEventListener("DOMContentLoaded", readyListener);
    }
}

ready(function () {
    console.log('Ready');
    setInterfaceEventListeners();
});


let handleFile = function () {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const contents = event.target.result;
                resolve(contents);
            };

            reader.onerror = function (error) {
                reject(error);
            };

            reader.readAsText(file);
        } else {
            reject(new Error("No file selected."));
        }
    });
};

let setCRS = async function () {
    let code = document.getElementById('epsg').value;

    try {
        if (code.length > 0) {
            const response = await fetch(`https://epsg.io/${code}.proj4`);
            const projString = await response.text();
            document.getElementById('proj').value = projString;
        }
    } catch (error) {
        console.error("Error fetching PROJ string:", error);
        preElement.textContent = "An error occurred while fetching the PROJ string.";
    }
};


let createMap = function () {
    map = L.map('map').setView([40.7608, -111.8910], 10); // Centered on Utah, zoom level 10

    const basemaps = {
        'Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '© Google',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }),
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }),
        'Topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap contributors'
        }),
        'Terrain': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
            attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
        }),
        'Dark Mode': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CARTO contributors'
        })
    };

    basemaps['Satellite'].addTo(map);
    L.control.layers(basemaps).addTo(map);

    // GeoJSON layers
    markerLayer = L.geoJSON().addTo(map);
    pipeLayer = L.geoJSON().addTo(map);
};

let geojsonFromInp = function (modelText) {
    let targetCRS = document.getElementById('proj').value;
    console.log(`CRS: ${targetCRS}`);

    markerGeojson = {
        type: "FeatureCollection",
        features: []
    };
    pipeGeojson = {
        type: "FeatureCollection",
        features: []
    };

    let juctionSection = modelText.match(/\[JUNCTIONS\][\s\S]*?(?=\[|$)/);
    let coordinatesSection = modelText.match(/\[COORDINATES\][\s\S]*?(?=\[|$)/);
    let pipeSection = modelText.match(/\[PIPES\][\s\S]*?(?=\[|$)/);
    let vertSection = modelText.match(/\[VERTICES\][\s\S]*?(?=\[|$)/);

    let pipeLines = pipeSection[0].split('\n').slice(1).filter(line => line.trim() !== '');
    let vertLines = vertSection[0].split('\n').slice(1).filter(line => line.trim() !== '');
    let coordinatesLines = coordinatesSection[0].split('\n').slice(1).filter(line => line.trim() !== '');
    let junctionLines = juctionSection[0].split('\n').slice(1).filter(line => line.trim() !== '');

    // Create Pipes Geojson
    pipeLines.forEach(line => {
        let xList = [];
        let yList = [];
        let pipeParts = line.trim().split(/\t+/);
        let matchingLineStart = coordinatesLines.find(coordLine => coordLine.trim().split(/\s+/)[0] === pipeParts[1]);
        let matchingLineEnd = coordinatesLines.find(coordLine => coordLine.trim().split(/\s+/)[0] === pipeParts[2]);

        let vertParts = matchingLineStart.trim().split(/\s+/);
        xList.push(vertParts[1]);
        yList.push(vertParts[2]);

        let matchingVertLines = vertLines.filter(vertLine => vertLine.trim().split(/\s+/)[0] === pipeParts[0]);

        matchingVertLines.forEach(vertLine => {
            vertParts = vertLine.trim().split(/\t+/);
            xList.push(parseFloat(vertParts[1]));
            yList.push(parseFloat(vertParts[2]));
        });

        vertParts = matchingLineEnd.trim().split(/\s+/);
        xList.push(vertParts[1]);
        yList.push(vertParts[2]);

        let transformedCoordinates = xList.map((x, index) => {
            let y = yList[index];
            return proj4(
                targetCRS,
                '+proj=longlat +datum=WGS84 +no_defs +type=crs +nadgrids=@null +wktext +no_defs +type=crs',
                [parseFloat(x), parseFloat(y)]
            );
        });

        const latLngs = transformedCoordinates.map(coord => [coord[0], coord[1]]);

        pipeGeojson.features.push({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: latLngs// GeoJSON requires [lon, lat]
            },
            properties: { 
                id: pipeParts[0],
                startJunct: pipeParts[1],
                endJunct: pipeParts[2],
                length: pipeParts[3],
                diameter: pipeParts[4],
                roughness: 0,
                coordinates: latLngs,
                

            }
        });
    });

    // Create Junction Geojson
    junctionLines.forEach(line => {
        let junctionParts = line.trim().split(/\t+/);
        let matchingLine = coordinatesLines.find(coordLine => coordLine.trim().split(/\s+/)[0] === junctionParts[0]);

        if (matchingLine) {
            let coordParts = matchingLine.trim().split(/\s+/);
            if (coordParts.length >= 3) {
                let x = parseFloat(coordParts[1]);
                let y = parseFloat(coordParts[2]);

                let transformedPoint = proj4(targetCRS, '+proj=longlat +datum=WGS84 +no_defs +type=crs +nadgrids=@null +wktext +no_defs +type=crs', [x, y]);
                markerGeojson.features.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [transformedPoint[0], transformedPoint[1]] // [lon, lat]
                    },
                    properties: {
                        id: junctionParts[0],
                        elevation: junctionParts[1]
                    }
                });
            }
        }
    });

    return { pipeGeojson, markerGeojson };

};


let drawModel = function () {
    markerLayer.clearLayers();
    pipeLayer.clearLayers();

    let { pipeGeojson, markerGeojson } = geojsonFromInp(inpString);
    
    L.geoJSON(pipeGeojson, {
        style: pipeStyle,
        onEachFeature: function (feature, layer) {
            // Add a popup displaying the coordinates
            if (feature.properties && feature.properties.coordinates) {
                const coordList = feature.properties.coordinates
                    .map(coord => `[${coord[1]}, ${coord[0]}]`) // Switch to lat-lon format
                    .join("<br>"); // Format the coordinates for the popup
                layer.bindPopup(`Coordinates:<br>${coordList}`);
            }
        }
    }).addTo(pipeLayer);
    
    L.geoJSON(markerGeojson, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerStyle);
        }
    }).addTo(markerLayer);
}


let setInterfaceEventListeners = function () {
    console.log('loaded');

    document.getElementById('load-file-btn').addEventListener('click', () => {
        if (document.getElementById('proj').value.length > 0) {
            document.getElementById('file-input').click();
        } else {
            document.getElementById('message-text').innerText = 'Please specify a coordinate system for your project.';
            document.getElementById('message-window').style.display = 'flex';
        }
    });

    document.getElementById('file-input').addEventListener('change', async () => {
        inpString = await handleFile();
        drawModel();
        map.fitBounds(markerLayer.getBounds());
    });

    document.getElementById('crs-btn').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'flex';
    });

    document.getElementById('popup-ok').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
    });

    document.getElementById('message-ok').addEventListener('click', () => {
        document.getElementById('message-window').style.display = 'none';
    });

    document.getElementById('get-proj-btn').addEventListener('click', () => {
        setCRS();
    });

    createMap();
};



