---
layout: default
title: EPANET Interface
stylesheets:
  - href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
    integrity: "" 
    crossorigin: "anonymous"
  - href: "epanet-interface/css/epanet-interface.css"
javascript: 
  - src: "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.8.0/proj4.js"
  - src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity: ""
    crossorigin: "anonymous"
  - src: "epanet-interface/js/epanet-interface.js"
---

<!-- Popup window -->
<div id="message-window">
  <h3 id="message-text"></h3>
  <button id="message-ok">OK</button>
</div>

<div id="popup">
  <h3>CRS Details</h3>
  <label for="epsg">EPSG Code:</label>
  <input type="text" id="epsg" placeholder="Enter EPSG Code to Search for the Proj String">
  <button id="get-proj-btn">Get Proj String</button>

  <label for="proj">Proj String:</label>
  <input type="text" id="proj" placeholder="Or Enter the Proj String">

  <button id="popup-ok">OK</button>
</div>

<div id="interface-mainscreen">
    <div id="interface-navbar">
      <button id="load-file-btn">Load File</button>
      <input type="file" id="file-input" accept=".inp" style="display: none;">
      <button id="crs-btn">CRS</button>
    </div>
    <div id="map">
    </div>
</div>


