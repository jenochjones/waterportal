let modelText = '';
let modelDict = {};
let maxElevVar = 1000;
let minElevVar = 0;
let elevIntVar = 0;
let locIntVar = 0;

let pageMinElev = '';
let pageMaxElev = '';


let w = 50;
let h = 50;


let drawLine = function(startCoords, endCoords, startID, endID) {
    // Extract coordinates
    const [startX, startY] = startCoords;
    const [endX, endY] = endCoords;

    // Determine intermediate points for the L-shaped path
    const midX = startX;
    const midY = endY;

    // Create an SVG element
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    // Create the path for the line
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M${startX},${startY} L${midX},${midY} L${endX},${endY}`);
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");

    // Create the marker for the arrowhead
    let marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "10");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");

    // Create the arrowhead shape
    let arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrow.setAttribute("points", "0 0, 10 3.5, 0 7");
    arrow.setAttribute("fill", "black");

    // Append the arrowhead to the marker
    marker.appendChild(arrow);

    // Add the marker to the SVG
    svg.appendChild(marker);

    // Set the marker-end attribute to the path
    path.setAttribute("marker-end", "url(#arrowhead)");

    // Append the path to the SVG
    svg.appendChild(path);

    // Append the SVG to the elements identified by startID and endID
    document.getElementById('schematic-main-window').appendChild(svg);
};


function drawElement(x, y, wnew, hnew, element) {
    w = wnew;
    h = hnew;

    const elements = {
        tank: `
        <svg class="tank" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="40" cy="47" rx="30" ry="10" fill="lightgrey" stroke="black" stroke-width="2"/>
            <rect x="10" y="17" width="60" height="30" fill="lightgrey" stroke="grey" stroke-width="2" stroke-dasharray="0 78 0 78"/>
            <ellipse cx="40" cy="20" rx="30" ry="10" fill="lightgrey" stroke="black" stroke-width="2"/>
            <polyline points="10,20 10,47" stroke="black" stroke-width="2" fill="none"/>
            <polyline points="70,20 70,47" stroke="black" stroke-width="2" fill="none"/>
        </svg>
        `,
    
        pump: `
        <svg class="pump" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="50" width="35" height="20" fill="gray" stroke="black" stroke-width="2"/>
            <circle cx="50" cy="50" r="20" fill="gray" stroke="black" stroke-width="2"/> 
            <circle cx="50" cy="50" r="5" fill="gray" stroke="black" stroke-width="1"/>
        </svg>
        `,
    
        psv: `
        <svg class="psv" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <polyline points="50,50 50,75" stroke="black" stroke-width="2" fill="none"/>
            <circle cx="50" cy="75" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
    
        prv: `
        <svg class="prv" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <polyline points="50,50 50,25" stroke="black" stroke-width="2" fill="none"/>
            <circle cx="50" cy="25" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
    
        fcv: `
        <svg class="fcv" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <circle cx="50" cy="50" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
    
        reservoir: `
        <svg class="reservoir" width="${w}" height="${h}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="15,35 85,35 70,65 30,65" fill="brown" stroke="black" stroke-width="2" />
            <path d="M20 45 Q30 50, 40 45 T60 45 T80 45" fill="none" stroke="blue" stroke-width="3"/>
        </svg>
        `
    };

    console.log(elements[element]);
    

    // Get the main screen div
    const mainScreen = document.getElementById('schematic-main-window');
    
    // Create a container div for the tank SVG
    const drawContainer = document.createElement('div');
    
    // Set the position and coordinates for the container
    drawContainer.style.position = 'absolute';
    drawContainer.style.left = `${x}px`;
    drawContainer.style.top = `${y}px`;
    
    // Add the tankSVG content to the container
    drawContainer.innerHTML = elements[element];
    
    // Append the tank container to the main screen div
    mainScreen.appendChild(drawContainer);
}


let drawValves = function (x, y) {
    const valves = modelDict['VALVES'].data;

    for (let valve in valves) {
        console.log(valve[0]);
        let elev = valves[valve][1];
        let valveDiv = document.createElement('div');
        let valveTop = document.createElement('div');
        let valveBottom = document.createElement('div');
        let mainWindow = document.getElementById('schematic-main-window');

        valveDiv.classList.add('valve-div');
        valveDiv.style.position = 'absolute';
        valveDiv.style.bottom = `${y}%`;//`${2 + (elev - MinElev) * (93) / (maxElevVar - MinElev)}%`;
        valveDiv.style.left = `${x}%`;
        valveTop.classList.add('valve-top');
        valveBottom.classList.add('valve-bottom');
        valveDiv.appendChild(valveBottom);
        valveDiv.appendChild(valveTop);
        mainWindow.appendChild(valveDiv);
    }
}

let drawPumps = function (x, y) {
    const pumps = modelDict['PUMPS'].data;

    for (let pump in pumps) {
        let loc;
        console.log(pageMinElev);
        console.log(pumps[pump][4]);
        let elev = pumps[pump][4];
        let pumpDiv = document.createElement('div');
        let pumpTop = document.createElement('div');
        let pumpBottom = document.createElement('div');
        let mainWindow = document.getElementById('schematic-main-window');

        if (elev <= MinElev) {
            loc = 2;
        } else {
            loc = 2 + (elev - MinElev) * (93) / (maxElevVar - MinElev);
        }

        pumpDiv.classList.add('pump-div');
        pumpDiv.style.position = 'absolute';
        pumpDiv.style.bottom = `${y}%`;//`${loc}%`;
        pumpDiv.style.left = `${x}%`;
        pumpTop.classList.add('pump-top');
        pumpBottom.classList.add('pump-bottom');
        pumpDiv.appendChild(pumpBottom);
        pumpDiv.appendChild(pumpTop);
        mainWindow.appendChild(pumpDiv);
        
        x += 10;
    }
}

let drawTanks = function (x, y) {
    const tanks = modelDict['TANKS'].data;

    for (let tank in tanks) {
        console.log(tank[0]);
        let elev = tanks[tank][1];
        let tankDiv = document.createElement('div');
        let tankTop = document.createElement('div');
        let tankBottom = document.createElement('div');
        let mainWindow = document.getElementById('schematic-main-window');

        let tankLocBottom = `${y}%`;//`${2 + (elev - pageMinElev) * (93) / (maxElevVar - pageMinElev)}%`;
        let tankLocLeft = `${x}%`;

        tankDiv.classList.add('schematic-tank-div');
        tankDiv.style.position = 'absolute';
        tankDiv.style.bottom = tankLocBottom;
        tankDiv.style.left = tankLocLeft;
        tankTop.classList.add('schematic-tank-top');
        tankBottom.classList.add('schematic-tank-bottom');
        tankDiv.appendChild(tankBottom);
        tankDiv.appendChild(tankTop);
        mainWindow.appendChild(tankDiv);
        
        x += 10;
    }

    let tankDivs = document.getElementsByClassName('schematic-tank-div');

    tankDivs = Array.from(tankDivs);
    tankDivs.forEach(tdiv => {
        makeDraggable(tdiv);
    });
}

let drawRes = function (x, y) {
    const reservoirs = modelDict['TANKS'].data;

    for (let res in reservoirs) {
        console.log(res[0]);
        let elev = res[res][1];
        let resDiv = document.createElement('div');
        let resTop = document.createElement('div');
        let resBottom = document.createElement('div');
        let mainWindow = document.getElementById('schematic-main-window');
        
        let resLocBottom = `${y}%`;//`${2 + (elev - pageMinElev) * (93) / (maxElevVar - pageMinElev)}%`;
        let resLocLeft = `${x}%`;

        resDiv.classList.add('schematic-res-div');
        resDiv.style.position = 'absolute';
        resDiv.style.bottom = resLocBottom;
        resDiv.style.left = resLocLeft;
        resTop.classList.add('schematic-res-top');
        resBottom.classList.add('schematic-res-bottom');
        resDiv.appendChild(resBottom);
        resDiv.appendChild(resTop);
        mainWindow.appendChild(resDiv);
        
        x += 10;
    }

    let resDivs = document.getElementsByClassName('schematic-res-div');

    resDivs = Array.from(resDivs);
    resDivs.forEach(rdiv => {
        makeDraggable(rdiv);
    });
}


let drawZones = function (zones) {
    
    let numZones = Object.keys(zones).length;

    let zoneWidth = 100 / numZones - 10;
    let x = 2.5;

    const mainWindow = document.getElementById('schematic-main-window');

    for (let zone in zones) {
        let maxElev = zones[zone]['MaxElev'];
        let minElev = zones[zone]['MinElev'];

        console.log(`${zone}: ${maxElev}, ${minElev}`);

        const newDiv = document.createElement('div');

        // Set class and inline styles
        newDiv.classList.add('schematic-zone');
        newDiv.style.left = `${x}%`;
        newDiv.style.bottom = `${2 + (minElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        newDiv.style.top = `${2 + (maxElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        newDiv.style.width = `${zoneWidth}%`;

        // Set innerHTML to zone
        newDiv.textContent = zone;

        mainWindow.appendChild(newDiv);
        x += zoneWidth + 10;
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
                document.getElementById('schematic-logo').innerHTML = '';
                document.getElementById('schematic-logo').appendChild(image);
            };

            reader.readAsDataURL(file);
        }
    });
    input.click();
}

let drawElevLines = function () {
    const maxElevRound = Math.ceil(maxElevVar / 10) * 10;
    const minElevRound = Math.floor(minElevVar / 10) * 10;
    const elevDiff = maxElevRound - minElevRound;
    elevIntVar = document.getElementById("schematic-elev-int").value;
    const numOfElev = elevDiff / elevIntVar + 1;
    locIntVar = 95 / numOfElev;

    let elevationsDiv = document.getElementById('schematic-elevations');
    let mainWindowDiv = document.getElementById('schematic-main-window');

    while (elevationsDiv.firstChild) {
        elevationsDiv.removeChild(elevationsDiv.firstChild);
    }

    while (mainWindowDiv.firstChild) {
        mainWindowDiv.removeChild(mainWindowDiv.firstChild);
    }

    for (let i = 0; i < numOfElev + 1; i++) {
        let elev = minElevRound + elevIntVar * i;
        let loc = 2 + locIntVar * i;

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
        const fileInput = document.getElementById('schematic-fileInput');
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
    cssLink.href = 'public/css/epanet-schematic.css';  // Replace with the path to your CSS file
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
    
    const numOfZones = document.getElementById('schematic-num-zones').value;

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

let drawSchematic = function () {
    
    let nodes = modelDict['JUNCTIONS'].data.map(row => [row[0]]);
    let pipes = modelDict['PIPES'].data.map(row => row.slice(0, 3));

    let zones = {};

    const adjacencyList = {};

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
            dfs(node[0], group);
            groups.push(group);
        }
    });

    const pumps = modelDict['PUMPS'].data;
    const tanks = modelDict['TANKS'].data;
    const reservoirs = modelDict['RESERVOIRS'].data;
    const valves = modelDict['VALVES'].data;
    const junctions = modelDict['JUNCTIONS'].data;

    let dict = modelDict;
    
    for (let g in groups) {
        for (let n in groups[g]) {
            console.log(groups[g][n])
        }
    }
    
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

let mapSchematic = function () {
    modelDict = createModelDict(modelText);
    [maxElevVar, minElevVar] = getMinMax(modelDict);
    drawElevLines();
    drawSchematic();
    pageMaxElev = maxElevVar;
    pageMinElev = minElevVar;
    let zones = assignZones(modelDict);
    drawZones(zones);
}

let setSchematicEventListeners = function () {
    document.getElementById('schematic-fileInput').addEventListener('change', async (event) => {
        modelText = await handleFile();
        mapSchematic();

        //drawSchematics();
        
        
        debugger
        
        /*
        drawTanks();
        drawPumps();
        drawValves();
        */
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
    document.getElementById('draw-btn').addEventListener('click', () => {
        drawElement(70, 50, 20, 20, 'psv')
    });
}

export {
    setSchematicEventListeners
};


