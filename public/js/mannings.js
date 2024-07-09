let groundX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let groundY = [5, 3, 2, 2, 2, 2, 2, 2, 3, 5];
let WSE = 2;
let unit = 1.49;

let changeUnits = function () {
    let elem = document.getElementById('unit');
    if (elem.getAttribute('data-unit') == 'metric') {
        unit = 1.49;
        elem.setAttribute('data-unit', 'english');
    } else {
        unit = 1;
        elem.setAttribute('data-unit', 'metric');
    }
}

let getManningsValues = function () {
    let coords = makePolygon();
    let area = calculateArea(coords[0], coords[1]);
    let perimeter = calculatePerimeter(coords[0], coords[1]);
    let hydraulicRadius = calculateHydraulicRadius(area, perimeter, coords[2]);
    let manningsN = document.getElementById('mannings-n-value').value;
    let flow = document.getElementById('mannings-flow-value').value;
    let slope = document.getElementById('mannings-slope-value').value;
    return [coords, area, perimeter, hydraulicRadius, manningsN, flow, slope];
}

let interpolateX = function (xValues, yValues, newY, depth) {
    // Ensure there are at least two points to interpolate
    if (xValues.length < 2 || yValues.length < 2 || xValues.length !== yValues.length) {
        throw new Error("Insufficient data points or mismatched array lengths.");
    }

    let interplatedList = [];

    // Find the segment where newY falls
    for (let i = 0; i < yValues.length - 1; i++) {
        if (((newY >= yValues[i] && newY <= yValues[i + 1]) && ) || (newY <= yValues[i] && newY >= yValues[i + 1])) {
            // Linear interpolation formula:
            // x = x0 + (y - y0) * (x1 - x0) / (y1 - y0)
            let x0 = xValues[i];
            let x1 = xValues[i + 1];
            let y0 = yValues[i];
            let y1 = yValues[i + 1];

            let interpolatedX = x0 + (newY - y0) * (x1 - x0) / (y1 - y0);

            interplatedList.push(interpolatedX);
        }
    }
    return interplatedList;
    // If newY is outside the range of provided y values, throw an error or handle as needed
    throw new Error("newY value is outside the range of the provided y values.");
}

let makeGraph = function (depth) {
    // Calculate the lowest y elevation of the Ground series
    let minY = Math.min(...groundY);
    let waterY = minY + depth;
    debugger
    let xinterp = interpolateX(groundX, groundY, waterY);
    
    // Create the WSE series as a straight line at a y elevation "depth" above the lowest y elevation of the Ground series
    let WSEX = [...xinterp,...groundX].sort((a, b) => a - b);
    let WSEY = new Array(WSEX.length).fill(waterY);

    // Define the Ground data series
    let groundData = {
        x: groundX,
        y: groundY,
        fill: 'tozeroy',
        name: 'Ground',
        fillcolor: 'rgba(159, 86, 1, 1)',
        marker: {
            color: 'rgba(159, 50, 25, 1)',
        },
        type: 'scatter',
    };

    // Define the WSE data series
    let WSEData = {
        x: WSEX,
        y: WSEY,
        name: 'WSE',
        fill: 'tonexty',
        fillcolor: 'rgba(0, 0, 225, 0.2)',
        marker: {
            color: 'rgba(0, 0, 225, 1)',
        },
        type: 'scatter',
    };

    // Plot the graph
    Plotly.newPlot('mannings-graph', [groundData, WSEData]);
}

let updateGround = function () {
    let values = document.getElementById('mannings-x-y-coords').value;
    let xyPairs = values.split('\n');
    let xlist = [];
    let ylist = [];
    for (let i = 0; i < xyPairs.length; i++) {
        let xy = xyPairs[i].split(',');
        if (!Number.isNaN(parseInt(xy[0]))) {
            xlist.push(parseInt(xy[0]));
        }
        if (!Number.isNaN(parseInt(xy[1]))) {
            ylist.push(parseInt(xy[1]));
        }
    }
    groundX = xlist;
    groundY = ylist;
    WSEX = [xlist[0], xlist[xlist.length - 1]];
    WSEY = [parseInt(document.getElementById('mannings-wse').value), parseInt(document.getElementById('mannings-wse').value)];
    makeGraph();
}

let setSliderValue = function (elem) {
    let id = elem.id;
    let value = elem.value;
    let solveFor = document.getElementById('solve-for').value;
    document.getElementById(id + '-value').value = value;
    let manningsValues = getManningsValues();
    if (solveFor == 'Water Surface Elevation') {
        solveForWSE(manningsValues[5], manningsValues[4], manningsValues[6]);
        makeGraph();
        console.log(WSEY)
    } else if (solveFor == 'Flow') {
        let flow = solveForFlow(manningsValues[4], manningsValues[1], manningsValues[3], manningsValues[6]);
        console.log(flow)
    } else if (solveFor == 'Manning\'s N') {
        let manningsN = solveForManningsN(manningsValues[5], manningsValues[1], manningsValues[3], manningsValues[6]);
        console.log(manningsN)
    } else if (solveFor == 'Channel Slope') {
        let slope = solveForSlope(manningsValues[4], manningsValues[5], manningsValues[1], manningsValues[3]);
        console.log(slope)
    }
}

let setSlider = function (elem) {
    let id = elem.id.slice(0, -6);
    let value = elem.value;
    document.getElementById(id).value = value;
    document.getElementById(id).dispatchEvent(new Event('change'));
    console.log(id)
}

let setWSE = function () {
    let elem = document.getElementById('mannings-wse').value;
    setSliderValue(document.getElementById('mannings-wse'));
    WSEY = [parseInt(elem), parseInt(elem)];
    makeGraph();
}

let makePolygon = function () {
    let newPointOneXCoord = false;
    let newPointTwoXCoord = false;
    let positionToInsertOne = 0;
    let positionToInsertTwo = 0;

    for (let i = 0; i < groundX.length - 1; i++) {
        let x1 = groundX[i];
        let x3 = groundX[i + 1];
        let y1 = groundY[i];
        let y2 = WSEY[1];
        let y3 = groundY[i + 1];
        if (groundY[0] > WSEY[0] && groundY[groundY.length - 1] < WSEY[1]) {
            newPointOneXCoord = WSEY[0];
            newPointTwoXCoord = WSEY[1];
        } else if (WSEY[0] < Math.min(...groundY) && WSEY[1] < Math.min(...groundY)) {
            newPointOneXCoord = false;
            newPointTwoXCoord = false;
        } else if (groundY[i] > WSEY[0] && groundY[i + 1] < WSEY[0]) {
            positionToInsertOne = i + 1;
            newPointOneXCoord = x1 + (y1 - y2) * (x3 - x1) / (y1 - y3);
        } else if (groundY[i] < WSEY[0] && groundY[i + 1] > WSEY[0]) {
            positionToInsertTwo = i;
            newPointTwoXCoord = x1 + (y1 - y2) * (x3 - x1) / (y1 - y3);
        }
    }

    let polygonY = groundY.slice();
    let polygonX = groundX.slice();

    if (newPointOneXCoord !== false && newPointTwoXCoord !== false) {
        polygonY.splice(positionToInsertOne, 0, WSEY[0]);
        polygonY.splice(positionToInsertTwo + 1, 0, WSEY[1]);
        polygonX.splice(positionToInsertOne, 0, newPointOneXCoord);
        polygonX.splice(positionToInsertTwo + 1, 0, newPointTwoXCoord);
    }

    let waterSurfaceWidth = newPointTwoXCoord - newPointOneXCoord;
    return [polygonX, polygonY, waterSurfaceWidth];
}

let calculateArea = function (xCoords, yCoords) {
    let numerator = 0;
    for (let i = 0; i < xCoords.length - 1; i++) {
        numerator += xCoords[i] * yCoords[i + 1] - yCoords[i] * xCoords[i + 1];
    }
    numerator += xCoords[xCoords.length - 1] * yCoords[0] - yCoords[yCoords.length - 1] * xCoords[0];
    let area = numerator / 2;
    return area;
}

let calculatePerimeter = function (xCoords, yCoords) {
    let perimeter = 0;
    for (let i = 0; i < xCoords.length - 1; i++) {
        perimeter += Math.sqrt(Math.pow(yCoords[i + 1] - yCoords[i], 2) + Math.pow(xCoords[i + 1] - xCoords[i], 2));
    }
    perimeter += Math.sqrt(Math.pow(yCoords[0] - yCoords[yCoords.length - 1], 2) + Math.pow(xCoords[0] - xCoords[xCoords.length - 1], 2));
    return perimeter;
}

let calculateHydraulicRadius = function (area, perimeter, waterWidth) {
    let wettedPerimeter = perimeter - waterWidth;
    let hydraulicRadius = area / wettedPerimeter;
    return hydraulicRadius;
}

let solveForFlow = function (manningsN, area, hydraulicRadius, slope) {
    let flow = (unit / manningsN) * area * hydraulicRadius * Math.sqrt(slope);
    return flow;
}

let solveForManningsN = function (flow, area, hydraulicRadius, slope) {
    let manningsN = (unit / flow) * area * hydraulicRadius * Math.sqrt(slope);
    return manningsN;
}

let solveForWSE = function (flow, manningsN, slope) {
    WSEY = [10, 10];
    let coords = makePolygon();
    let area = calculateArea(coords[0], coords[1]);
    let perimeter = calculatePerimeter(coords[0], coords[1]);
    let hydraulicRadius = calculateHydraulicRadius(area, perimeter, coords[2]);
    let trialFlow = (unit / manningsN) * area * hydraulicRadius * Math.sqrt(slope);
    while (trialFlow < flow - 0.001 || trialFlow > flow + 0.001) {
        WSEY[0] += WSEY[0] * trialFlow / flow;
        WSEY[1] += WSEY[1] * trialFlow / flow;
        coords = makePolygon();
        area = calculateArea(coords[0], coords[1]);
        perimeter = calculatePerimeter(coords[0], coords[1]);
        hydraulicRadius = calculateHydraulicRadius(area, perimeter, coords[2]);
        trialFlow = (unit / manningsN) * area * hydraulicRadius * Math.sqrt(slope);
    }
}

let solveForSlope = function (manningsN, flow, area, hydraulicRadius) {
    let slope = Math.pow(flow / ((unit / manningsN) * area * hydraulicRadius), 2);
    return slope;
}

let setUpMannings = function () {
    document.getElementById('unit').addEventListener('change', changeUnits);
    document.getElementById('mannings-wse').addEventListener('change', setWSE);
    document.getElementById('mannings-plot-button').addEventListener('click', updateGround);

    makeGraph(1.5);
}

export {
    setUpMannings
}
