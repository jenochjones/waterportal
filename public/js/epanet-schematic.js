let modelDictVar = {};
let maxElevVar = 1000;
let minElevVar = 0;
let elevIntVar = 0;
let locIntVar = 0;


let setModelDict = function (modelDict) {
    modelDictVar = modelDict;
}

let getModelDict = function () {
    return modelDictVar;
}

let setMinElev = function (minElev) {
    minElevVar = minElev;
}

let getMinElev = function () {
    return minElevVar;
}

let setMaxElev = function (maxElev) {
    maxElevVar = maxElev;
}

let getMaxElev = function () {
    return maxElevVar;
}

let setElevInt = function (elevInt) {
    elevIntVar = elevInt;
}

let getElevInt = function () {
    return elevIntVar;
}

let setLocInt = function (locInt) {
    locIntVar = locInt;
}

let getLocInt = function () {
    return locIntVar;
}

let drawValves = function () {
    const modelDict = getModelDict();
    const valves = modelDict['VALVES'].data;

    const pageMaxElev = getMaxElev();
    const pageMinElev = getMinElev();

    let x = 4;
    debugger
    for (let valve in valves) {
        console.log(valve[0]);
        let elev = valves[valve][1];
        let valveDiv = document.createElement('div');
        let valveTop = document.createElement('div');
        let valveBottom = document.createElement('div');
        let mainWindow = document.getElementById('main-window');

        valveDiv.classList.add('valve-div');
        valveDiv.style.position = 'absolute';
        valveDiv.style.bottom = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        valveDiv.style.left = `${x}%`;
        valveTop.classList.add('valve-top');
        valveBottom.classList.add('valve-bottom');
        valveDiv.appendChild(valveBottom);
        valveDiv.appendChild(valveTop);
        mainWindow.appendChild(valveDiv);
        
        x += 2;
    }
}

let drawPumps = function () {
    const modelDict = getModelDict();
    const pumps = modelDict['PUMPS'].data;

    const pageMaxElev = getMaxElev();
    const pageMinElev = getMinElev();

    let x = 10;
    debugger
    for (let pump in pumps) {
        let loc;
        console.log(pageMinElev);
        console.log(pumps[pump][4]);
        let elev = pumps[pump][4];
        let pumpDiv = document.createElement('div');
        let pumpTop = document.createElement('div');
        let pumpBottom = document.createElement('div');
        let mainWindow = document.getElementById('main-window');

        if (elev <= pageMinElev) {
            loc = 2;
        } else {
            loc = 2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev);
        }

        pumpDiv.classList.add('pump-div');
        pumpDiv.style.position = 'absolute';
        pumpDiv.style.bottom = `${loc}%`;
        pumpDiv.style.left = `${x}%`;
        pumpTop.classList.add('pump-top');
        pumpBottom.classList.add('pump-bottom');
        pumpDiv.appendChild(pumpBottom);
        pumpDiv.appendChild(pumpTop);
        mainWindow.appendChild(pumpDiv);
        
        x += 10;
    }
}

let drawTanks = function () {
    const modelDict = getModelDict();
    const tanks = modelDict['TANKS'].data;

    const pageMaxElev = getMaxElev();
    const pageMinElev = getMinElev();

    let x = 10;

    for (let tank in tanks) {
        console.log(tank[0]);
        let elev = tanks[tank][1];
        let tankDiv = document.createElement('div');
        let tankTop = document.createElement('div');
        let tankBottom = document.createElement('div');
        let mainWindow = document.getElementById('main-window');

        tankDiv.classList.add('tank-div');
        tankDiv.style.position = 'absolute';
        tankDiv.style.bottom = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        tankDiv.style.left = `${x}%`;
        tankTop.classList.add('tank-top');
        tankBottom.classList.add('tank-bottom');
        tankDiv.appendChild(tankBottom);
        tankDiv.appendChild(tankTop);
        mainWindow.appendChild(tankDiv);
        
        x += 10;
    }

    let tankDivs = document.getElementsByClassName('tank-div');

    tankDivs = Array.from(tankDivs);
    tankDivs.forEach(tdiv => {
        makeDraggable(tdiv);
    });
}

let drawZones = function (zones) {
    
    let numZones = Object.keys(zones).length;

    const pageMaxElev = getMaxElev();
    const pageMinElev = getMinElev();

    let zoneWidth = 100 / numZones - 5;
    let x = 2.5;

    const mainWindow = document.getElementById('main-window');

    for (let zone in zones) {
        let maxElev = zones[zone]['MaxElev'];
        let minElev = zones[zone]['MinElev'];

        console.log(`${zone}: ${maxElev}, ${minElev}`);

        const newDiv = document.createElement('div');

        // Set class and inline styles
        newDiv.classList.add('zone');
        newDiv.style.left = `${x}%`;
        newDiv.style.bottom = `${2 + (minElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        newDiv.style.top = `${2 + (maxElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        newDiv.style.width = `${zoneWidth}%`;

        // Set innerHTML to zone
        newDiv.textContent = zone;

        mainWindow.appendChild(newDiv);
        x += zoneWidth + 5;
    }
}

let handleFileUpload = function (event) {
    let input = document.createElement('input');
    input.type = 'file';

    input.addEventListener('change', function () {
        let file = input.files[0];

        if (file) {
            let reader = new FileReader();
            reader.onload = function () {
                let image = document.createElement('img');
                image.src = reader.result;
                image.style.maxWidth = '100%';
                image.style.maxHeight = '100%';
                document.getElementById('logo').innerHTML = '';
                document.getElementById('logo').appendChild(image);
            };

            reader.readAsDataURL(file);
        }
    });
    input.click();
}

let drawElevLines = function () {
    const maxElev = getMaxElev();
    const minElev = getMinElev();
    const maxElevRound = Math.ceil(maxElev / 10) * 10;
    const minElevRound = Math.floor(minElev / 10) * 10;
    const elevDiff = maxElevRound - minElevRound;
    const elevInt = document.getElementById("elev-int").value;
    const numOfElev = elevDiff / elevInt + 1;
    const locInt = 95 / numOfElev;

    let elevationsDiv = document.getElementById('elevations');
    let mainWindowDiv = document.getElementById('main-window');

    setElevInt(elevInt);
    setLocInt(locInt);

    while (elevationsDiv.firstChild) {
        elevationsDiv.removeChild(elevationsDiv.firstChild);
    }

    while (mainWindowDiv.firstChild) {
        mainWindowDiv.removeChild(mainWindowDiv.firstChild);
    }

    for (let i = 0; i < numOfElev + 1; i++) {
        let elev = minElevRound + elevInt * i;
        let loc = 2 + locInt * i;

        if (loc < 100) {
            let paragraph = document.createElement('p');
            paragraph.textContent = elev;
            paragraph.style.position = 'absolute';
            paragraph.style.bottom = `calc(${loc}% - 0.5em)`;
            paragraph.style.margin = `0`;
            paragraph.style.height = '1em';
            paragraph.style.color = 'gray';
            paragraph.style.fontSize = '10pt';
            elevationsDiv.appendChild(paragraph);
    
            let dashedLine = document.createElement('div');
            dashedLine.style.position = 'absolute';
            dashedLine.style.bottom = `${loc}%`;
            dashedLine.style.borderTop = '1px dashed gray';
            dashedLine.style.margin = `0`;
            dashedLine.style.height = '0';
            dashedLine.style.width = '100%';
            mainWindowDiv.appendChild(dashedLine);
        }
    }
};

let handleFile = function () {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const contents = event.target.result;
                // Assuming the text file contains plain text, you can directly resolve with its content
                const textVariable = contents;
                resolve(textVariable);
            };

            reader.onerror = function(error) {
                reject(error);
            };

            reader.readAsText(file);
        } else {
            reject(new Error("No file selected."));
        }
    });
};

let printDiv = function (divId) {
    // Clone the target div and its contents
    let printableArea = document.getElementById(divId).cloneNode(true);

    // Create a new window or tab
    let printWindow = window.open('', '_blank');

    // Create a link element to include the CSS file in the new window
    let cssLink = printWindow.document.createElement('link');
    cssLink.href = 'static/styles.css';  // Replace with the path to your CSS file
    cssLink.rel = 'stylesheet';

    // Attach an onload event to the link element
    cssLink.onload = function () {
        // Append the cloned div to the new window or tab
        printWindow.document.body.appendChild(printableArea);
        printWindow.document.getElementById('schematic-white-rectangle').style.width = '432mm';
        printWindow.document.getElementById('schematic-white-rectangle').style.height = '279mm';

        //279mm by 432mm
        //210mm by 297mm

        // Trigger the print dialog
        printWindow.print();
    };

    // Append the link element to the head of the new window
    printWindow.document.head.appendChild(cssLink);
    

    printWindow.document.body.style.margin = '0';
    printWindow.document.body.style.padding = '0';
}

let makeDraggable = function(element) {
    let pos1 = 0, pos3 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos1 = e.clientX;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position:
        let newX = pos1 - e.clientX;
        pos1 = e.clientX;
        // Calculate new position as a percentage:
        let containerWidth = element.parentNode.clientWidth;
        let newPosition = ((element.offsetLeft - newX) / containerWidth) * 100;
        // Ensure the element stays within bounds
        newPosition = Math.max(0, Math.min(newPosition, 100));
        // Set the element's new position:
        element.style.left = newPosition + "%";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

let getMinElevation = function (idsWithElevation, targetIds) {
    let minElevation = Number.POSITIVE_INFINITY;

    // Iterate through the IDs with elevation
    for (let i = 0; i < idsWithElevation.length; i++) {
        const id = idsWithElevation[i][0]; // ID is in the first column
        const elevation = idsWithElevation[i][1]; // Elevation is in the second column

        // Check if the current ID is in the target IDs
        if (targetIds.includes(id)) {
            // Update min elevation if the current elevation is smaller
            if (elevation < minElevation) {
                minElevation = elevation;
            }
        }
    }

    return minElevation;
}

let getMaxElevation = function (idsWithElevation, targetIds) {
    let maxElevation = Number.NEGATIVE_INFINITY;

    // Iterate through the IDs with elevation
    for (let i = 0; i < idsWithElevation.length; i++) {
        const id = idsWithElevation[i][0]; // ID is in the first column
        const elevation = idsWithElevation[i][1]; // Elevation is in the second column

        // Check if the current ID is in the target IDs
        if (targetIds.includes(id)) {
            // Update max elevation if the current elevation is greater
            if (elevation > maxElevation) {
                maxElevation = elevation;
            }
        }
    }

    return maxElevation;
}

let assignZones = function (modelDict) {
    
    // Initialize an adjacency list to represent the graph
    //let reservoirs = modelDict['RESERVOIRS'].data.map(row => [row[0]]);
    //let pumps = modelDict['PUMPS'].data.map(row => [row[0]]);
    //let tanks = modelDict['TANKS'].data.map(row => [row[0]]);
    //let valves = modelDict['VALVES'].data.map(row => [row[0]]);
    let nodes = modelDict['JUNCTIONS'].data.map(row => [row[0]]);
    //let nodes = [...juncts, ...tanks, ...reservoirs];
    let pipes = modelDict['PIPES'].data.map(row => row.slice(0, 3));
    //pipes = [...pipes, ...pumps];//, ...valves];

    let zones = {};

    const adjacencyList = {};
    
    const numOfZones = document.getElementById('num-zones').value;

    // Populate adjacency list
    pipes.forEach(pipe => {
        const [pipeId, startNodeId, endNodeId] = pipe;
        if (!adjacencyList[startNodeId]) adjacencyList[startNodeId] = [];
        if (!adjacencyList[endNodeId]) adjacencyList[endNodeId] = [];
        adjacencyList[startNodeId].push(endNodeId);
        adjacencyList[endNodeId].push(startNodeId);
    });

    // Initialize visited nodes and result array
    const visited = {};
    const groups = [];

    function dfs(node, group) {
        visited[node] = true;
        group.push(node);
        if (adjacencyList[node]) {
            adjacencyList[node].forEach(neighbor => {
                if (!visited[neighbor]) {
                    dfs(neighbor, group);
                }
            });
        }
    }

    // Perform DFS for each unvisited node
    nodes.forEach(node => {
        if (!visited[node]) {
            const group = [];
            dfs(node, group);
            if (group.length > 5) { // Only add groups with more than 5 elements
                groups.push(group);
            }
        }
    });

    let counter = 1;
    
    groups.forEach(group => {
        zones[`Zone ${counter}`] = {};
        zones[`Zone ${counter}`]['JUNCTIONS'] = group;
        let maxElev = getMaxElevation(modelDict['JUNCTIONS'].data.map(row => [row[0], row[1]]), group);
        let minElev = getMinElevation(modelDict['JUNCTIONS'].data.map(row => [row[0], row[1]]), group);
        zones[`Zone ${counter}`]['MaxElev'] = maxElev;
        zones[`Zone ${counter}`]['MinElev'] = minElev;
        counter++;
    });

    return zones;
}

let getMinMax = function (modelDict) {

    let elementList = ['TANKS', 'JUNCTIONS'];
    let maxElevs = [];
    let minElevs = [];
        
    for (let element in elementList) {
        const data = modelDict[elementList[element]].data;
        const elevations = data.map(row => parseFloat(row[1]));
        maxElevs.push(Math.max(...elevations));
        minElevs.push(Math.min(...elevations));
    }
    
    return [Math.max(...maxElevs), Math.min(...minElevs)]
}

let  createModelDict = function (inputText) {
    const list_of_headers = {
        'COORDINATES': ['NODE ID', 'X-COORDINATE', 'Y-COORDINATE'],
        'CURVES': ['CURVE ID', 'X-VALUE', 'Y-VALUE'],
        'DEMANDS': ['JUNCTION ID', 'BASE DEMAND', 'DEMAND PATTERN ID'],
        'JUNCTIONS': ['ID', 'ELEVATION', 'BASE DEMAND FLOW', 'DEMAND PATTERN ID'],
        'PIPES': ['ID', 'START NODE ID', 'END NODE ID', 'LENGTH', 'DIAMETER', 'ROUGHNESS COEFFICIENT', 'MINOR LOSS COEFFICIENT', 'STATUS'],
        'PUMPS': ['ID', 'START NODE ID', 'END NODE ID', 'KEYWORDS AND VALUES'],
        'RESERVOIRS': ['ID', 'HEAD', 'HEAD PATTERN ID'],
        'SOURCES': [],
        'STATUS': [],
        'TANKS': ['ID', 'BOTTOM ELEVATION', 'INITIAL WATER LEVEL', 'MINIMUM WATER LEVEL', 'NOMINAL DIAMETER', 'MINIMUM VOLUME', 'VOLUME CURVE ID'],
        'TITLE': [],
        'VALVES': ['ID', 'START NODE ID', 'END NODE ID', 'DIAMETER', 'VALVE TYPE', 'VALVE SETTING', 'MINOR LOSS COEFFICIENT'],
        'VERTICIES': ['PIPE ID', 'X-COORDINATE', 'Y-COORDINATE']
    };

    let parseSection = function (sectionLines, header) {
        let data = [];
        let newColCount = 1;
        for (let line of sectionLines) {
            line = line.trim();
            if (!line || line.startsWith(";")) {
                continue;
            }

            let comment = '';
            if (line.includes(';')) {
                const parts = line.split(';');
                line = parts[0];
                comment = parts[1];
            }

            let parts = line.split('\t');
            while (parts.length < header.length) {
                parts.push('');
            }
            while (header.length < parts.length) {
                header.push(`Col_${newColCount}`);
                newColCount++;
            }

            data.push(parts.concat([comment]));
        }
        if (!data.length) {
            return null;
        }
        const df = { data: data, columns: header.concat(['Comment']) };
        return df;
    }

    const lines = inputText.split('\n');

    const dataDict = {};
    let currentSection = null;
    let currentLines = [];

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith("[") && line.endsWith("]")) {
            if (currentSection) {
                const colNames = list_of_headers[currentSection] || ['Col_0'];
                const df = parseSection(currentLines, colNames);
                dataDict[currentSection] = df ? df : null;
            }
            currentSection = line.substring(1, line.length - 1);
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }

    if (currentSection && currentSection.toLowerCase() !== 'end') {
        const colNames = list_of_headers[currentSection] || ['Col_0'];
        const df = parseSection(currentLines, colNames);
        dataDict[currentSection] = df ? df : null;
    }

    return dataDict;
}

let setSchematicEventListeners = function () {
    document.getElementById('schematic-fileInput').addEventListener('change', async (event) => {
        const modelText = await handleFile();
        let modelDict = createModelDict(modelText);
        setModelDict(modelDict);
        const maxMin = getMinMax(modelDict);
        setMaxElev(maxMin[0]);
        setMinElev(maxMin[1]);
        drawElevLines(maxMin[0], maxMin[1]);
        let zones = assignZones(modelDict);
        drawZones(zones);
        drawTanks();
        drawPumps();
        drawValves();
    });

    document.getElementById('schematic-printBtn').addEventListener("click", (event) => {
        printDiv('schematic-white-rectangle');
    });

    document.getElementById('schematic-elev-int').addEventListener('change', (event) => {
        const maxElev = getMaxElev();
        const minElev = getMinElev();
        drawElevLines(maxElev, minElev);
    })

    document.getElementById('schematic-logo').addEventListener('click', handleFileUpload);
}

export {
    setSchematicEventListeners
};


