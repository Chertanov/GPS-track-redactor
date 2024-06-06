// xmlDoc(s) must be saved as array to work properly in save() and download() functions
// 
// 
// 
// 

  
//import L from "leaflet";



var Points = [];
var Markers = [];
var delete_allowance = false;
var move_allowance = false;
var create_allowance = false;
var currentShownTrackIndex = null;
var fileList = []
var xmlDoc_list = [];
//var currentPositionhandle = window.navigator;
var currentPosition = [];
var debug_info_handle = document.getElementById("debug_info");





document.querySelector('.scrollable-list').addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        event.currentTarget.scrollBy({
            top: event.deltaY,
            behavior: 'smooth'
        });
        event.preventDefault();
    }
});

// function setCurrentPosition(success){
//     currentPosition = [success.coords.latitude, success.coords.longitude]
// }

// currentPositionhandle.geolocation.getCurrentPosition(setCurrentPosition);
//console.log(currentPosition);
//console.log(currentPosition);






function getCurrentPosition(){

    // currentPositionhandle.geolocation.getCurrentPosition(function (success){
    //     debug_info_handle.innerHTML = "OK";
    //     currentPosition = [success.coords.latitude, success.coords.longitude]
    //     console.log(currentPosition);
    //     var marker = L.marker(currentPosition).addTo(myMap);
    // },
    // function (error){
    //     alert(error.message);
    //     debug_info_handle.innerHTML = error.message;
    // });

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
    attributionControl:true,
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




let zoomControls = L.control.zoom({
    position: "topright",
});
zoomControls.addTo(myMap);


let hg = L.control.heightgraph({expandControls: false,height:180, width:800, translation: {
    distance: "Distance",
    elevation: "Elevation",
    segment_length: "Segment length",
    type: "Type",
    legend: " "
    }});

hg.addTo(myMap);

let graph = document.getElementsByClassName("heightgraph")[0];

graph.style.gridColumn = '2 / span 2';
graph.style.gridRow = '1 / span 1';


let destination = document.getElementById("information-grid");
destination.appendChild(graph);


let changeToHeightToLength = document.createElement("button");
changeToHeightToLength.className = "change-button leaflet-control";
changeToHeightToLength.style.gridColumn = '2 / span 1';
changeToHeightToLength.gridRow = '2 / span 1';
changeToHeightToLength.textContent = "Change to Height/Length graph";
changeToHeightToLength.addEventListener("click", function(event) {
    focusOnTrack(currentShownTrackIndex, true);
});

//moveMarkerElement.className = "";
//moveMarkerElement.addEventListener("click",moveMarker);

let changeToHeightToTime = document.createElement("button");
changeToHeightToTime.className = "change-button";
changeToHeightToTime.style.gridColumn = '3 / span 1';
changeToHeightToTime.gridRow = '2 / span 1';
changeToHeightToTime.textContent = "Change to Height/Time graph";
changeToHeightToTime.addEventListener("click", function(event) {
    focusOnTrack(currentShownTrackIndex, false);
});

destination.appendChild(changeToHeightToLength);
destination.appendChild(changeToHeightToTime);


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



let locateControl = L.control.locate({
    position: 'topright',  // Position of the locate control
    setView: 'once',       // Automatically sets the map view (options: 'once', 'always', false)
    keepCurrentZoomLevel: true,
    strings: {
        title: "Show current position",  // Title of the locate button

    }
});
locateControl.addTo(myMap);


let locateControlElements = document.getElementsByClassName("leaflet-control-locate-location-arrow");
;
for (var i = 0; i < locateControlElements.length; i++) {
    locateControlElements[i].classList.add("fas");
    locateControlElements[i].classList.add("fa-crosshairs");
    locateControlElements[i].classList.remove("leaflet-control-locate-location-arrow");
}

let rightTopPanel = document.getElementsByClassName("leaflet-top leaflet-right")[0];


let markerIcon = document.createElement("span");
markerIcon.className = "fas fa-map-marker-alt";
let changeIcon = document.createElement("span");
changeIcon.className = "fas fa-exchange-alt";
let deleteIcon = document.createElement("span");
deleteIcon.className = "fas fa-trash";
let uploadIcon = document.createElement("span");
uploadIcon.className = "fas fa-upload";




let moveMarkerElement = document.createElement("button");
let deleteMarkerElement = document.createElement("button");
let createMarkerElement = document.createElement("button");
let inputFileElement = document.createElement("button");
moveMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
deleteMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
createMarkerElement.className = "leaflet-bar-part leaflet-bar-part-single";
inputFileElement.className = "leaflet-bar-part leaflet-bar-part-single";
moveMarkerElement.addEventListener("click",moveMarker);
deleteMarkerElement.addEventListener("click",deleteMarker);
createMarkerElement.addEventListener("click",createMarker);
inputFileElement.addEventListener("click",clickDonwloadFile);
moveMarkerElement.appendChild(changeIcon);
deleteMarkerElement.appendChild(deleteIcon);
createMarkerElement.appendChild(markerIcon);
//createMarkerElement.textContent = "Create Marker";
inputFileElement.appendChild(uploadIcon);


let inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.id = "fileInput";
inputElement.name = "map_file";
inputElement.accept=".gpx,.kml";
inputElement.multiple="multiple";


const buttonsList = [moveMarkerElement, createMarkerElement, deleteMarkerElement, inputFileElement, inputElement,];




let divBarElement = document.createElement("div");
divBarElement.className = "leaflet-bar leaflet-control";

let divBarElementsList = [divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true),divBarElement.cloneNode(true)];

for (var i = 0; i < divBarElementsList.length; i++) {
    //divBarElementsList[i].id = "divId" + i;
    divBarElementsList[i].appendChild(buttonsList[i]);
    rightTopPanel.appendChild( divBarElementsList[i]);
}

divBarElementsList = [];
console.log(divBarElementsList)


function clickDonwloadFile(){
    document.getElementById('fileInput').click();
}


//appendChild(deleteMarker).appendChild(createMarker);
// $(document).ready(function(){
//     $('input[name="map_file"]').change(function(input){
//         var file = input.target.files[0];
//         Points = [];
//         var reader = new FileReader();
//         console.log("123");

//         reader.onload = function(e) {
//             var xmlString = e.target.result;
//             console.log("pretype");
//             var fileType = getFileType(file.name);
//             console.log('posttype');
//             var parser = new DOMParser();
//             var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
//             if (fileType === 'gpx') {
//                 var trkptElements = xmlDoc.getElementsByTagName('trkpt');
//                 //Points = new Array(trkptElements.length);
//                 for (var i = 0; i < trkptElements.length; i++) {
//                     var trkpt = trkptElements[i];
//                     var lat = trkpt.getAttribute('lat');
//                     var lon = trkpt.getAttribute('lon');
//                     Points.push([Number(lon),Number(lat)]);
//                     //console.log([Number(lon),Number(lat)]);
//                     //console.log('Latitude:', lat, 'Longitude:', lon);
//                     // You can process each trkpt element here
//                 }
//             } else if (fileType === 'kml') {
//                 var coordinates = xmlDoc.getElementsByTagName('coordinates');
//                 //Points = new Array(coordinates.length);
//                 for (var i = 0; i < coordinates.length; i++) {
//                     var coordText = coordinates[i].textContent.trim();
//                     var coordPairs = coordText.split(/\s+/);
//                     for (var j = 0; j < coordPairs.length; j++) {
//                         var parts = coordPairs[j].split(',');
//                         var lon = parseFloat(parts[0]);
//                         var lat = parseFloat(parts[1]);
//                         Points.push([Number(lon),Number(lat)]);
//                         //console.log('Latitude:', lat, 'Longitude:', lon);
//                         // You can process each coordinate here
//                     }
//                 }
//             } else {
//                 console.error('Unsupported file type');
//             }
//             displayPoints();
//             //download(xmlDoc);
//         };
        
    
//         reader.readAsText(file);

        
//     });
// });

let fileQueue = [];

function addToQueue(files) {
    fileQueue.push(...files);
    processQueue();
    
}


let readingInProgress = false;


function processQueue() {
    // If there are files in the queue and FileReader is not busy
    if (fileQueue.length > 0) {
        if (!readingInProgress) {
            // Start reading the next file
            const file = fileQueue.shift();
            readFile(file);
        }
    }else{
        displayPoints();
    }
}


function readFile(file){//solve issues with cancelling uploading gp(s) files
    fileList.push(file);
    addInfoListItem(fileList.length-1);
    var reader = new FileReader();
    readingInProgress = true;

    reader.onload = function(e) {
        var xmlString = e.target.result;
        console.log("pretype");
        var fileType = getFileType(file.name);
        console.log('posttype');
        var Points_file = [];
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        xmlDoc_list.push(xmlDoc);
        console.log(xmlDoc_list);

        select = document.getElementById("files");
        
        var opt = document.createElement('option');
        opt.value = Points.length;
        opt.innerHTML = Points.length;

        select.appendChild(opt);


        if (fileType === 'gpx') {
            var trkptElements = xmlDoc.getElementsByTagName('trkpt');
            //Points = new Array(trkptElements.length);
            for (var i = 0; i < trkptElements.length; i++) {
                var trkpt = trkptElements[i];
                var lat = trkpt.getAttribute('lat');
                var lon = trkpt.getAttribute('lon');
                var ele = trkpt.querySelector('ele').textContent;
                try {
                    var time = new Date(trkpt.querySelector('time').textContent).getTime() / 1000;
                    
                    Points_file.push([Number(lon),Number(lat),Number(ele), Number(time)]);
                }
                catch {
                    Points_file.push([Number(lon),Number(lat),Number(ele)]);
                }
                
                //console.log([Number(lon),Number(lat)]);
                //console.log('Latitude:', lat, 'Longitude:', lon);
                // You can process each trkpt element here
            }
        } else if (fileType === 'kml') {
            var coordinates = xmlDoc.getElementsByTagName('coordinates');
            //Points = new Array(coordinates.length);
            for (var i = 0; i < coordinates.length; i++) {
                var coordText = coordinates[i].textContent.trim();
                var coordPairs = coordText.split(/\s+/);
                for (var j = 0; j < coordPairs.length; j++) {
                    var parts = coordPairs[j].split(',');//<----------need to change elevation for KML as well
                    var lon = parseFloat(parts[0]);
                    var lat = parseFloat(parts[1]);
                    var ele = parseFloat(parts[2]);
                    Points_file.push([Number(lon),Number(lat),Number(ele)]);
                    //console.log('Latitude:', lat, 'Longitude:', lon);
                    // You can process each coordinate here
                }
            }
        } else {
            console.error('Unsupported file type');
        }
        Points.push(Points_file);

        //displayPoints();
        readingInProgress = false;
        processQueue();
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


function deleteMarker(){
    delete_allowance = true;
    move_allowance = false;
    create_allowance = false;
}


function moveMarker(){
    delete_allowance = false;
    move_allowance = true;
    create_allowance = false;
}


function createMarker(){
    delete_allowance = false;
    move_allowance = false;
    create_allowance = true;
}


function reloadPath(points_index){
    let path = turf.lineString(Points[points_index]);
    pathLayer = L.geoJSON(path);
    pathLayer.addTo(myMap);
    Markers[points_index].push(pathLayer);
}


function pointsToGeoJSON(points_list, type) { //need to be changed to make proper GeoJson
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
                "Creator": "OpenRouteService.org",
                "records": 1,
                "summary": "steepness"
            }
    }];
    }
    else{

        const fourthElements = points_list.map(subArray => subArray[3]);
        //console.log(fourthElements);
        let minTimeValue = fourthElements.reduce((acc, current) => Math.min(acc, current));
        //console.log(minTimeValue);

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
                "Creator": "OpenRouteService.org",
                "records": 1,
                "summary": "steepness"
            }
    }]; 
    }
    console.log("Type and Geojson:");
    console.log(type);
    console.log(geojson);
    return geojson;
}


function markerClick(e){
    var clicked_marker = e.target;
    var way_index = 0;

    for(var i = 0;i < Markers.length; i++){
            
        if (Markers[i].includes(clicked_marker)){
            
            way_index = i;
            //console.log(way_index);

            element_index = Markers[way_index].findIndex((marker)=>marker ===clicked_marker );
            //console.log(element_index);
        }
    }

    if (delete_allowance){
        myMap.removeLayer(clicked_marker);
        Points[way_index].splice(element_index,1);
        Markers[way_index].splice(element_index,1);

        way_line = Markers[way_index].pop();
        myMap.removeLayer(way_line);
        reloadPath(way_index);
    }
    else if (move_allowance){
        //console.log(move_allowance);
        clicked_marker.dragging.enable();
        clicked_marker.on("moveend",function(e){
            console.log("DragEnd")
            way_line = Markers[way_index].pop();
            myMap.removeLayer(way_line);
            e.target.dragging.disable();

            var temp = e.target;
            //console.log(temp);
            //console.log(temp._latlng);

            Points[way_index].splice(element_index,1,[temp._latlng['lng'], temp._latlng['lat']]);
            Markers[way_index].splice(element_index,1,temp);

            reloadPath(way_index);
        });
    }
    else if (create_allowance){
        myMap.once('click', function(e){
            way_line = Markers[way_index].pop();
            myMap.removeLayer(way_line);
            var temp = [e.latlng['lng'],e.latlng['lat']]
            //Points[way_index].push(temp);
            Points[way_index].splice(element_index+1,0,temp);
            //console.log(temp);
            var marker_t = showWayPoint(temp);
            console.log(way_index);
            //Markers[way_index].push(marker_t);
            Markers[way_index].splice(element_index+1,0,marker_t);
            marker_t.addTo(myMap);
            marker_t.on('click', markerClick);

            reloadPath(way_index);
            //myMap.off('click');
        });
    }
    
    delete_allowance = false;
    move_allowance = false;
    create_allowance = false;
}


function displayPoints()
{


    console.log(Points);
    
    

    console.log("DisplaYPOints");
    for (let j = 0; j< Points.length; j++){

        

        Markers.push([]);
        for (let i = 0; i < Points[j].length; i++)
        {
            
            marker = showWayPoint(Points[j][i]);
            Markers[j].push(marker);
            marker.addTo(myMap);
            marker.on('click', markerClick); //must be altered to make all markers draggable if clicked change position of markers, and define item alias for certain ways
            
        }


        // let geojson_markers = markersToGeoJSON(Markers[0]);


        // const geojson2 = [{
        //     "type": "FeatureCollection",
        //     "features": [{
        //         "type": "Feature",
        //         "geometry": {
        //             "type": "LineString",
        //             "coordinates": [
        //                 [8.6865264, 49.3859188, 114.5],
        //                 [8.6864108, 49.3868472, 114.3],
        //                 [8.6860538, 49.3903808, 114.8]
        //             ]
        //         },
        //         "properties": {
        //             "attributeType": "3"
        //         }
        //     }, {
        //         "type": "Feature",
        //         "geometry": {
        //             "type": "LineString",
        //             "coordinates": [
        //                 [8.6860538, 49.3903808, 114.8],
        //                 [8.6857921, 49.3936309, 114.4],
        //                 [8.6860124, 49.3936431, 114.3]
        //             ]
        //         },
        //         "properties": {
        //             "attributeType": "0"
        //         }
        //     }],
        //     "properties": {
        //         "Creator": "OpenRouteService.org",
        //         "records": 2,
        //         "summary": "steepness"
        //     }
        // }]

        
        
    //     hg.addData(geojson2);
    //     L.geoJson(geojson_markers).addTo(map);

        reloadPath(j);
        // let path = turf.lineString(Points[j]);
        // pathLayer = L.geoJSON(path);
        // pathLayer.addTo(myMap);
        // Markers[j].push(pathLayer);
    }
    //console.log(Markers);
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
        focusOnTrack(addIndex, true);
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
    });

    divPointItemButtons.appendChild(buttonSave);
    divPointItemButtons.appendChild(buttonDelete);

    let infoListItem = document.createElement("li");
    infoListItem.appendChild(buttonChoice);
    infoListItem.appendChild(divPointItemButtons);

    liHandle = document.getElementById("infoList");
    liHandle.appendChild(infoListItem);

}


function focusOnTrack(trackIndex, trackType){
    console.log(trackIndex);
    geojson_points1 = pointsToGeoJSON(Points[trackIndex], trackType);
        //geojson_points1 = pointsToGeoJSONDeprecated(Points);
    hg.addData(geojson_points1);
}





function getFileType(fileName) {
    var extension = fileName.split('.').pop().toLowerCase();
    console.log(extension);
    if (extension === 'gpx' || extension === 'kml') {
        return extension;
    } else {
        return null;
    }
}



function save(i)
{
    
    
    //for(var i = 0; i < Points.length;i++){
        let content = "";
      //  console.log(xmlDoc_list[i]);
        for(point of Points[i])
        {
            content += `\n<trkpt lat="${point[1]}" lon="${point[0]}">
            <ele>"${point[2]}</ele>
            </trkpt>`;
        }
        xmlDoc_list[i].getElementsByTagName("trkseg")[0].innerHTML = content;//writes several files in the same file, xmlDoc must be array
        download(i);
    
    //}
}

function download(index) 
{
    console.log(xmlDoc_list[index]);
    let serializer = new XMLSerializer();
    let stringXML = serializer.serializeToString(xmlDoc_list[index]);
    let filename = "Updated_file";

    var blob = new Blob([stringXML], { type: 'gpx-file' });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'processed_data.gpx';
    a.click();

    
};


function setElevationProfileWidth() {
    let w = window.outerWidth;
    let h = window.outerHeight;
    let txt = "Window size: width=" + w + ", height=" + h;
    console.log(txt);
    //if (!this.elevation_input.checked) return;

    if (graph) graph.style.display = 'none';
    //this.slide_container.style.display = 'none';
    //this.trace_info_grid.style.width = 'max-content';

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var embedding = urlParams.has('embed');

    var gridHandle = document.getElementById('information-grid');

    var map_width = myMap._container.offsetWidth;
    var info_width = gridHandle.offsetWidth;
    var info_height = gridHandle.offsetHeight;
    var elevation_profile_width = Math.min(map_width - info_width, map_width * 4 / 5);
    var elevation_profile_height = Math.min(info_height, embedding ? 120 : 160);

    console.log(map_width);

    if (elevation_profile_width != hg._width || elevation_profile_height != hg._height) {
        hg.resize({ width: elevation_profile_width, height: elevation_profile_height });
    }

    if (graph) graph.style.display = '';
    //if (!embedding) this.slide_container.style.display = '';
    //this.trace_info_grid.style.width = '';

};


window.addEventListener('resize', setElevationProfileWidth());