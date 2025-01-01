---
layout: default
title: EPANET Schematic
stylesheets:
  - href: "epanet-shematic/css/epanet-schematic.css"
javascript: 
  - src: "epanet-shematic/js/epanet-schematic.js"
---
 
 <div id="schematic-mainscreen">
    <div id="schematic-navbar">
        
        <label for="schematic-fileInput" class="schematic-nav-btn">Choose File</label>
        <input type="file" id="schematic-fileInput" accept=".inp">
        <button id="schematic-printBtn"  class="schematic-nav-btn">Print Schematic</button>
        <div class="schematic-nav-row">
            <label for="schematic-elev-int">Elevation Interval</label>
            <input id="schematic-elev-int" class="schematic-num-inp" type="number" value="50">
        </div>
        
    </div>
    <div id="schematic-content">
        <div id="schematic-white-rectangle">
            <div id="schematic-boarder">
                <div id="schematic-screen">
                    <div id="schematic-elevations"></div>
                    <div id="schematic-main-window"></div>
                </div>
                <div id="schematic-footer">
                    <div id="schematic-logo"></div>
                    <div id="schematic-left-titleblock" class="schematic-title">
                        <input id="schematic-left-top-title" class="schematic-title-text" type="text" value="TITLE 1">
                        <input id="schematic-left-bottom-title" class="schematic-title-text" type="text" value="TITLE 2">
                    </div>
                    <div id="schematic-right-titleblock" class="schematic-title">
                        <input id="schematic-right-top-title" class="schematic-title-text" type="text" value="TITLE 3">
                        <input id="schematic-lright-bottom-title" class="schematic-title-text" type="text" value="TITLE 4">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

