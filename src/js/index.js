var Points = [];
var pointsLength = Points.length;
var PointsVariant = [];
var Markers = [];
var selectedOperation = -1;// 0 - move marker; 1 - create marker; 2 - delete marker; 3 - redact marker
var delete_allowance = false;
var move_allowance = false;
var create_allowance = false;
var redact_allowance = false;
var currentShownTrackIndex = null;
var fileList = []
var xmlDoc_list = [];
var currentPosition = [];
var debug_info_handle = document.getElementById("debug_info");



const modal = document.getElementById('myModal');
const closeModalSpan = document.querySelector('.close');
const saveBtn = document.getElementById('saveBtn');

const timeModal = document.getElementById('timeModal');
const closeTimeModalSpan = document.querySelector('.time-close');
const saveTimeBtn = document.getElementById('saveTimeBtn');



document.querySelector('.scrollable-list').addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        event.currentTarget.scrollBy({
            top: event.deltaY,
            behavior: 'smooth'
        });
        event.preventDefault();
    }
});


function getCurrentPosition(){
    navigator.geolocation.getCurrentPosition(
        function(success) {
            debug_info_handle.innerHTML = "OK";
            currentPosition = [success.coords.latitude, success.coords.longitude]
            console.log(currentPosition);
            var marker = L.marker(currentPosition).addTo(myMap);
        },
        function(failure) {
            if(failure.message.indexOf("Only secure origins are allowed") == 0) {
                alert('Only secure origins are allowed by your browser.');
            }
        },
        {enableHighAccuracy:true}
    );
    
   
}



let myMap = L.map("map", {
    center: [51.505, -0.09],
    zoom: 20,
    preferCanvas: false,
    zoomControl: false,
    attributionControl:false,
    boxZoom:false,
    inertia:true,
    doubleClickZoom:false
}).setView([47.563, 24.1130], 3);

let baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 25,
        id: 'streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiY2hlcnRhbm92IiwiYSI6ImNscTVpOXE0ajBmaXYyam51ZTBwOW5hajgifQ.jnOJHSk2-HzMMg60vgCr1w'
    }).addTo(myMap);
baseLayer.myId = "Base";

L.control.attribution({
    position: "topleft"
}).addTo(myMap);


let zoomControls = L.control.zoom({
    position: "topright",
});
zoomControls.addTo(myMap);


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

hg.addData(geojson2);


let rightTopPanel = document.getElementsByClassName("leaflet-top leaflet-right")[0];


let markerIcon = document.createElement("span");
markerIcon.className = "fas fa-map-marker-alt";
let changeIcon = document.createElement("span");
changeIcon.className = "fas fa-exchange-alt";
let deleteIcon = document.createElement("span");
deleteIcon.className = "fas fa-trash";
let uploadIcon = document.createElement("span");
uploadIcon.className = "fas fa-upload";
let locationIcon = document.createElement("span");
locationIcon.className = "fas fa-search";
let redactIcon = document.createElement("span");
redactIcon.className = "fas fa-marker";




let moveMarkerElement = document.createElement("button");
let deleteMarkerElement = document.createElement("button");
let createMarkerElement = document.createElement("button");
let inputFileElement = document.createElement("button");
let currentLocationElement = document.createElement("button");
let changeMiscInfoElement = document.createElement("button");

moveMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
deleteMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
createMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
inputFileElement.className = "leaflet-bar-part leaflet-bar-part-single";
currentLocationElement.className = "leaflet-bar-part leaflet-bar-part-single";
changeMiscInfoElement.className = "leaflet-bar-part leaflet-bar-part-single";

moveMarkerElement.addEventListener("click", function(event) {
    selectedOperation = 0;
});
deleteMarkerElement.addEventListener("click", function(event) {
    selectedOperation = 2;
});
createMarkerElement.addEventListener("click", function(event) {
    selectedOperation = 1;
});
inputFileElement.addEventListener("click",clickDonwloadFile);
currentLocationElement.addEventListener("click",function(event) {
    findTimeMarker(currentShownTrackIndex);
});
changeMiscInfoElement.addEventListener("click", function(event) {
    selectedOperation = 3;
});
moveMarkerElement.appendChild(changeIcon);
deleteMarkerElement.appendChild(deleteIcon);
createMarkerElement.appendChild(markerIcon);
inputFileElement.appendChild(uploadIcon);
currentLocationElement.appendChild(locationIcon);
changeMiscInfoElement.appendChild(redactIcon);


let inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.id = "fileInput";
inputElement.name = "map_file";
inputElement.accept=".gpx,.kml";
inputElement.multiple="multiple";


const buttonsList = [currentLocationElement, moveMarkerElement, createMarkerElement, changeMiscInfoElement, deleteMarkerElement, inputFileElement, inputElement];




let divBarElement = document.createElement("div");
divBarElement.className = "leaflet-bar leaflet-control";

let divBarElementsList = [divBarElement.cloneNode(true), divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true)];

for (var i = 0; i < divBarElementsList.length; i++) {
    //divBarElementsList[i].id = "divId" + i;
    divBarElementsList[i].appendChild(buttonsList[i]);
    rightTopPanel.appendChild( divBarElementsList[i]);
}

changeButtonsAvailability(false);

divBarElementsList = [];
//console.log(divBarElementsList)


function clickDonwloadFile(){
    document.getElementById('fileInput').click();
}




let fileQueue = [];

function addToQueue(files) {
    fileQueue.push(...files);
    processFileQueue();
    
}


let readingInProgress = false;


function processFileQueue() {
    if (fileQueue.length > 0) {
        if (!readingInProgress) {
            const file = fileQueue.shift();
            readTrackFile(file);
        }
    }else{
        changeButtonsAvailability(true);
        displayPoints();
    }
}


function readGPXFile(xmlDoc){
    var pointsFromFile = [];
    var trackVariant = 0;

    var trkptElements = xmlDoc.getElementsByTagName('trkpt');
    for (var i = 0; i < trkptElements.length; i++) {
        var trkpt = trkptElements[i];
        if (i == 0){
            try {
                var time = new Date(trkpt.querySelector('time').textContent).getTime() / 1000;
                trackVariant = 1;
            }
            catch{};
        };

        var lat = trkpt.getAttribute('lat');
        var lon = trkpt.getAttribute('lon');
        var ele = trkpt.querySelector('ele').textContent;

        if (trackVariant) {
            var time = new Date(trkpt.querySelector('time').textContent).getTime() / 1000;
            pointsFromFile.push([Number(lon),Number(lat),Number(ele), Number(time)]);
        }
        else {
            pointsFromFile.push([Number(lon),Number(lat),Number(ele)]);
        }
    }
    return [pointsFromFile, trackVariant];
}



function readKMLFile(xmlDoc){
    var pointsFromFile = [];
    var trackVariant = 0;
    var timeCoordinates;

    try{
        timeCoordinates = xmlDoc.getElementsByTagName('when');
        var time = new Date(timeCoordinates[0].textContent).getTime() / 1000;
        trackVariant = 1;
    } catch{};

    var lineCoordinates = xmlDoc.getElementsByTagName('LineString')[0];
    var coordinates = lineCoordinates.getElementsByTagName('coordinates');
    
    for (var i = 0; i < coordinates.length; i++) {
        var coordText = coordinates[i].textContent.trim();
        var coordPairs = coordText.split(/\s+/);
        for (var j = 0; j < coordPairs.length; j++) {
            var parts = coordPairs[j].split(',');
            var lon = parseFloat(parts[0]);
            var lat = parseFloat(parts[1]);
            var ele = parseFloat(parts[2]);
            if (trackVariant) {
                var time = new Date(timeCoordinates[j].textContent).getTime() / 1000;
                pointsFromFile.push([Number(lon),Number(lat),Number(ele), Number(time)]);
            }else{
                pointsFromFile.push([Number(lon),Number(lat),Number(ele)]);
            }
        }
    }
    return [pointsFromFile, trackVariant];    
}


function readTrackFile(file){
    fileList.push(file);
    addInfoListItem(fileList.length-1);
    var reader = new FileReader();
    readingInProgress = true;

    reader.onload = function(e) {
        var xmlString = e.target.result;
        var fileType = getFileType(file.name);
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
         var fileCoordinatesInfo;

        xmlDoc_list.push(xmlDoc);
        select = document.getElementById("files");
        var opt = document.createElement('option');

        opt.value = Points.length;
        opt.innerHTML = Points.length;
        select.appendChild(opt);
       
        if (fileType === 'gpx') {
            fileCoordinatesInfo = readGPXFile(xmlDoc);
        } else if (fileType === 'kml') {
            fileCoordinatesInfo = readKMLFile(xmlDoc);
        } else {
            console.error('Unsupported file type');
        }
        
        Points.push(fileCoordinatesInfo[0]);
        PointsVariant.push(fileCoordinatesInfo[1]);

        readingInProgress = false;
        processFileQueue();
    };
    reader.readAsText(file);
}



$(document).ready(function(){
    $('input[name="map_file"]').change(function(input){
        var files = input.target.files;
        console.log("123");
        addToQueue(files);  
    });
});





function clearMap()
{
    //console.log("Cleared");
    myMap.eachLayer(function (layer) 
    {   if(layer.myId != "Base")
        myMap.removeLayer(layer);});
}

function clearFile(choice)
{
    //select = document.getElementById("files");
    //choice = select.options[select.selectedIndex].value;
    console.log(choice);
    console.log(Markers[choice]);
    Markers[choice].forEach((point) => myMap.removeLayer(point));
    //Markers.splice(choice,1);
    //Points.splice(choice,1);
    console.log(Points);
    //only visual part removed, to function as intended points an markers arrays must be removed as well 
}




function showWayPoint(location)
{
    //console.log([location[1], location[0]]);
    var icon = new L.Icon.Default();
    icon.options.shadowSize = [0,0];
    return new L.Marker([location[1], location[0]],{icon : icon});
    //console.log(location);
}




// function deleteMarker(){
//     delete_allowance = true;
//     move_allowance = false;
//     create_allowance = false;
//     redact_allowance = false;
// }


// function moveMarker(){
//     delete_allowance = false;
//     move_allowance = true;
//     create_allowance = false;
//     redact_allowance = false;
// }


// function createMarker(){
//     delete_allowance = false;
//     move_allowance = false;
//     create_allowance = true;
//     redact_allowance = false;
// }

// function redactMarker(){
//     delete_allowance = false;
//     move_allowance = false;
//     create_allowance = false;
//     redact_allowance = true;
// }


function reloadPath(points_index){
    let path = turf.lineString(Points[points_index]);
    pathLayer = L.geoJSON(path);
    pathLayer.addTo(myMap);
    Markers[points_index].push(pathLayer);
}


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


function moveMarkerOperation(clicked_marker, way_index, element_index){
    currentShownTrackIndex = way_index;
        focusOnTrack(way_index,true);
        clicked_marker.dragging.enable();
        clicked_marker.on("moveend",function(e){
            way_line = Markers[way_index].pop();
            myMap.removeLayer(way_line);
            e.target.dragging.disable();

            var temp = e.target;

            if (PointsVariant[way_index] == 1){
                Points[way_index].splice(element_index,1,[temp._latlng['lng'], temp._latlng['lat'],Points[way_index][element_index][2], Points[way_index][element_index][3]]);
            }else{

                Points[way_index].splice(element_index,1,[temp._latlng['lng'], temp._latlng['lat'],Points[way_index][element_index][2]]);
            };
            
            Markers[way_index].splice(element_index,1,temp);

            reloadPath(way_index);
            currentShownTrackIndex = way_index;
            focusOnTrack(way_index,true);
        });
}


function createMarkerOperation(clicked_marker, way_index, element_index){
    myMap.once('click', function(e){
        way_line = Markers[way_index].pop();
        myMap.removeLayer(way_line);
        var temp = [e.latlng['lng'],e.latlng['lat']];
        Points[way_index].splice(element_index+1,0,temp);
        var marker_t = showWayPoint(temp);
        var heightNewMarker = 0
        try {
            heightNewMarker = (Points[way_index][element_index+2][2] + Points[way_index][element_index][2]) / 2;
        }catch{
            heightNewMarker = Points[way_index][element_index][2];
        }

        if (PointsVariant[way_index] == 1){
            var timeNewMarker = 0;
            try{
                timeNewMarker = Math.round((Points[way_index][element_index+2][3] + Points[way_index][element_index][3]) / 2);
            }catch{
                timeNewMarker = Points[way_index][element_index][3];
            }
            Points[way_index][element_index+1].push(heightNewMarker,timeNewMarker);
        }else{
            Points[way_index][element_index+1].push(heightNewMarker);
        };

        Markers[way_index].splice(element_index+1,0,marker_t);
        marker_t.addTo(myMap);
        marker_t.on('click', markerClick);

        reloadPath(way_index);
        currentShownTrackIndex = way_index;
        focusOnTrack(way_index,true);
    });
}


function redactMarkerOperation(clicked_marker, way_index, element_index){
    disableMap();
    document.getElementById('input1').value = Points[way_index][element_index][2];
    
    const output = document.getElementById('valueDisplay');
    var input2 = 0;
    if (PointsVariant[way_index] == 1){

        input2 = document.getElementById('input2');

        if (element_index === 0){
            input2.min = Points[way_index][element_index][3]-500;
        }else {
            input2.min = Points[way_index][element_index-1][3]+1;
        }

        if (element_index === Points[way_index].length-1){
            input2.max = Points[way_index][element_index][3]+500;
        }else {
            input2.max = Points[way_index][element_index+1][3]-1;
        }

        input2.value = Points[way_index][element_index][3]; 
    }else{
        document.getElementById('timeRedact').style.display = "none";
    }

    modal.style.display = 'block';

    closeModalSpan.addEventListener('click', () => {
        modal.style.display = 'none';
        enableMap();
    }, { once: true });

    modal.addEventListener('click', (event) => {
        event.stopPropagation(); 
    });
    

    saveBtn.addEventListener('click', () => {
        const input1 = document.getElementById('input1').value;
        const input2 = document.getElementById('input2').value;
        Points[way_index][element_index][2] = input1;

        if (PointsVariant[way_index] == 1){
            Points[way_index][element_index][3] = input2;
        }
        currentShownTrackIndex = way_index;
        focusOnTrack(way_index,true);
        modal.style.display = 'none';

        enableMap();
    }, { once: true });

    output.innerHTML = input2.value;
    input2.oninput = function() {
        output.innerHTML = this.value;
    }

    currentShownTrackIndex = way_index;
    focusOnTrack(way_index,true);
}

function deleteMarkerOperation(clicked_marker, way_index, element_index){
    myMap.removeLayer(clicked_marker);
    Points[way_index].splice(element_index,1);
    Markers[way_index].splice(element_index,1);

    way_line = Markers[way_index].pop();
    myMap.removeLayer(way_line);
    focusOnTrack(way_index,true);
    reloadPath(way_index);
}


function markerClick(e){
    var clicked_marker = e.target;
    var way_index = 0;
    var element_index = -1;

    for(var i = 0;i < Markers.length; i++){
            
        if (Markers[i].includes(clicked_marker)){
            way_index = i;
            element_index = Markers[way_index].findIndex((marker)=>marker ===clicked_marker );
        }
    }

    if (selectedOperation === 2){
        deleteMarkerOperation(clicked_marker, way_index, element_index);
    }
    else if (selectedOperation === 0){
        moveMarkerOperation(clicked_marker, way_index, element_index);
    }
    else if (selectedOperation === 1){
        createMarkerOperation(clicked_marker, way_index, element_index);
    }
    else if (selectedOperation === 3){
        redactMarkerOperation(clicked_marker, way_index, element_index)   
    }

    selectedOperation = -1;
}


function displayPoints()
{
    for (let j = pointsLength; j< Points.length; j++){
        Markers.push([]);
        
        for (let i = 0; i < Points[j].length; i++)
        {
            
            marker = showWayPoint(Points[j][i]);
            Markers[j].push(marker);
            marker.addTo(myMap);
            marker.on('click', markerClick); //must be altered to make all markers draggable if clicked change position of markers, and define item alias for certain ways
            
        }
        reloadPath(j);
    }

    pointsLength = Points.length;
}


function changeButtonsAvailability(ifEnable){
    if (ifEnable){
        moveMarkerElement.disabled = false;
        moveMarkerElement.classList.remove('faded');

        deleteMarkerElement.disabled = false;
        createMarkerElement.disabled = false;
        currentLocationElement.disabled = false;
        changeMiscInfoElement.disabled = false;

        deleteMarkerElement.classList.remove('faded');
        createMarkerElement.classList.remove('faded');
        currentLocationElement.classList.remove('faded');
        changeMiscInfoElement.classList.remove('faded');

    }else{
        moveMarkerElement.disabled = true;
        moveMarkerElement.classList.add('faded');

        deleteMarkerElement.disabled = true;
        createMarkerElement.disabled = true;
        currentLocationElement.disabled = true;
        changeMiscInfoElement.disabled = true;

        deleteMarkerElement.classList.add('faded');
        createMarkerElement.classList.add('faded');
        currentLocationElement.classList.add('faded');
        changeMiscInfoElement.classList.add('faded');

    }
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

        const textElementsWithFillAndKm = Array.from(textElements).filter(element => 
        element.hasAttribute('fill') && element.textContent.includes('km')
        );

        textElementsWithFillAndKm.forEach(element => {
            element.textContent = element.textContent.replace('km', 'min');
        });
    }
}





function getFileType(fileName) {
    var extension = fileName.split('.').pop().toLowerCase();
    //console.log(extension);
    if (extension === 'gpx' || extension === 'kml') {
        return extension;
    } else {
        return null;
    }
}





function save(i)
{
    var savingFile = fileList[i];
    var extension = savingFile.name.split('.').pop().toLowerCase();
    console.log(extension);
    let content = "";
    if (extension === "gpx"){
        if (PointsVariant[i] === 0){
            for(point of Points[i])
            {
                content += `\n<trkpt lat="${point[1]}" lon="${point[0]}">
                <ele>${point[2]}</ele>
                </trkpt>`;
            }
        } else if(PointsVariant[i] === 1) {
            for(point of Points[i])
                {
                    var timeStamp = new Date(point[3]*1000).toISOString();
                    var formatedTimeStamp = timeStamp.split('.')[0] + 'Z';
                    content += `\n<trkpt lat="${point[1]}" lon="${point[0]}">
                    <ele>${point[2]}</ele>
                    <time>${formatedTimeStamp}</time>
                    </trkpt>`;
                }
        }
        xmlDoc_list[i].getElementsByTagName("trkseg")[0].innerHTML = content;
    }else if(extension === "kml"){
        console.log(Points);
        console.log(xmlDoc_list[i].getElementsByTagName('LineString')[0]);
        if (PointsVariant[i] === 0){
            for(point of Points[i]){
                content += `${point[0]},${point[1]},${point[2]} `
            }
        } else if(PointsVariant[i] === 1) {
            var j = 0;
            
            for(point of Points[i]){
                var timeStamp = new Date(point[3]*1000).toISOString();
                var formatedTimeStamp = timeStamp.split('.')[0] + 'Z';
                content += `${point[0]},${point[1]},${point[2]}\n`;
                xmlDoc_list[i].getElementsByTagName('when')[j].innerHTML = formatedTimeStamp;
                j++;
            }
            content = `\n<tessellate>1</tessellate>\n<coordinates>\n${content}</coordinates>\n`;
        }
        xmlDoc_list[i].getElementsByTagName('LineString')[0].innerHTML = content;
    }
    
    download(i,extension);
}

function download(index,extension) 
{
    var savingFile = fileList[index];
    var fileName = savingFile.name.split('.')[0];
    console.log(fileName);
    console.log(xmlDoc_list[index]);
    let serializer = new XMLSerializer();
    let stringXML = serializer.serializeToString(xmlDoc_list[index]);
    if (extension === "gpx"){
        var blob = new Blob([stringXML], { type: 'gpx-file' });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `${fileName}_updated.gpx`;
        a.click();
    }
    else  if (extension === "kml"){
        var blob = new Blob([stringXML], { type: 'kml-file' });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `${fileName}_updated.kml`;
        a.click();
    };
};




function setElevationProfileStyle() {

    const width451 = window.matchMedia('(min-width: 451px)');
    const width450 = window.matchMedia('(max-width: 450px)');
    let w = window.outerWidth;
    let h = window.outerHeight;
    let txt = "Window size: width=" + w + ", height=" + h;
    //console.log(txt);
    //if (!this.elevation_input.checked) return;

    if (width450.matches) {
        graph.style.gridColumn = '1 / span 2';
        graph.style.gridRow = '1 / span 1';
        hg.resize({ width: hg._width, height: 120 });
    }else{
        graph.style.gridColumn = '2 / span 2';
        graph.style.gridRow = '1 / span 1';
        hg.resize({ width: hg._width, height: 167 });
    }

    if (graph) graph.style.display = 'none';
    //this.slide_container.style.display = 'none';
    //this.trace_info_grid.style.width = 'max-content';

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var embedding = urlParams.has('embed');

    var gridHandle = document.getElementById('information-grid');

    var map_width = myMap._container.offsetWidth;
    var info_width = 0;// gridHandle.offsetWidth;
    var info_height =0;// gridHandle.offsetHeight;
    var elevation_profile_width = Math.min(map_width - info_width, map_width * 4 / 5);
    var elevation_profile_height = Math.min(info_height, embedding ? 120 : 160);

    //console.log(map_width);
    // console.log("Info about variables:");
    // console.log("map_width: "+map_width);
    // console.log("info_width: "+info_width);
    // console.log("info_height: "+info_height);
    // console.log("elevation_profile_width: "+ elevation_profile_width);
    // console.log("elevation_profile_height: "+ elevation_profile_height);

    var graphCell = Math.ceil(changeToHeightToLength.offsetWidth/9*10 + changeToHeightToTime.offsetWidth/9*10);
    //console.log(graphCell.textContent);
    // console.log(graphCell);
    // console.log(changeToHeightToLength.offsetWidth);
    // console.log(changeToHeightToTime.offsetWidth)



    if (graphCell != hg._width || elevation_profile_height != hg._height) {
       
        if(graphCell > 100){
        hg.resize({ width: graphCell, height: elevation_profile_height });}
    }

    if (graph) graph.style.display = '';
    document.getElementById("selectionText").textContent = " ";
    //if (!embedding) this.slide_container.style.display = '';
    //this.trace_info_grid.style.width = '';

};


//window.addEventListener('resize', setElevationProfileWidth());


function disableMap() {
    
    myMap.dragging.disable();
    myMap.touchZoom.disable();
    myMap.doubleClickZoom.disable();
    myMap.scrollWheelZoom.disable();
    myMap.boxZoom.disable();
    //myMap.disable();
    if (myMap.tap) myMap.tap.disable();
};

function enableMap() {
    
    myMap.dragging.enable();
    myMap.touchZoom.enable();
    myMap.doubleClickZoom.enable();
    myMap.scrollWheelZoom.enable();
    myMap.boxZoom.enable();
    //this.zoom.enable();
    if (myMap.tap) myMap.tap.enable();
};


let controlDiv = document.querySelector('.leaflet-bottom');

controlDiv.addEventListener("mouseover", disableMap());
controlDiv.addEventListener("mouseout", enableMap());

setTimeout(setElevationProfileStyle,250);
        


//L.DomEvent.on(controlDiv, 'mouseover', disableMap());
//L.DomEvent.on(controlDiv, 'mouseout', enableMap());


// openModalBtn.addEventListener('click', () => {
//     // Set default values for input fields
//     document.getElementById('input1').value = 'Default Value 1';
//     document.getElementById('input2').value = 'Default Value 2';
    
//     modal.style.display = 'block';
// });

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// saveBtn.addEventListener('click', () => {
//     const input1 = document.getElementById('input1').value;
//     const input2 = document.getElementById('input2').value;
//     console.log('Input 1:', input1);
//     console.log('Input 2:', input2);
//     modal.style.display = 'none';
// });


function getUniqueDaysFromTimestamps(timestamps) {
    const daysSet = new Set();

    timestamps.forEach(seconds => {
        // Convert seconds to milliseconds (Date constructor requires milliseconds)
        const date = new Date(seconds * 1000);
        
        // Extract the year, month, and day
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = date.getUTCDate().toString().padStart(2, '0');
        
        // Create a string in the format 'YYYY-MM-DD'
        const dayString = `${year}-${month}-${day}`;
        
        // Add the day string to the set
        daysSet.add(dayString);
    });

    return daysSet;
}


function convertTimestamps(timestamps) {
    const result = {};
  
    timestamps.forEach(ts => {
      const date = new Date(ts * 1000);
      const dateString = date.toISOString().split('T')[0];
      const timeString = date.toISOString().split('T')[1].slice(0, 8);
  
      if (!result[dateString]) {
        result[dateString] = [];
      }
      result[dateString].push(timeString);
    });
  
    return result;
}


function addOptions(selectElement, options) {
    // Удаляем все текущие опции
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }
    // Добавляем новые опции
    options.forEach(function(optionText) {
        var option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        selectElement.appendChild(option);
    });
}


function findTimeMarker(trackIndex){

    disableMap();
    //document.getElementById('input1').value = Points[way_index][element_index][2];
    
    //document.getElementById('input2').value = 'Default Value 2';
    //Points[way_index][element_index];
    var points_time_list = Points[trackIndex];

    var dateSelect = document.getElementById('datepicker');

    var selectedDate = dateSelect.value;

    const fourthElements = points_time_list.map(subArray => subArray[3]);

    //console.log(fourthElements);

    const uniqueDays = getUniqueDaysFromTimestamps(fourthElements);

    const uniqueDaysArray = Array.from(uniqueDays);

    const dateTimes = convertTimestamps(fourthElements);
    //console.log(converted);

    function available(date) {
        var dateString = $.datepicker.formatDate('yy-mm-dd', date);
        return [uniqueDaysArray.includes(dateString)];
    }

    var defaultDate = uniqueDaysArray[0];
    var dateSelect = document.getElementById('datepicker');
    var timeSelect = document.getElementById('timeSelect');

    $("#datepicker").datepicker({
        beforeShowDay: available,
        dateFormat: 'yy-mm-dd',
        defaultDate: defaultDate,
        onSelect: function(dateText) {
            selectedDate = dateText; // Save selected date to variable
            addOptions(timeSelect, dateTimes[selectedDate] || []);
            //console.log("Selected date: " + selectedDate);
            // You can do whatever you want with the selected date here
        }
    });


    // Инициализация времени для первой даты по умолчанию
    //addOptions(timeSelect, dateTimes[dateSelect.value]);


    timeModal.style.display = 'block';

    closeTimeModalSpan.addEventListener('click', () => {
        timeModal.style.display = 'none';
        enableMap();
    }, { once: true });

    timeModal.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the window
    });


    saveTimeBtn.addEventListener('click', () => {
        const hours_value = timeSelect.value;
        const selectedTotalTime = selectedDate+"T"+hours_value+"Z";
        console.log(selectedTotalTime);

        var time = new Date(selectedTotalTime).getTime() / 1000;
        console.log(time);

        var timeIndex = fourthElements.findIndex((timestamp_item)=> timestamp_item === time);
        //console.log(fourthElements);
        console.log(timeIndex);

        console.log(Markers[trackIndex][timeIndex]);
        console.log(Points[trackIndex][timeIndex]);

        for (var i = 0; i < Markers[trackIndex].length - 1; i++) {
            Markers[trackIndex][i].setOpacity(0);
        }

        

        Markers[trackIndex][timeIndex].setOpacity(1);

        myMap.flyTo([Points[trackIndex][timeIndex][1], Points[trackIndex][timeIndex][0]],17);
        
        //const input2 = document.getElementById('input2').value;

        // Points[way_index][element_index][2] = input1;

        // if (PointsVariant[way_index] == 1){
        //     Points[way_index][element_index][3] = input2;
        // }

        // // console.log('Input 1:', input1);
        // // console.log('Input 2:', input2);
        // currentShownTrackIndex = way_index;
        //focusOnTrack(way_index,true);
        timeModal.style.display = 'none';

        enableMap();
    }, { once: true });
}