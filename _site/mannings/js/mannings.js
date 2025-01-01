function ready(readyListener) {
    if (document.readyState !== "loading") {
        readyListener();
    } else {
        document.addEventListener("DOMContentLoaded", readyListener);
    }
}

ready(function () {
    console.log('Ready');
    setUpMannings();
});


let globalGroundX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let globalGroundY = [5, 3, 2, 2, 2, 2, 2, 2, 3, 5];;
let globalWaterX = [];
let globalWaterY = [];

let unit = 1.49;

let changeUnits = function () {
    let elem = document.getElementById('unit');
    if (elem.getAttribute('data-unit') == 'metric') {
        unit = 1.49;
        elem.setAttribute('data-unit', 'english');
        document.getElementById('water-depth').innerHTML = 'Water Depth (ft)';
        document.getElementById('flow').innerHTML = 'Flow (cfs)';
        document.getElementById('channel-slope').innerHTML = 'Slope (ft/ft)';
    } else {
        unit = 1;
        elem.setAttribute('data-unit', 'metric');
        document.getElementById('water-depth').innerHTML = 'Water Depth (m)';
        document.getElementById('flow').innerHTML = 'Flow (cms)';
        document.getElementById('channel-slope').innerHTML = 'Slope (m/m)';
    }
}

let interpolateX = function (xValues, yValues, newY) {
    // Ensure there are at least two points to interpolate
    if (xValues.length < 2 || yValues.length < 2 || xValues.length !== yValues.length) {
        throw new Error("Insufficient data points or mismatched array lengths.");
    }

    let interplatedList = [];

    // Find the segment where newY falls
    for (let i = 0; i <= yValues.length - 1; i++) {
        if ((i === 0 || i === yValues.length - 1) && newY > yValues[i]) {
            if (i === 0) {
                interplatedList.push(xValues[i] - 0.001);
            } else {
                interplatedList.push(xValues[i] + 0.001);
            }
                 
        } else if ((newY > yValues[i] && newY < yValues[i + 1]) || ((newY < yValues[i] && newY > yValues[i + 1]))) {
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

let updateCoords = function (depth, groundX, groundY) {
    // Calculate the lowest and highest y elevation of the Ground series
    let minY = Math.min(...groundY);
    let waterY = parseFloat(minY) + parseFloat(depth);

    let xinterp = interpolateX(groundX, groundY, waterY);
    
    // Create the WSE series as a straight line at a y elevation "depth" above the lowest y elevation of the Ground series
    let WSEX = [...xinterp, ...groundX].sort((a, b) => a - b);
    let WSEY = new Array(WSEX.length).fill(waterY);

    let groundWater = new Array(xinterp.length).fill(waterY);
    groundX = [...xinterp, ...groundX];
    groundY = [...groundWater, ...groundY];
    let pairedArray = groundX.map((item, index) => [item, groundY[index]]);

    // Sort the pairs based on the first elements (elements from array 1)
    pairedArray.sort((a, b) => a[0] - b[0]);

    // Separate the pairs back into two arrays
    groundX = pairedArray.map(pair => pair[0]);
    groundY = pairedArray.map(pair => pair[1]);

    let waterIndex = 0;

    for (let i = 0; i < groundX.length; i++) {
        if (WSEY[waterIndex] < groundY[i]) {
            WSEY.splice(waterIndex, 1);
            WSEX.splice(waterIndex, 1);
        } else {
            waterIndex += 1;
        }
    }
    return [groundX, groundY, WSEX, WSEY];
}

let makeGraph = function (depth, groundXCoords, groundYCoords) {
    console.log(depth);
    let groundX;
    let groundY;
    let WSEX;
    let WSEY;

    let minY = Math.min(...groundYCoords);
    let maxY = Math.max(...groundYCoords, depth);

    [groundX, groundY, WSEX, WSEY] = updateCoords(depth, groundXCoords, groundYCoords);

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

    // Define the layout with updated extents
    let layout = {
        xaxis: {
            range: [Math.min(...groundX), Math.max(...groundX)]
        },
        yaxis: {
            range: [minY - 1, maxY + 1]
        }
    };

    // Plot the graph
    Plotly.newPlot('mannings-graph', [groundData, WSEData], layout);
    globalWaterX = WSEX;
    globalWaterY = WSEY;
}


let updateGround = function () {
    let values = document.getElementById('mannings-x-y-coords').value;
    let xyPairs = values.split('\n');
    let xlist = [];
    let ylist = [];
    for (let i = 0; i < xyPairs.length; i++) {
        let xy = xyPairs[i].split(',');
        if (!Number.isNaN(parseFloat(xy[0]))) {
            xlist.push(parseFloat(xy[0]));
        }
        if (!Number.isNaN(parseFloat(xy[1]))) {
            ylist.push(parseFloat(xy[1]));
        }
    }
    let depth = parseInt(document.getElementById('mannings-wse').value);
    globalGroundX = xlist;
    globalGroundY = ylist;

    solve();
}

let makePolygon = function (groundX, groundY, waterX) {
    let xCoords = [];
    let yCoords = [];

    for (let i = 0; i < groundX.length - 1; i++) {
        if (waterX.includes(groundX[i])) {
            xCoords.push(groundX[i]);
            yCoords.push(groundY[i]);
        }
    }
    return [xCoords, yCoords];
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
    return perimeter;
}

let calculateHydraulicRadius = function (area, perimeter) {
    let hydraulicRadius = area / perimeter;
    return hydraulicRadius;
}

let solveForFlow = function (manningsN, area, hydraulicRadius, slope) {
    let flow = (unit / manningsN) * area * Math.pow(hydraulicRadius, 2/3) * Math.sqrt(slope);
    return flow;
}

let solveForManningsN = function (flow, area, hydraulicRadius, slope) {
    let manningsN = (unit / flow) * area * Math.pow(hydraulicRadius, 2/3) * Math.sqrt(slope);
    return manningsN;
}

let solveForSlope = function (manningsN, flow, area, hydraulicRadius) {
    let slope = Math.pow(flow / ((unit / manningsN) * area * Math.pow(hydraulicRadius, 2/3)), 2);
    return slope;
}

function solveForWSE(flow, manningsN, slope) {
    let area;
    let perimeter;
    let hydRad;
    let coords;
    let groundX;
    let groundY;
    let WSEX;
    let WSEY;
    let depth = 1;
    let trialFlow = 1000;
    let upperBounds = 1000;
    let lowerBounds = 0;

    while (Math.abs(trialFlow - flow) > 0.001){
        console.log(trialFlow - flow);
        [groundX, groundY, WSEX, WSEY] = updateCoords(depth, globalGroundX, globalGroundY);
        coords = makePolygon(groundX, groundY, WSEX);
        area = calculateArea(coords[0], coords[1]);
        perimeter = calculatePerimeter(coords[0], coords[1]);
        hydRad = calculateHydraulicRadius(area, perimeter);
    
        trialFlow = solveForFlow(manningsN, area, hydRad, slope);

        if (trialFlow > flow) {
            upperBounds = depth;
        } else {
            lowerBounds = depth;
        }
        depth = (upperBounds + lowerBounds) / 2
    }
    return depth;
}

let disableSlider = function () {
    document.getElementById("mannings-wse").disabled = false;
    document.getElementById("mannings-wse-value").disabled = false;
    document.getElementById("mannings-flow").disabled = false;
    document.getElementById("mannings-flow-value").disabled = false;
    document.getElementById("mannings-n").disabled = false;
    document.getElementById("mannings-n-value").disabled = false;
    document.getElementById("mannings-slope").disabled = false;
    document.getElementById("mannings-slope-value").disabled = false;

    let solveFor = document.getElementById('solve-for').value;
    if (solveFor === 'Water Depth') {
        document.getElementById("mannings-wse").disabled = true;
        document.getElementById("mannings-wse-value").disabled = true;
    } else if (solveFor === 'Flow') {
        document.getElementById("mannings-flow").disabled = true;
        document.getElementById("mannings-flow-value").disabled = true;
    } else if (solveFor === 'Channel Slope') {
        document.getElementById("mannings-slope").disabled = true;
        document.getElementById("mannings-slope-value").disabled = true;
    } else {
        document.getElementById("mannings-n").disabled = true;
        document.getElementById("mannings-n-value").disabled = true;
    }
}

let solve = function () {
    let solved;
    let groundX;
    let groundY;
    let WSEX;
    let WSEY;
    let coords;

    let depth = parseFloat(document.getElementById('mannings-wse-value').value);
    let flow = parseFloat(document.getElementById('mannings-flow-value').value);
    let n = parseFloat(document.getElementById('mannings-n-value').value);
    let slope = parseFloat(document.getElementById('mannings-slope-value').value);
    [groundX, groundY, WSEX, WSEY] = updateCoords(depth, globalGroundX, globalGroundY);
    coords = makePolygon(groundX, groundY, WSEX);

    let solveFor = document.getElementById('solve-for').value;
    if (solveFor === 'Water Depth') {
        solved = solveForWSE(flow, n, slope);
        document.getElementById("mannings-wse").value = solved;
        document.getElementById("mannings-wse-value").value = solved;
        depth = solved;
    } else {
        let area = calculateArea(coords[0], coords[1]);
        let perimeter = calculatePerimeter(coords[0], coords[1]);
        let hydRad = calculateHydraulicRadius(area, perimeter);

        if (solveFor === 'Flow') {
            solved = solveForFlow(n, area, hydRad, slope);
            document.getElementById("mannings-flow").value = solved;
            document.getElementById("mannings-flow-value").value = solved;
        } else if (solveFor === 'Channel Slope') {
            solved = solveForSlope(n, flow, area, hydRad);
            document.getElementById("mannings-slope").value = solved;
            document.getElementById("mannings-slope-value").value = solved;
        } else {
            solved = solveForManningsN(flow, area, hydRad, slope);
            document.getElementById("mannings-n").value = solved;
            document.getElementById("mannings-n-value").value = solved;
        }
    } 
    makeGraph(depth, globalGroundX, globalGroundY);
}

let setUpMannings = function () {
    document.getElementById('unit').addEventListener('change', changeUnits);
    document.getElementById('mannings-plot-button').addEventListener('click', updateGround);

    document.getElementById('mannings-wse').addEventListener('change', solve);
    document.getElementById('mannings-wse-value').addEventListener('change', solve);
    document.getElementById('mannings-flow').addEventListener('change', solve);
    document.getElementById('mannings-flow-value').addEventListener('change', solve);
    document.getElementById('mannings-n').addEventListener('change', solve);
    document.getElementById('mannings-n-value').addEventListener('change', solve);
    document.getElementById('mannings-slope').addEventListener('change', solve);
    document.getElementById('mannings-slope-value').addEventListener('change', solve);

    document.getElementById('solve-for').addEventListener('change', disableSlider);

    document.getElementById("mannings-wse").addEventListener("input", function() {
        document.getElementById("mannings-wse-value").value = document.getElementById("mannings-wse").value;
    });
    document.getElementById("mannings-wse-value").addEventListener("input", function() {
        document.getElementById("mannings-wse").value = document.getElementById("mannings-wse-value").value;
    });
    document.getElementById("mannings-flow-value").addEventListener("input", function() {
        document.getElementById("mannings-flow").value = document.getElementById("mannings-flow-value").value;
    });
    document.getElementById("mannings-flow").addEventListener("input", function() {
        document.getElementById("mannings-flow-value").value = document.getElementById("mannings-flow").value;
    });
    document.getElementById("mannings-n-value").addEventListener("input", function() {
        document.getElementById("mannings-n").value = document.getElementById("mannings-n-value").value;
    });
    document.getElementById("mannings-n").addEventListener("input", function() {
        document.getElementById("mannings-n-value").value = document.getElementById("mannings-n").value;
    });
    document.getElementById("mannings-slope-value").addEventListener("input", function() {
        document.getElementById("mannings-slope").value = document.getElementById("mannings-slope-value").value;
    });
    document.getElementById("mannings-slope").addEventListener("input", function() {
        document.getElementById("mannings-slope-value").value = document.getElementById("mannings-slope").value;
    });

    makeGraph(1.5, globalGroundX, globalGroundY);
}
