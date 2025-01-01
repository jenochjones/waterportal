

let createMap = function () {
    // Create the map and set its initial view
    const map = L.map('map').setView([37.7749, -122.4194], 10); // Centered on San Francisco, zoom level 10

    // Define the basemaps
    const basemaps = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),

    'Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
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

    // Add the default basemap to the map
    basemaps['OpenStreetMap'].addTo(map);

    // Add a layer control to the map
    L.control.layers(basemaps).addTo(map);
}

let setInterfaceEventListeners = function () {
    console.log('loaded');
    createMap();
}

export {
    setInterfaceEventListeners
};