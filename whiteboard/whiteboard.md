---
layout: default
title: Whiteboard
stylesheets:
  - href: "whiteboard/css/whiteboard.css"
javascript: 
  - src: "whiteboard/js/whiteboard.js"
---

<div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
    <div id="whiteboard-div">
        <canvas id="whiteboard-canvas"></canvas>
    </div>
    <div id="whiteboard-controls">
        <button id="whiteboard-draw" class="whiteboard-btn">Draw</button>
        <button id="whiteboard-erase" class="whiteboard-btn">Erase</button>
        <button id="whiteboard-clear" class="whiteboard-btn">Clear</button>
    </div>
</div>
