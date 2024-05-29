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
var xmlDoc_list = [];
//var currentPositionhandle = window.navigator;
var currentPosition = [];
var debug_info_handle = document.getElementById("debug_info");
debug_info_handle.textContent= "NotOK";
//debug_info_handle.innerHTML= "NOtOK";
console.log(location.port);

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
                Points_file.push([Number(lon),Number(lat),Number(ele)]);
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
                    var parts = coordPairs[j].split(',');
                    var lon = parseFloat(parts[0]);
                    var lat = parseFloat(parts[1]);
                    Points_file.push([Number(lon),Number(lat)]);
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
    console.log("Cleared");
    myMap.eachLayer(function (layer) 
    {   if(layer.myId != "Base")
        myMap.removeLayer(layer);});
}

function clearFile()
{
    select = document.getElementById("files");
    choice = select.options[select.selectedIndex].value;
    console.log(Markers[choice]);
    Markers[choice].forEach((point) => myMap.removeLayer(point));
    Markers.splice(choice,1);
    Points.splice(choice,1);
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


function markersToGeoJSON(markers) {
    const geojson = {
      type: "FeatureCollection",
      features: markers.map(marker => {
        const latlng = marker.getLatLng();
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [latlng.lng, latlng.lat]
          },
          properties: {} // You can add more properties here if needed
        };
      })
    };
  
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
    //console.log("Point disaply");
    //console.log(Points);
    //console.log(Points.length);
    //console.log(Points[3][0]);

    console.log(Points);
    
    

    console.log("DisplaYPOints");
    for (let j = 0; j< Points.length; j++){
        //console.log("j array:")
        //console.log(Points[j]);
        console.log(j);
        Markers.push([]);
        for (let i = 0; i < Points[j].length; i++)
        {
            
            marker = showWayPoint(Points[j][i]);
            Markers[j].push(marker);
            marker.addTo(myMap);
            marker.on('click', markerClick); //must be altered to make all markers draggable if clicked change position of markers, and define item alias for certain ways
            
        }
        //console.log(Points[j]);

        // console.log(Markers);
        // console.log(Markers[0][0].getLatLng());

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


    //     console.log(geojson_markers);
    //     console.log("testing1");
    //     let hg = L.control.heightgraph();
    //     console.log("testing2");
    //     hg.addTo(myMap);
    //     console.log("testing3");
    //     //hg.addData(geojson_markers);
    //     hg.addData(geojson2);
    //     console.log("testing4");
    //    // L.geoJson(geojson_markers).addTo(map);

        reloadPath(j);
        // let path = turf.lineString(Points[j]);
        // pathLayer = L.geoJSON(path);
        // pathLayer.addTo(myMap);
        // Markers[j].push(pathLayer);
    }
    //console.log(Markers);
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

function save()
{
    
    
    for(var i = 0; i < Points.length;i++){
        let content = "";
        console.log(xmlDoc_list[i]);
        for(point of Points[i])
        {
            content += `\n<trkpt lat="${point[1]}" lon="${point[0]}">
            <ele>0</ele>
            </trkpt>`;
        }
        xmlDoc_list[i].getElementsByTagName("trkseg")[0].innerHTML = content;//writes several files in the same file, xmlDoc must be array
        download(i);
    
    }
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

    
}
///////////////////////////////////////////////////////////////////////////////////////////////

anychart.onDocumentReady(function () {
  
    // add data
    var data = [
      ["2003", 1, 0, 0],
      ["2004", 4, 0, 0],
      ["2005", 6, 0, 0],
      ["2006", 9, 1, 0],
      ["2007", 12, 2, 0],
      ["2008", 13, 5, 1],
      ["2009", 15, 6, 1],
      ["2010", 16, 9, 1],
      ["2011", 16, 10, 4],
      ["2012", 17, 11, 5],
      ["2013", 17, 13, 6],
      ["2014", 17, 14, 7],
      ["2015", 17, 14, 10],
      ["2016", 17, 14, 12],
      ["2017", 19, 16, 12],
      ["2018", 20, 17, 14],
      ["2019", 20, 19, 16],
      ["2020", 20, 20, 17],
      ["2021", 20, 20, 20],
      ["2022", 20, 22, 20]
    ];

    // create a data set
    var dataSet = anychart.data.set(data);

    // map the data for all series
    var firstSeriesData = dataSet.mapAs({x: 0, value: 1});
    var secondSeriesData = dataSet.mapAs({x: 0, value: 2});
    var thirdSeriesData = dataSet.mapAs({x: 0, value: 3});

    // create a line chart
    var chart = anychart.line();

    // create the series and name them
    var firstSeries = chart.line(firstSeriesData);
    firstSeries.name("Roger Federer");
    var secondSeries = chart.line(secondSeriesData);
    secondSeries.name("Rafael Nadal");
    var thirdSeries = chart.line(thirdSeriesData);
    thirdSeries.name("Novak Djokovic");

    // add a legend
    chart.legend().enabled(true);

    // add a title
    chart.title("Big Three's Grand Slam Title Race");

    // specify where to display the chart
    chart.container("height_line");

    // draw the resulting chart
    chart.draw();

  });




/////////////////////////////////////////////////////////
// let path_Test = turf.lineString(Points[points_index]);
// let pathLayer_Test = L.geoJSON(path);
// let hg = L.control.heightgraph();
// hg.addTo(map);
// hg.addData(pathLayer_Test);
// L.geoJson(pathLayer_Test).addTo(map);

var graph;
var xPadding = 30;
var yPadding = 30;
 
var data = { values:[
        { X: "Jan", Y: 12 },
        { X: "Feb", Y: 28 },
        { X: "Mar", Y: 18 },
        { X: "Apr", Y: 34 },
        { X: "May", Y: 40 },
]};

function getMaxY() {
    var max = 0;
     
    for(var i = 0; i < data.values.length; i ++) {
        if(data.values[i].Y > max) {
            max = data.values[i].Y;
        }
    }
     
    max += 10 - max % 10;
    return max;
}
 
function getXPixel(val) {
    return ((graph.width() - xPadding) / data.values.length) * val + (xPadding * 1.5);
}
 
function getYPixel(val) {
    return graph.height() - (((graph.height() - yPadding) / getMaxY()) * val) - yPadding;
}

$(document).ready(function() {
    graph = $('#graph');
    var c = graph[0].getContext('2d');

    c.lineWidth = 2;
    c.strokeStyle = '#333';
    c.font = 'italic 8pt sans-serif';
    c.textAlign = "center";

    c.beginPath();
    c.moveTo(xPadding, 0);
    c.lineTo(xPadding, graph.height() - yPadding);
    c.lineTo(graph.width(), graph.height() - yPadding);
    c.stroke();

    for(var i = 0; i < data.values.length; i ++) {
        c.fillText(data.values[i].X, getXPixel(i), graph.height() - yPadding + 20);
    }

    c.textAlign = "right"
    c.textBaseline = "middle";
    
    for(var i = 0; i < getMaxY(); i += 10) {
        c.fillText(i, xPadding - 10, getYPixel(i));
    }

    c.strokeStyle = '#f00';
    c.beginPath();
    c.moveTo(getXPixel(0), getYPixel(data.values[0].Y));
    
    for(var i = 1; i < data.values.length; i ++) {
        c.lineTo(getXPixel(i), getYPixel(data.values[i].Y));
    }
    c.stroke();

    c.fillStyle = '#333';
    
    for(var i = 0; i < data.values.length; i ++) { 
        c.beginPath();
        c.arc(getXPixel(i), getYPixel(data.values[i].Y), 4, 0, Math.PI * 2, true);
        c.fill();
    }
});

