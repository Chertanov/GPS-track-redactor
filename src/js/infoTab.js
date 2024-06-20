const colorMappings = {
    steepness: {
        '0': {
            text: '0%',
            color: '#ffcc99'
        },
        '1': {
            text: '1-3%',
            color: '#F29898'
        },
        '2': {
            text: '4-6%',
            color: '#E07575'
        },
        '3': {
            text: ' ',
            color: '#52CF53'
        },
        '4': {
            text: '10-15%',
            color: '#BE312F'
        },
        '5': {
            text: '16%+',
            color: '#AD0F0C'
        }
    },
    
};


let hg = L.control.heightgraph({expandControls: false,height:180, width:800, 
    mappings: colorMappings,
    translation: {
    distance: "Distance/Time",
    elevation: "Elevation",
    segment_length: "Total length",
    type: "Type",
    legend: " "
    },
});

hg.addTo(myMap);

let graph = document.getElementsByClassName("heightgraph")[0];

graph.style.gridColumn = '2 / span 2';
graph.style.gridRow = '1 / span 1';


let destination = document.getElementById("information-grid");
destination.appendChild(graph);


let changeToHeightToLength = document.createElement("button");
changeToHeightToLength.className = "btn btn-outline-dark change-button leaflet-control";
changeToHeightToLength.id = "height-length";
changeToHeightToLength.textContent = "Change to Height/Length graph";
changeToHeightToLength.addEventListener("click", function(event) {
    focusOnTrack(currentShownTrackIndex, true);
});


let changeToHeightToTime = document.createElement("button");
changeToHeightToTime.className = "btn btn-outline-dark change-button";
changeToHeightToTime.id = "height-time";
changeToHeightToTime.textContent = "Change to Height/Time graph";
changeToHeightToTime.addEventListener("click", function(event) {
    focusOnTrack(currentShownTrackIndex, false);
});

destination.appendChild(changeToHeightToLength);
destination.appendChild(changeToHeightToTime);


changeToHeightToLength.disabled = true;
changeToHeightToLength.classList.add('faded');
changeToHeightToTime.disabled = true;
changeToHeightToTime.classList.add('faded');


const geojson2 = [{
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [0, 0, 0],
                    
                ]
            },
            "properties": {
                "attributeType": "3"
            }
        }],
        "properties": {
            "Creator": "OpenRouteService.org",
            "records": 2,
            "summary": "steepness"
        }
    }]




function pointsToGeoJSON(points_list, type) {
    let geojson = null;

    if (type){
        geojson = [{
      type: "FeatureCollection",
      features: [{
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: points_list.map(point => {return point})
          },
          properties: {"attributeType": "3"}
        }],
      properties: {
                "Creator": "GPS-Track-Redactor",
                "records": 1,
                "summary": "steepness"
            }
    }];
    } else{
        const fourthElements = points_list.map(subArray => subArray[3]);
        let minTimeValue = fourthElements.reduce((acc, current) => Math.min(acc, current));

       geojson = [{
      type: "FeatureCollection",
      features: [{
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: points_list.map(point => {return [(point[3] - minTimeValue)/60/19.305, Number(100), point[2]]})
          },
          properties: {"attributeType": "3"}
        }],
      properties: {
                "Creator": "GPS-Track-Redactor",
                "records": 1,
                "summary": "steepness"
            }
    }]; 
    };

    return geojson;
}


function addInfoListItem(addIndex){

    fileInfoHandle = fileList[addIndex];

    let saveIcon = document.createElement("span");
    saveIcon.className = "fas fa-save";

    let deleteIconBottom = document.createElement("span");
    deleteIconBottom.className = "fas fa-trash";

    let buttonChoice = document.createElement("button");
    buttonChoice.className = "button-main";
    buttonChoice.textContent = fileInfoHandle.name;
    buttonChoice.addEventListener("click", function(event) {
        currentShownTrackIndex = addIndex;

        const pathElements = document.querySelectorAll('path.leaflet-interactive');

        pathElements.forEach(path => {
            path.style.display = "none";
        });

        myMap.on("moveend", () => {
            pathElements.forEach(path => {
                path.style.display = "block";
        });})

        myMap.flyTo([Points[addIndex][0][1], Points[addIndex][0][0]],10);


        focusOnTrack(addIndex, true);
        for (var i = 0; i < Markers[currentShownTrackIndex].length - 1; i++) {
            Markers[currentShownTrackIndex][i].setOpacity(1);
        }


    });

    let divPointItemButtons = document.createElement("div");
    divPointItemButtons.className = "button-group";

    let buttonSave = document.createElement("button");
    buttonSave.className = "button-secondary";
    buttonSave.appendChild(saveIcon);
    buttonSave.addEventListener("click", function(event) {
        currentShownTrackIndex = addIndex;
        save(addIndex);
    });

    let buttonDelete = document.createElement("button");
    buttonDelete.className = "button-secondary";
    buttonDelete.appendChild(deleteIconBottom);
    buttonDelete.addEventListener("click", function(event) {
        currentShownTrackIndex = null;
        clearFile(addIndex);
        const listItemToDelete = this.closest("li");
        listItemToDelete.remove();

        var ulElement = document.getElementById('infoList');
        var liElements = ulElement.getElementsByTagName('li');
        var numberOfItems = liElements.length;
        if (numberOfItems <= 0){
            changeToHeightToLength.disabled = true;
            changeToHeightToLength.classList.add('faded');
            changeToHeightToTime.disabled = true;
            changeToHeightToTime.classList.add('faded');
            changeButtonsAvailability(false);
        }
    });

    divPointItemButtons.appendChild(buttonSave);
    divPointItemButtons.appendChild(buttonDelete);

    let infoListItem = document.createElement("li");
    infoListItem.appendChild(buttonChoice);
    infoListItem.appendChild(divPointItemButtons);

    liHandle = document.getElementById("infoList");
    liHandle.appendChild(infoListItem);
    setElevationProfileStyle();
}

function focusOnTrack(trackIndex, trackType){
    geojson_points1 = pointsToGeoJSON(Points[trackIndex], trackType);
    hg.addData(geojson_points1);
    let steepness = document.getElementById("selectionText");
    steepness.textContent = "";


    if (PointsVariant[trackIndex] === 0){
        changeToHeightToLength.disabled = false;
        changeToHeightToLength.classList.remove('faded');
        changeToHeightToTime.disabled = true;
        changeToHeightToTime.classList.add('faded');
    }
    else {
        changeToHeightToLength.disabled = false;
        changeToHeightToLength.classList.remove('faded');
        changeToHeightToTime.disabled = false;
        changeToHeightToTime.classList.remove('faded');
    }

    if (!trackType){
        const textElements = document.querySelectorAll('text');

        const hiddentTextElements = document.querySelectorAll('tspan');
    
        hiddentTextElements.forEach(element => {
            element.textContent = element.textContent.replace('km', 'min');
        });

        const textElementsWithFillAndKm = Array.from(textElements).filter(element => 
        element.hasAttribute('fill') && element.textContent.includes('km')
        );

        textElementsWithFillAndKm.forEach(element => {
            element.textContent = element.textContent.replace('km', 'min');
        });
    }
}

function setElevationProfileStyle() {
    const width450 = window.matchMedia('(max-width: 450px)');
    
    if (width450.matches) {
        var ulElement = document.getElementById('infoList');
        var liElements = ulElement.getElementsByTagName('li');
        var numberOfItems = liElements.length;
        if (numberOfItems <= 0){
            controlDiv.style.display = "none";
        }else{
            controlDiv.style.display = "block";
        }
        graph.style.gridColumn = '1 / span 2';
        graph.style.gridRow = '1 / span 1';
        hg.resize({ width: hg._width, height: 120 });
    }else{
        graph.style.gridColumn = '2 / span 2';
        graph.style.gridRow = '1 / span 1';
        hg.resize({ width: hg._width, height: 167 });
    }

    if (graph) graph.style.display = 'none';


    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var embedding = urlParams.has('embed');

    var info_height =0;

    var elevation_profile_height = Math.min(info_height, embedding ? 120 : 160);

    var graphCell = Math.ceil(changeToHeightToLength.offsetWidth/9*10 + changeToHeightToTime.offsetWidth/9*10);

    if (graphCell != hg._width || elevation_profile_height != hg._height) {

        if(graphCell > 100){
        hg.resize({ width: graphCell, height: elevation_profile_height });}
    }

    if (graph) graph.style.display = '';
    document.getElementById("selectionText").textContent = " ";
};

controlDiv.addEventListener("mouseover", disableMap());
controlDiv.addEventListener("mouseout", enableMap());

//setTimeout(setElevationProfileStyle,250);


window.onload = function (){
    $('input[name="map_file"]').change(function(input){
        var files = input.target.files;
        
        addToQueue(files);  
    });
    setTimeout(setElevationProfileStyle,250);
    changeButtonsAvailability(false);
    hg.addData(geojson2);

    window.addEventListener('resize',setElevationProfileStyle);
};