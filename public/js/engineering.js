var groundX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var groundY = [5, 3, 2, 2, 2, 2, 2, 2, 3, 5];
let WSEX = [1, 10];
let WSEY = [4, 4];
let unit = 1.49;

$( document ).ready(function() {
    makeGraph();
})

function changeUnits(elem) {
    if ($(elem).attr('data-unit') == 'metric') {
        unit = 1.49;
        $(elem).attr('data-unit', 'english');
    } else {
        unit = 1;
        $(elem).attr('data-unit', 'metric');
    }
}

function getManningsValues() {
    let coords = makePolygon();
    let area = calculateArea(coords[0], coords[1]);
    let perimeter = calculatePerimeter(coords[0], coords[1]);
    let hydraulicRadius = calculateHydraulicRadius(area, perimeter, coords[2]);
    let manningsN = $('#mannings-n-value').val();
    let flow = $('#mannings-flow-value').val();
    let slope = $('#mannings-slope-value').val();
    return coords, area, perimeter, hydraulicRadius, manningsN, flow, slope;
}

function makeGraph() {
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

function updateGround(values) {
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

function setSliderValue(elem) {
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

function setSlider(elem) {
    let id = $(elem).attr('id').slice(0,-6);
    let value = $(elem).val();
    $('#' + id).val(value).change();
    console.log(id)
}

function setWSE(elem) {
    setSliderValue(elem);
    WSEY = [parseInt($(elem).val()), parseInt($(elem).val())];
    makeGraph();
}

function makePolygon() {
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

function calculateArea(xCoords, yCoords) {
    let numerator = 0;
    for (let i = 0; i < xCoords.length - 1; i++) {
        numerator += xCoords[i] * yCoords[i + 1] - yCoords[i] * xCoords[i + 1];
    }
    numerator += xCoords[xCoords.length - 1] * yCoords[0] - yCoords[yCoords.length - 1] * xCoords[0];
    let area = numerator / 2;
    return area;
}

function calculatePerimeter(xCoords, yCoords) {
    let perimeter = 0;
    for (let i = 0; i < xCoords.length - 1; i++) {
        perimeter += Math.sqrt(Math.pow(yCoords[i + 1] - yCoords[i], 2) + Math.pow(xCoords[i + 1] - xCoords[i], 2));
    }
    perimeter += Math.sqrt(Math.pow(yCoords[0] - yCoords[yCoords.length - 1], 2) + Math.pow(xCoords[0] - xCoords[xCoords.length - 1], 2));
    return perimeter;
}

function calculateHydraulicRadius(area, perimeter, waterWidth) {
    let wettedPerimeter = perimeter - waterWidth;
    let hydraulicRadius = area / wettedPerimeter;
    return hydraulicRadius;
}

function solveForFlow(manningsN, area, hydraulicRadius, slope) {
    let flow = (unit / manningsN) * area * hydraulicRadius * Math.sqrt(slope);
    return flow;
}

function solveForManningsN(flow, area, hydraulicRadius, slope) {
    let manningsN = (unit / flow) * area * hydraulicRadius * Math.sqrt(slope);
    return manningsN;
}

function solveForWSE(flow, manningsN, slope) {
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

function solveForSlope(manningsN, flow, area, hydraulicRadius) {
    let slope = Math.pow(flow / ((unit / manningsN) * area * hydraulicRadius), 2);
    return slope;
}

/////////Normal Critical Depth 2////////////////////////////////////
/////////Linear Interpolation///////////////////////////////////////
function showLinearInterpolation() {
    $('.tool').each(function () {
        $(this).css('display', 'none');
    });
    $('#linear-interp').css('display', 'flex');
}

function linearInterpolation() {
    let x1 = parseFloat($('#x1-input').val());
    let x2 = parseFloat($('#x2-input').val());
    let x3 = parseFloat($('#x3-input').val());
    let y1 = parseFloat($('#y1-input').val());
    let y3 = parseFloat($('#y3-input').val());
    let y2 = y1 + ((x2 - x1) * (y3 - y1) / (x3 - x1));
    $('#interp-result').empty().append(Math.round(y2 * 1000) / 1000);
}

////////Normal and Critical Depth///////////////////////////////////

function showNormalAndCriticalDepth() {
    $('.tool').each(function () {
        $(this).css('display', 'none');
    });
    $('#normal-critical-depth').css('display', 'flex');
}

function setChannelType() {
    let sideSlope1 = true;
    let sideSlope2 = true;
    let channelWidth = true;
    let pipeDiameter = true;
    if ($('#nc-channel-type').val() == 'Trapezoidal') {
        sideSlope1 = false;
        sideSlope2 = false;
        channelWidth = false;
    } else if ($('#nc-channel-type').val() == 'Rectangular') {
        channelWidth = false;
    } else if ($('#nc-channel-type').val() == 'Triangular') {
        sideSlope1 = false;
        sideSlope2 = false;
    } else if ($('#nc-channel-type').val() == 'Circular') {
        pipeDiameter = false;
    } else if ($('#nc-channel-type').val() == 'Cross Section') {
        alert('define a cross section')
    } else {
        alert('Invalid Channel Shape')
    }
        $('#side-slope1').prop( "disabled", sideSlope1 ).val('');
        $('#side-slope2').prop( "disabled", sideSlope2 ).val('');
        $('#channel-width').prop( "disabled", channelWidth ).val('');
        $('#pipe-diameter').prop( "disabled", pipeDiameter ).val('');
}

function flowVsDepth () {
    if ($('#enter-depth').prop('disabled') == true) {
        $('#enter-depth').prop('disabled', false);
        $('#enter-flow').prop('disabled', true).val('');
    } else {
        $('#enter-depth').prop('disabled', true).val('');
        $('#enter-flow').prop('disabled', false);
    }
}

function getUserInput() {
    let i;
    let z1 = parseFloat($('#side-slope1').val());
    let z2 = parseFloat($('#side-slope2').val());
    let b = parseFloat($('#channel-width').val());
    let d = parseFloat($('#pipe-diameter').val());
    let lo = parseFloat($('#longitudinal-slope').val());
    let n = parseFloat($('#mannings-roughness').val());
    if ($('#nc-units').val() == 'Metric') {
        i = 1;
    } else {
        i = 1.49;
    }
    let flowValues = {
        slope1: z1,
        slope2: z2,
        base: b,
        diameter: d,
        baseSlope: lo,
        manningsN: n,
        i: i,
    };
    return flowValues
}

function solveForAandR(flowValues) {
    let a, r, theta, flow, t, hydraulicDepth, wettedPerimeter;
    if ($('#nc-channel-type').val() == 'Trapezoidal') {
        a = (flowValues['base'] + (flowValues['slope1'] * flowValues['depth'] / 2) + (flowValues['slope2'] * flowValues['depth'] / 2)) * flowValues['depth'];
        wettedPerimeter = (flowValues['base'] + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope1'], 2) + 1) + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope2'], 2) + 1));
        r = a / wettedPerimeter;
        t = flowValues['base'] + flowValues['slope1'] * flowValues['depth'] + flowValues['slope2'] * flowValues['depth'];
        hydraulicDepth = a / t;
    } else if ($('#nc-channel-type').val() == 'Rectangular') {
        a = flowValues['base'] * flowValues['depth'];
        wettedPerimeter = (2 * flowValues['depth'] + flowValues['base']);
        r = a / wettedPerimeter;
        t = flowValues['base'];
        hydraulicDepth = a / t;
    } else if ($('#nc-channel-type').val() == 'Triangular') {
        a = ((flowValues['slope1'] * flowValues['depth'] / 2) + (flowValues['slope2'] * flowValues['depth'] / 2)) * flowValues['depth'];
        wettedPerimeter = (flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope1'], 2) + 1) + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope2'], 2) + 1));
        r = a / wettedPerimeter;
        t = flowValues['depth'] * (flowValues['slope1'] + flowValues['slope2']);
        hydraulicDepth = a / t;
    } else if ($('#nc-channel-type').val() == 'Circular') {
        theta = 2 * (Math.PI - Math.acos((2 * flowValues['depth'] / flowValues['diameter']) - 1));
        wettedPerimeter = theta * flowValues['diameter'] / 2;
        a = (theta - Math.sin(theta)) * Math.pow(flowValues['diameter'], 2) / 8;
        r = (1 - Math.sin(theta) / theta) * flowValues['diameter'] / 4;
        t = 2 * Math.sqrt(flowValues['depth'] * (flowValues['diameter'] - flowValues['depth']));
        hydraulicDepth = ((theta - Math.sin(theta)) / (Math.sin(theta / 2))) * flowValues['diameter'] / 8;
    } else if ($('#nc-channel-type').val() == 'Cross Section') {

    }
    flow = solveManningsForFlow (a, r, flowValues['i'], flowValues['manningsN'], flowValues['baseSlope']);
    let velocity = flow / a;
    console.log(flow)
    let newFlowValues = {
        flow: flow,
        slope1: flowValues['slope1'],
        slope2: flowValues['slope2'],
        base: flowValues['base'],
        depth: flowValues['depth'],
        diameter: flowValues['diameter'],
        baseSlope: flowValues['baseSlope'],
        manningsN: flowValues['manningsN'],
        i: flowValues['i'],
        velocity: velocity,
        area: a,
        wettedPerimeter: wettedPerimeter,
        hydraulicRadius: r,
        topWidth: t,
        hydraulicDepth: hydraulicDepth,
    }
    return newFlowValues;
}

function solveManningsForFlow (a, r, i, n, s) {
    let flow = (i / n) * a * Math.pow(r, 2/3) * Math.sqrt(s);
    return flow
}

function normalDepth() {
    let firstFlowValues = getUserInput();
    let allValues = {};
    if ($('#enter-depth-radio').prop('checked') == true) {
        firstFlowValues['depth'] = parseFloat($('#enter-depth').val());
        allValues = solveForAandR(firstFlowValues);
        $('#enter-flow').val(Math.round(allValues['flow'] * 1000) / 1000);
    } else if ($('#enter-flow-radio').prop('checked') == true) {
        let finalFlow = parseFloat($('#enter-flow').val());
        let yn = 0;
        let ynOld = 0;
        let jumpVal = 20;
        let tryFlow = 1;
        while (tryFlow > finalFlow + 0.00001 || tryFlow < finalFlow - 0.00001) {
            if (tryFlow > finalFlow) {
                jumpVal = jumpVal / 2.1;
                yn = ynOld + jumpVal;
            } else {
                ynOld = yn;
                yn += jumpVal;
            }
            firstFlowValues['depth'] = yn;
            allValues = solveForAandR(firstFlowValues);
            tryFlow = allValues['flow'];
        }
        $('#enter-depth').val(Math.round(yn * 1000) / 1000);
    }
    let criticalValues = findCriticalDepth(allValues, allValues['flow']);
    allValues['depth'] = firstFlowValues['depth']
    allValues['criticalDepth'] = criticalValues['depth'];
    allValues['criticalVelocity'] = criticalValues['velocity'];
    allValues['criticalArea'] = criticalValues['area'];
    allValues['criticalSlope'] = criticalValues['criticalSlope'];
    setResults(allValues);
}

function findCriticalDepth(criticalFlowValues, flow) {
    let g;
    let newCriticalFlowValues = {};
    if ($('#nc-units').val() == 'Metric') {
        g = 9.81;
    } else {
        g = 32.2;
    }
    let criticalFlowValue = Math.pow(criticalFlowValues['flow'], 2) / g;
    let yc = 0;
    let ycOld = 0;
    let tryFlowValue = 1;
    let jumpVal = 20;
    while (tryFlowValue > criticalFlowValue + 0.00001 || tryFlowValue < criticalFlowValue - 0.00001) {
        if (tryFlowValue > criticalFlowValue) {
            jumpVal = jumpVal / 2;
            yc = ycOld + jumpVal;
        } else {
            ycOld = yc;
            yc += jumpVal;
        }
        criticalFlowValues['depth'] = yc;
        newCriticalFlowValues = solveForAandR(criticalFlowValues);
        tryFlowValue = Math.pow(newCriticalFlowValues['area'], 3) / newCriticalFlowValues['topWidth'];
    }
    newCriticalFlowValues['flow'] = flow;
    newCriticalFlowValues['velocity'] = flow / newCriticalFlowValues['area'];
    newCriticalFlowValues['criticalSlope'] = findCriticalSlope(newCriticalFlowValues);
    return newCriticalFlowValues
}

function findCriticalSlope (valuesForCriticalSlope) {
    let criticalSlope = Math.sqrt(valuesForCriticalSlope['flow'] * valuesForCriticalSlope['manningsN'] / (valuesForCriticalSlope['i'] * Math.pow(valuesForCriticalSlope['hydraulicRadius'], 2/3) * valuesForCriticalSlope['area']))
    return criticalSlope
}

function setResults(flow) {
    let fut, dut, vut, aut;
    if ($('#nc-units').val() == 'Metric') {
        fut = 'm<sup>3</sup>/s';
        dut = 'm';
        vut = 'm/s<sup>2</sup>';
        aut = 'm<sup>2</sup>';
    } else {
        fut = 'ft<sup>3</sup>/s';
        dut = 'ft';
        vut = 'ft/s<sup>2</sup>';
        aut = 'ft<sup>2</sup>';
    }
    let html = `<p>Flow: ${Math.round(flow['flow'] * 1000) / 1000} ${fut}</p>
    <p>Normal Depth: ${Math.round(flow['depth'] * 1000) / 1000} ${dut}</p>
    <p>Velocity: ${Math.round(flow['velocity'] * 1000) / 1000} ${vut}</p>
    <p>Flow Area: ${Math.round(flow['area'] * 1000) / 1000} ${aut}</p>
    <p>Wetted Perimeter: ${Math.round(flow['wettedPerimeter'] * 1000) / 1000} ${dut}</p>
    <p>Hydraulic Radius: ${Math.round(flow['hydraulicRadius'] * 1000) / 1000} ${dut}</p>
    <p>Top Width: ${Math.round(flow['topWidth'] * 1000) / 1000} ${dut}</p>
    <p>Hydraulic Depth: ${Math.round(flow['hydraulicDepth'] * 1000) / 1000} ${dut}</p>
    <p>Critical Depth: ${Math.round(flow['criticalDepth'] * 1000) / 1000} ${dut}</p>
    <p>Critical Velocity: ${Math.round(flow['criticalVelocity'] * 1000) / 1000} ${vut}</p>
    <p>Critical Area: ${Math.round(flow['criticalArea'] * 1000) / 1000} ${aut}</p>
    <p>Critical Slop: ${Math.round(flow['criticalSlope'] * 1000) / 1000}</p>`;
    if (flow['depth'] > flow['criticalDepth']) {
        html += `<p>Flow is Subcritical</p>`;
    } else if (flow['depth'] < flow['criticalDepth']) {
        html += `<p>Flow is Supercritical</p>`;
    } else {
        html += `<p>Flow is Critical</p>`;
    }
    $('#nc-result-div').empty().append(html);
}

//////////////////////////Hide All/////////////////////////////////

function showNone() {
    $('.tool').each(function () {
        $(this).css('display', 'none');
    });
}

/*
$(document).ready(function() {
    $('#nc-channel-type').change(setChannelType);
})*/
////////////////////////End Normal Critical 2/////////////////////////
