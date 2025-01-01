---
layout: default
title: Mannings Calculator
stylesheets:
  - href: "mannings/css/mannings.css"
javascript: 
  - src: "mannings/js/mannings.js"
  - src: "https://cdn.plot.ly/plotly-latest.min.js"
---

<div style="width: 100%; height: 100%; display: flex; flex-direction: row;">
    <div id="mannings-equation">
        <div id="mannings-values">
                <div class="value-slider-box">
                <h2>Solve For</h2>
                <div id="solve-for-container">
                    <select id="solve-for">
                        <option>Water Depth</option>
                        <option>Flow</option>
                        <option>Manning's N</option>
                        <option>Channel Slope</option>
                    </select>
                    <select id="unit" data-unit="english">
                        <option>US Standard</option>
                        <option>Metric</option>
                    </select>
                </div>
            </div>
            <div class="value-slider-box">
                <h2 id="water-depth">Water Depth (ft)</h2>
                <div class="slider-box">
                    <input type="range" value="4" step="0.01" class="slider" id="mannings-wse" disabled>
                    <input type="number" id="mannings-wse-value" class="slider-value" value="1.5" disabled>
                </div>
            </div>
            <div class="value-slider-box">
                <h2 id="flow">Flow (cfs)</h2>
                <div class="slider-box">
                    <input type="range" value="90" step="0.01" class="slider" id="mannings-flow">
                    <input type="number" id="mannings-flow-value" class="slider-value" value="90">
                </div>
            </div>
            <div class="value-slider-box">
                <h2 id="mannings">Manning's N</h2>
                <div class="slider-box">
                    <input type="range" value="0.035" step="0.0001" min="0" max="1" class="slider" id="mannings-n">
                    <input type="number" id="mannings-n-value" class="slider-value" value="0.035" step="0.001" min="0" max="1" >
                </div>
            </div>
            <div class="value-slider-box">
                <h2 id="channel-slope">Channel Slope (ft/ft)</h2>
                <div class="slider-box">
                    <input type="range" value="0.018989987" step="0.0001" min="0" max="1" class="slider" id="mannings-slope">
                    <input type="number" id="mannings-slope-value" class="slider-value" value="0.018989987" step="0.001" min="0" max="1" >
                </div>
            </div>
        </div>
        <div id="mannings-graph-box">
            <div id="mannings-graph"></div>
            <div id="mannings-graph-values">
                <textarea id="mannings-x-y-coords" type="text">1,5&#10;2,3&#10;3,2&#10;4,2&#10;5,2&#10;6,2&#10;7,2&#10;8,2&#10;9,3&#10;10,5</textarea>
                <button id="mannings-plot-button">PLOT</button>
            </div>
        </div>
    </div>
</div>