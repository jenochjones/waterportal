let setUnits = function () {
    let lableList;

    if (document.getElementById('nc-units').value === 'U.S. Customary') {
        lableList = ['Units', 'Channel Type', 'Side Slope 1 (h:v)', 'Side Slope 2 (h:v)', 'Channel Width (ft)', 'Pipe Diameter (ft)', 'Longitudinal Slope', `Manning's Roughness`, 'Enter Flow (cfs)', 'Enter Depth (ft)'];
    } else {
        lableList = ['Units', 'Channel Type', 'Side Slope 1 (h:v)', 'Side Slope 2 (h:v)', 'Channel Width (m)', 'Pipe Diameter (m)', 'Longitudinal Slope', `Manning's Roughness`, 'Enter Flow (cms)', 'Enter Depth (m)'];
    }

    const parentElement = document.getElementById('normal-critical-depth');
    if (!parentElement) return;

    const labels = parentElement.getElementsByTagName('label');

    for (let i = 0; i < labels.length && i < lableList.length; i++) {
        labels[i].textContent = lableList[i];
    }
};

let setChannelType = function () {
    let sideSlope1 = true;
    let sideSlope2 = true;
    let channelWidth = true;
    let pipeDiameter = true;
    const channelType = document.getElementById('nc-channel-type').value;

    if (channelType === 'Trapezoidal') {
        sideSlope1 = false;
        sideSlope2 = false;
        channelWidth = false;
    } else if (channelType === 'Rectangular') {
        channelWidth = false;
    } else if (channelType === 'Triangular') {
        sideSlope1 = false;
        sideSlope2 = false;
    } else if (channelType === 'Circular') {
        pipeDiameter = false;
    } else if (channelType === 'Cross Section') {
        alert('define a cross section')
    } else {
        alert('Invalid Channel Shape')
    }

    document.getElementById('side-slope1').disabled = sideSlope1;
    document.getElementById('side-slope2').disabled = sideSlope2;
    document.getElementById('channel-width').disabled = channelWidth;
    document.getElementById('pipe-diameter').disabled = pipeDiameter;
};

let flowVsDepth = function () {
    const enterDepth = document.getElementById('enter-depth');
    const enterFlow = document.getElementById('enter-flow');
    if (enterDepth.disabled) {
        enterDepth.disabled = false;
        enterFlow.disabled = true;
        enterFlow.value = '';
    } else {
        enterDepth.disabled = true;
        enterDepth.value = '';
        enterFlow.disabled = false;
    }
};

let getUserInput = function () {
    let i;
    let z1 = parseFloat(document.getElementById('side-slope1').value);
    let z2 = parseFloat(document.getElementById('side-slope2').value);
    let b = parseFloat(document.getElementById('channel-width').value);
    let d = parseFloat(document.getElementById('pipe-diameter').value);
    let lo = parseFloat(document.getElementById('longitudinal-slope').value);
    let n = parseFloat(document.getElementById('mannings-roughness').value);
    if (document.getElementById('nc-units').value == 'Metric') {
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
    return flowValues;
};

let solveForAandR = function (flowValues) {
    let a, r, theta, flow, t, hydraulicDepth, wettedPerimeter;
    const channelType = document.getElementById('nc-channel-type').value;

    if (channelType === 'Trapezoidal') {
        a = (flowValues['base'] + (flowValues['slope1'] * flowValues['depth'] / 2) + (flowValues['slope2'] * flowValues['depth'] / 2)) * flowValues['depth'];
        wettedPerimeter = (flowValues['base'] + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope1'], 2) + 1) + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope2'], 2) + 1));
        r = a / wettedPerimeter;
        t = flowValues['base'] + flowValues['slope1'] * flowValues['depth'] + flowValues['slope2'] * flowValues['depth'];
        hydraulicDepth = a / t;
    } else if (channelType === 'Rectangular') {
        a = flowValues['base'] * flowValues['depth'];
        wettedPerimeter = (2 * flowValues['depth'] + flowValues['base']);
        r = a / wettedPerimeter;
        t = flowValues['base'];
        hydraulicDepth = a / t;
    } else if (channelType === 'Triangular') {
        a = ((flowValues['slope1'] * flowValues['depth'] / 2) + (flowValues['slope2'] * flowValues['depth'] / 2)) * flowValues['depth'];
        wettedPerimeter = (flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope1'], 2) + 1) + flowValues['depth'] * Math.sqrt(Math.pow(flowValues['slope2'], 2) + 1));
        r = a / wettedPerimeter;
        t = flowValues['depth'] * (flowValues['slope1'] + flowValues['slope2']);
        hydraulicDepth = a / t;
    } else if (channelType === 'Circular') {
        theta = 2 * (Math.PI - Math.acos((2 * flowValues['depth'] / flowValues['diameter']) - 1));
        wettedPerimeter = theta * flowValues['diameter'] / 2;
        a = (theta - Math.sin(theta)) * Math.pow(flowValues['diameter'], 2) / 8;
        r = (1 - Math.sin(theta) / theta) * flowValues['diameter'] / 4;
        t = 2 * Math.sqrt(flowValues['depth'] * (flowValues['diameter'] - flowValues['depth']));
        hydraulicDepth = ((theta - Math.sin(theta)) / (Math.sin(theta / 2))) * flowValues['diameter'] / 8;
    } else if (channelType === 'Cross Section') {

    }
    flow = solveManningsForFlow(a, r, flowValues['i'], flowValues['manningsN'], flowValues['baseSlope']);
    let velocity = flow / a;
    console.log(flow);
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
    };
    return newFlowValues;
};

let solveManningsForFlow = function (a, r, i, n, s) {
    let flow = (i / n) * a * Math.pow(r, 2/3) * Math.sqrt(s);
    return flow;
};

let normalDepth = function () {
    debugger
    let firstFlowValues = getUserInput();
    let allValues = {};
    if (document.getElementById('enter-depth-radio').checked) {
        firstFlowValues['depth'] = parseFloat(document.getElementById('enter-depth').value);
        allValues = solveForAandR(firstFlowValues);
        document.getElementById('enter-flow').value = Math.round(allValues['flow'] * 1000) / 1000;
    } else if (document.getElementById('enter-flow-radio').checked) {
        let finalFlow = parseFloat(document.getElementById('enter-flow').value);
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
        document.getElementById('enter-depth').value = Math.round(yn * 1000) / 1000;
    }
    let criticalValues = findCriticalDepth(allValues, allValues['flow']);
    allValues['depth'] = firstFlowValues['depth'];
    allValues['criticalDepth'] = criticalValues['depth'];
    allValues['criticalVelocity'] = criticalValues['velocity'];
    allValues['criticalArea'] = criticalValues['area'];
    allValues['criticalSlope'] = criticalValues['criticalSlope'];
    setResults(allValues);
};

let findCriticalDepth = function (criticalFlowValues, flow) {
    let g;
    let newCriticalFlowValues = { ...criticalFlowValues };
    const channelType = document.getElementById('nc-channel-type').value;
    debugger
    if (document.getElementById('nc-units').value == 'Metric') {
        g = 9.81;
    } else {
        g = 32.2;
    }
    
    let fr = newCriticalFlowValues['velocity'] / Math.sqrt(g * newCriticalFlowValues['hydraulicDepth']);
    let upperBounds = 1000;
    let lowerBounds = 0;

    if (channelType === 'Circular') {
        upperBounds = newCriticalFlowValues['diameter'];
    } else {
        upperBounds = 1000;
    }

    while (fr < 0.9999 || fr > 1.001) {
        newCriticalFlowValues['depth'] = newCriticalFlowValues['hydraulicDepth'];
        newCriticalFlowValues = solveForAandR(newCriticalFlowValues);
        
        fr = newCriticalFlowValues['velocity'] / Math.sqrt(g * newCriticalFlowValues['hydraulicDepth']);
        console.log(`Fr: ${fr}, Flow: ${newCriticalFlowValues['flow']}, Depth: ${newCriticalFlowValues['depth']}`);
        if (fr < 1) {
            upperBounds = newCriticalFlowValues['hydraulicDepth'];
        } else {
            lowerBounds = newCriticalFlowValues['hydraulicDepth'];
        }
        newCriticalFlowValues['hydraulicDepth'] = (upperBounds + lowerBounds) / 2;
    }
    newCriticalFlowValues['criticalSlope'] = findCriticalSlope(newCriticalFlowValues);
    return newCriticalFlowValues;
};

let findCriticalSlope = function (valuesForCriticalSlope) {
    let criticalSlope = Math.sqrt(valuesForCriticalSlope['flow'] * valuesForCriticalSlope['manningsN'] / (valuesForCriticalSlope['i'] * Math.pow(valuesForCriticalSlope['hydraulicRadius'], 2/3) * valuesForCriticalSlope['area']));
    return criticalSlope;
};

let setResults = function (flow) {
    let fut, dut, vut, aut;
    if (document.getElementById('nc-units').value == 'Metric') {
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
    document.getElementById('nc-result-div').innerHTML = html;
};

let setUpNormalDepth = function () {
    document.getElementById('nc-units').addEventListener('change', setUnits);
    document.getElementById('nc-channel-type').addEventListener('change', setChannelType);
    document.getElementById('enter-flow-radio').addEventListener('click', flowVsDepth);
    document.getElementById('enter-depth-radio').addEventListener('click', flowVsDepth);
    document.getElementById('normal-critical-result').addEventListener('click', normalDepth);
};

export {
    setUpNormalDepth
}
