let modelText = '';
let modelDict = {};
let maxElevVar = 1000;
let minElevVar = 0;
let elevIntVar = 0;
let locIntVar = 0;

let zones = {};

let pageMinElev = '';
let pageMaxElev = '';

let schematicDict = {
    'PUMPS': {},
    'TANKS': {},
    'RESERVOIRS': {},
    'VALVES': {},
};

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


function drawElement(x, y, size, element, elev) {
    const elements = {
        'TANK': `
        <svg class="tank" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <ellipse cx="50" cy="70" rx="40" ry="12" fill="lightgrey" stroke="black" stroke-width="2"/>
            <rect x="10" y="30" width="80" height="40" fill="lightgrey" stroke="grey" stroke-width="2" stroke-dasharray="0 100 0 100"/>
            <ellipse cx="50" cy="30" rx="40" ry="12" fill="lightgrey" stroke="black" stroke-width="2"/>
            <polyline points="10,30 10,70" stroke="black" stroke-width="2" fill="none"/>
            <polyline points="90,30 90,70" stroke="black" stroke-width="2" fill="none"/>
        </svg>
        `,
        
        'PUMP': `
        <svg class="pump" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <rect x="10" y="60" width="40" height="30" fill="gray" stroke="black" stroke-width="2"/>
            <circle cx="60" cy="60" r="30" fill="gray" stroke="black" stroke-width="2"/> 
            <circle cx="60" cy="60" r="10" fill="gray" stroke="black" stroke-width="1"/>
        </svg>
        `,
        
        'PSV': `
        <svg class="psv" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <polyline points="50,50 50,75" stroke="black" stroke-width="2" fill="none"/>
            <circle cx="50" cy="75" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
        
        'PRV': `
        <svg class="prv" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <polyline points="50,50 50,25" stroke="black" stroke-width="2" fill="none"/>
            <circle cx="50" cy="25" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
        
        'FCV': `
        <svg class="fcv" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <polygon points="25,25 25,75 50,50" fill="black" />
            <polygon points="50,50 75,25 75,75" fill="black" />
            <circle cx="50" cy="50" r="10" fill="gray" stroke="black" stroke-width="2"/>
        </svg>
        `,
        
        'RESERVOIR': `
        <svg class="reservoir" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <polygon points="15,35 85,35 70,65 30,65" fill="brown" stroke="black" stroke-width="2" />
            <path d="M20 45 Q30 50, 40 45 T60 45 T80 45" fill="none" stroke="blue" stroke-width="3"/>
        </svg>
        `
    };    

    // Get the main screen div
    const mainScreen = document.getElementById('schematic-main-window');
    
    // Create a container div for the SVG
    const drawContainer = document.createElement('div');
    
    // Set the position and coordinates for the container using percentages
    drawContainer.style.position = 'absolute';
    drawContainer.style.left = `calc(${y} - ${size / 2}px)`;  // Offset left to center the container
    drawContainer.style.bottom = `calc(${x} - ${size / 2}px)`;  // Offset bottom to center the container
    drawContainer.style.width = `${size}px`;
    drawContainer.style.height = `${size}px`;
    
    // Center the SVG inside the container
    drawContainer.style.display = 'flex';
    drawContainer.style.alignItems = 'center';
    drawContainer.style.justifyContent = 'center';
    
    // Add the SVG content to the container
    drawContainer.innerHTML = elements[element];// + `<p>${elev}</p>`;
    
    // Append the container to the main screen div
    mainScreen.appendChild(drawContainer);
}



let drawZones = function () {
    debugger
    let numZones = Object.values(zones).filter(group => group.IsZone === 'Yes').length;
    let count = 1;
    let zoneWidth = 8;
    
    const mainWindow = document.getElementById('schematic-main-window');

    for (let zone in zones) {
        zones[zone]['avgElev'] = (parseFloat(zones[zone]['MaxElev']) + parseFloat(zones[zone]['MinElev'])) / 2;
    }

    
    for (let zone in zones) {
        if (zones[zone]['IsZone'] === 'Yes') {
            let maxElev = parseFloat(zones[zone]['MaxElev']);
            let minElev = parseFloat(zones[zone]['MinElev']);


            if (zones[zone]['IsZone'] === 'Yes') {
                let x = (((120 / (numZones + 1)) * (count) - 20) + zoneWidth) / 2;
                let y = ((2 + (maxElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)) + (2 + (minElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev))) / 2;
                
                zones[zone]['X'] = x;
                zones[zone]['Y'] = y;
                const newDiv = document.createElement('div');

                // Set class and inline styles
                newDiv.classList.add('schematic-zone');
                newDiv.style.left = `${(120 / (numZones + 1)) * (count) - 20}%`;
                newDiv.style.bottom = `${2 + (minElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
                newDiv.style.top = `${2 + (maxElev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
                newDiv.style.width = `${zoneWidth}%`;

                // Set innerHTML to zone
                newDiv.textContent = zone;

                mainWindow.appendChild(newDiv);
                count += 1;
            }
        }
    }

    for (let group in zones) {
        if (zones[group]['IsZone'] === 'No') {
            let zonesToAverage = [];
            let xAvg = 0;
            let zCount = 0;
            
            for (let catagory in schematicDict) {
                for (let element in schematicDict[catagory]) {
                    let upNode = schematicDict[catagory][element]['UpNode'];
                    let downNode = schematicDict[catagory][element]['DownNode'];
                
                    if (upNode === group && typeof downNode === 'string' && downNode.includes('Zone')) {
                        zonesToAverage.push(downNode);
                    } else if (downNode === group && typeof upNode === 'string' && upNode.includes('Zone')) {
                        zonesToAverage.push(upNode);
                    }
                }
            }
            
            for (let avgZone in zonesToAverage) {
                xAvg += zones[zonesToAverage[avgZone]]['X'];
                zCount += 1;

            }

            if (zCount != 0) {
                xAvg = xAvg / zCount;
            }
            
            const newDiv = document.createElement('div');
            zones[group]['X'] = xAvg;
            debugger
            zones[group]['Y'] = 2 + (zones[group]['avgElev'] - pageMinElev) * (93) / (pageMaxElev - pageMinElev);

            newDiv.classList.add('schematic-group-zone');
            newDiv.style.left = `${zones[group]['X']}%`;
            newDiv.style.bottom = `${zones[group]['Y']}%`;
            
            newDiv.innerHTML = group;

            mainWindow.appendChild(newDiv);
        }
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

let assignZones = function () {
    let filteredRows;
    let demand;
    let name;
    // Initialize an adjacency list to represent the graph
    //let reservoirs = modelDict['RESERVOIRS'].data.map(row => [row[0]]);
    //let pumps = modelDict['PUMPS'].data.map(row => [row[0]]);
    //let tanks = modelDict['TANKS'].data.map(row => [row[0]]);
    //let valves = modelDict['VALVES'].data.map(row => [row[0]]);
    let nodes = modelDict['JUNCTIONS'].data.map(row => [row[0]]);
    //let nodes = [...juncts, ...tanks, ...reservoirs];
    let pipes = modelDict['PIPES'].data.map(row => row.slice(0, 3));
    //pipes = [...pipes, ...pumps];//, ...valves];
    let demands = modelDict['DEMANDS'].data;

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
            dfs(node, group);
            groups.push(group);
        }
    });

    let zCounter = 1;
    let gCounter = 1;
    
    groups.forEach(group => {
        filteredRows = demands.filter(row => group.includes(row[0]));
        demand = filteredRows.reduce((sum, row) => sum + Number(row[1]), 0);
        
        if (demand > 0 || group.length > 50) {
            name = `Zone ${zCounter}`;
            zones[name] = {};
            zones[name]['IsZone'] = 'Yes';
            zCounter++;
        } else {
            name = `Group ${gCounter}`;
            zones[name] = {};
            zones[name]['IsZone'] = 'No';
            gCounter++;
        }

        zones[name]['JUNCTIONS'] = group;
        let maxElev = getMaxElevation(modelDict['JUNCTIONS'].data.map(row => [row[0], row[1]]), group);
        let minElev = getMinElevation(modelDict['JUNCTIONS'].data.map(row => [row[0], row[1]]), group);
        zones[name]['MaxElev'] = maxElev;
        zones[name]['MinElev'] = minElev;
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


let createSchematicDict = function () {
    let xLoc;
    let upElev;
    let downElev;
    let upNode;
    let downNode;
    let elev;

    const pumps = modelDict['PUMPS'].data;
    const tanks = modelDict['TANKS'].data;
    const reservoirs = modelDict['RESERVOIRS'].data;
    const valves = modelDict['VALVES'].data;
    //const pipes = modelDict['PIPES'].data;
    const junctions = modelDict['JUNCTIONS'].data;
    
    
    for (let pump in pumps) {
        upNode = null;
        downNode = null;

        let numPumps = pumps.length;
        upElev = junctions.find(row => row[0] === pumps[pump][1]) || null;
        downElev = junctions.find(row => row[0] === pumps[pump][2]) || null;
        elev = (parseFloat(upElev[1]) + parseFloat(downElev[1])) / 2;

        if (elev < pageMinElev) {
            xLoc = `2%`;
        } else {
            xLoc = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        }

        upNode = null;
        downNode = null;

        for (let zone in zones) {
            if (zones[zone]['JUNCTIONS'].includes(pumps[pump][1])){
                upNode =  zone;
            }
            if (zones[zone]['JUNCTIONS'].includes(pumps[pump][2])) {
                downNode =  zone;
            }
        }

        schematicDict['PUMPS'][pumps[pump][0]] = {
            'UpNode': upNode,
            'DownNode': downNode,
            'x': xLoc,
            'y': `${(95 / numPumps) * (parseFloat(pump) + 1)}%`,
            'size': 20,
            'elev': elev,
            'type': 'PUMP'
        }
    }

    for (let tank in tanks) {
        upNode = null;
        downNode = null;

        let numTanks = tanks.length;
        console.log(tank)
        //let pipeUp = pipes.find(row => row[1] === tanks[tank][0]) || null;
        //let pipeDown = pipes.find(row => row[2] === tanks[tank][0]) || null;

        elev = parseFloat(tanks[tank][1]);

        if (elev < pageMinElev) {
            xLoc = `2%`;
        } else {
            xLoc = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        }
        
        for (let zone in zones) {
            if (zones[zone]['JUNCTIONS'].includes(tanks[tank][0])) {
                downNode = zone;
            }
        }

        schematicDict['TANKS'][tanks[tank][0]] = {
            'UpNode': upNode,
            'DownNode': downNode,
            'x': xLoc,
            'y': `${(95 / numTanks) * (parseFloat(tank) + 1)}%`,
            'size': 20,
            'elev': elev,
            'type': 'TANK'
        };
    }
    
    for (let reservoir in reservoirs) {
        upNode = null;
        downNode = null;

        let numRes =reservoirs.length;
        //let pipeUp = pipes.find(row => row[1] === reservoirs[reservoir][0]) || null;
        //let pipeDown = pipes.find(row => row[2] === reservoirs[reservoir][0]) || null;

        elev = parseFloat(reservoirs[reservoir][1]);

        if (elev < pageMinElev) {
            xLoc = `2%`;
        } else {
            xLoc = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        }

        for (let zone in zones) {
            if (zones[zone]['JUNCTIONS'].includes(reservoirs[reservoir][0])) {
                downNode = zone;
            }
        }

        schematicDict['RESERVOIRS'][reservoirs[reservoir][0]] = {
            'UpNode': upNode,
            'DownNode': downNode,
            'x': xLoc,
            'y': `${(95 / numRes) * (parseFloat(reservoir) + 1)}%`,
            'size': 30,
            'elev': elev,
            'type': 'RESERVOIR'
        };
    }

    for (let valve in valves) {
        upNode = null;
        downNode = null;

        let numValves = valves.length;
        upElev = junctions.find(row => row[0] === valves[valve][1]) || null;
        downElev = junctions.find(row => row[0] === valves[valve][2]) || null;
        elev = (parseFloat(upElev[1]) + parseFloat(downElev[1])) / 2;

        if (elev < pageMinElev) {
            xLoc = `2%`;
        } else {
            xLoc = `${2 + (elev - pageMinElev) * (93) / (pageMaxElev - pageMinElev)}%`;
        }

        for (let zone in zones) {
            if (zones[zone]['JUNCTIONS'].includes(valves[valve][1])) {
                upNode = zone;
            }
            if (zones[zone]['JUNCTIONS'].includes(valves[valve][2])) {
                downNode = zone;
            }
        }

        schematicDict['VALVES'][valves[valve][0]] = {
            'UpNode': upNode,
            'DownNode': downNode,
            'x': xLoc,
            'y': `${(95 / numValves) * (parseFloat(valve) + 1)}%`,
            'size': 10,
            'elev': elev,
            'type': valves[valve][4]
        }
    }
}

let mapSchematic = function (zones) {
    drawElevLines();
    drawZones();

    for (let key in schematicDict) {
        for (let element in schematicDict[key]) {
            console.log(`Element: ${element}, x: ${schematicDict[key][element]['x']}, y: ${schematicDict[key][element]['y']}`)
            drawElement(schematicDict[key][element]['x'], schematicDict[key][element]['y'], schematicDict[key][element]['size'], schematicDict[key][element]['type'], schematicDict[key][element]['elev']);
        }
    }
}

let setSchematicEventListeners = function () {
    document.getElementById('schematic-fileInput').addEventListener('change', async (event) => {
        modelText = await handleFile();
        modelDict = createModelDict(modelText);
        [maxElevVar, minElevVar] = getMinMax(modelDict);
        
        pageMaxElev = maxElevVar;
        pageMinElev = minElevVar;

        zones = assignZones();

        createSchematicDict();
        mapSchematic();
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


