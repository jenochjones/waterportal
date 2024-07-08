let groundX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let groundY = [5, 3, 2, 2, 2, 2, 2, 2, 3, 5];
let WSEX = [1, 10];
let WSEY = [4, 4];
let unit = 1.49;

let changeUnits = function () {
    let elem = document.getElementById('unit').getAttribute('data-unit');
    if ($(elem).attr('data-unit') == 'metric') {
        unit = 1.49;
        $(elem).attr('data-unit', 'english');
    } else {
        unit = 1;
        $(elem).attr('data-unit', 'metric');
    }
}

let getManningsValues = function () {
    let coords = makePolygon();
    let area = calculateArea(coords[0], coords[1]);
    let perimeter = calculatePerimeter(coords[0], coords[1]);
    let hydraulicRadius = calculateHydraulicRadius(area, perimeter, coords[2]);
    let manningsN = $('#mannings-n-value').val();
    let flow = $('#mannings-flow-value').val();
    let slope = $('#mannings-slope-value').val();
    return coords, area, perimeter, hydraulicRadius, manningsN, flow, slope;
}

let makeGraph = function () {
    let data = {
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

    let data2 = {
        x: WSEX,
        y: WSEY,
        name: 'WSE',
        fillcolor: 'rgba(0, 0, 225, 0.2)',
        marker: {
            color: 'rgba(0, 0, 225, 1)',
          },
        fill: 'tozeroy',
    };

    Plotly.newPlot('mannings-graph', [data, data2]);
}

let updateGround = function () {
    let values = document.getElementById('mannings-x-y-coords').value;
    let xyPairs = values.split('\n');
    let xlist = [];
    let ylist = [];
    for (let i = 0; i < xyPairs.length; i++) {
        let xy = xyPairs[i].split(',');
        if (Number.isNaN(parseInt(xy[0])) == false) {
            xlist.push(parseInt(xy[0]));
        }
        if (Number.isNaN(parseInt(xy[1])) == false) {
            ylist.push(parseInt(xy[1]));
        }
    }
    groundX = xlist;
    groundY = ylist;
    WSEX = [xlist[0], xlist[xlist.length - 1]];
    WSEY = [parseInt($('#mannings-wse').val()), parseInt($('#mannings-wse').val())];
    makeGraph();
}

let setSliderValue = function (elem) {
    let id = $(elem).attr('id');
    let value = $(elem).val();
    let solveFor = $('#solve-for').val();
    $('#' + id + '-value').empty().val(value);
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
    let id = $(elem).attr('id').slice(0,-6);
    let value = $(elem).val();
    $('#' + id).val(value).change();
    console.log(id)
}

let setWSE = function () {
    let elem = document.getElementById('mannings-wse').value;
    setSliderValue(elem);
    WSEY = [parseInt(elem), parseInt(elem)];
    makeGraph();
}

let makePolygon = function () {
    let newPointOneXCoord = false;
    let newPointTwoXCoord = false;
    for (let i = 0; i < groundX.length; i++) {
        let x1 = groundX[i];
        let x3 = groundX[i + 1];
        let y1 = groundY[i];
        let y2 = WSEY[1];
        let y3 = groundY[i + 1];
        if (groundY[0] > WSEY[0] && groundY[groundY[groundY.length]]) {
            newPointOneXCoord = WSEY[0];
            newPointTwoXCoord = WSEY[1];
        } else if (WSEY[0] < Math.min(...groundY) && WSEY[1] < Math.min(...groundY)) {
            newPointOneXCoord = false;
            newPointOneXCoord = false;
        } else if (groundY[i] > WSEY[0] && groundY[i + 1] < WSEY[0]) {
            var positionToInsertOne = i + 1;
            newPointOneXCoord = x1 + (y1 - y2) * (x3 - x1) / (y1 - y3);
        } else if (groundY[i] < WSEY[0] && groundY[i + 1] > WSEY[0]) {
            var positionToInsertTwo = i;
            newPointTwoXCoord = x1 + (y1 - y2) * (x3 - x1) / (y1 - y3);
        }
    }
    debugger
    let polygonY = groundY;
    let polygonX = groundX;
    polygonY.splice(0, positionToInsertOne);
    polygonY.splice(positionToInsertTwo, groundY.length - positionToInsertTwo);
    polygonY.splice(0, 0, WSEY[0]);
    polygonY.splice(groundY.length, 0, WSEY[1]);
    polygonX.splice(0, positionToInsertOne);
    polygonX.splice(positionToInsertTwo, groundX.length - positionToInsertTwo);
    polygonX.splice(0, 0, newPointOneXCoord);
    polygonX.splice(groundX.length, 0, newPointTwoXCoord);
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
    while (trialFlow < flow - 0.001 && trialFlow > flow + 0.001) {
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
    /*document.getElementById('mannings-wse-value').addEventListener('change', );
    document.getElementById('mannings-flow-value').addEventListener('change', );
    document.getElementById('mannings-n-value').addEventListener('change', );
    document.getElementById('mannings-slope-value').addEventListener('change', );*/

    makeGraph();
}

export {
    setUpMannings
}