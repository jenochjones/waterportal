---
layout: default
title: Normal Depth Calculator
stylesheets:
  - href: "normaldepth/css/normaldepth.css"
javascript: 
  - src: "normaldepth/js/normaldepth.js"
---

<!-- Normal and Critical Depth Finder TOOL -->
<div id="normal-critical-depth" class="tool">
    <div style="display: flex; flex-direction: row; width: 100%">
      <div style="display: flex; flex-direction: column;  width: 50%">
        <span>
          <label>Units</label>
            <select id="nc-units">
              <option>U.S. Customary</option>
              <option>Metric</option>
            </select>
        </span>
        <span>
          <label>Channel Type</label>
            <select id="nc-channel-type">
              <option>Trapezoidal</option>
              <option>Rectangular</option>
              <option>Triangular</option>
              <option>Circular</option>
              <!--<option>Cross Section</option>-->
            </select>
          </span>
        <span class="normaldepth-param">
          <label>Side Slope 1 (h:v)</label>
          <input id="side-slope1">
        </span>
        <span>
          <label>Side Slope 2 (h:v)</label>
          <input id="side-slope2">
        </span>
        <span>
          <label>Channel Width (ft)</label>
          <input id="channel-width">
        </span>
        <span>
          <label>Pipe Diameter (ft)</label>
          <input id="pipe-diameter" disabled>
        </span>
        <span>
          <label>Longitudinal Slope</label>
          <input id="longitudinal-slope">
        </span>
        <span>
          <label>Manning's Roughness</label>
          <input id="mannings-roughness">
        </span>
        <span>
          <input id="enter-flow-radio" type="radio" name="flow" style="float: left" checked>
          <label>Enter Flow (cfs)</label>
          <input id="enter-flow">
        </span>
        <span>
          <input id="enter-depth-radio" type="radio" name="flow" style="float: left">
          <label>Enter Depth (ft)</label>
          <input id="enter-depth" disabled>
        </span>
        <button id="normal-critical-result" style="width: 100%; margin: 1em 0">Get Results</button>
      </div>
      <div id="nc-result-div" style="width: 50%; height: 100%;">

      </div>
    </div>
  </div>
  <!------------------------------------------------------------->