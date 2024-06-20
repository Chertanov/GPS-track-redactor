var Points = [];
var pointsLength = Points.length;
var PointsVariant = [];
var KMLPointsVariant = [];
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

let controlDiv = document.querySelector('.leaflet-bottom');

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

var southWest = L.latLng(-90, -180);
var northEast = L.latLng(90, 180);
var bounds = L.latLngBounds(southWest, northEast);

let myMap = L.map("map", {
    center: [51.505, -0.09],
    minZoom:2,
    maxZoom:20,
    zoom: 20,
    preferCanvas: false,
    zoomControl: false,
    attributionControl:false,
    boxZoom:false,
    inertia:true,
    doubleClickZoom:false,
    maxBounds:bounds,
    maxBoundsViscosity: 1.0,
}).setView([47.563, 24.1130], 3);

let baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 25,
        id: 'streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        useCache: true,
        crossOrigin: true,
        updateWhenIdle:true,
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
    divBarElementsList[i].appendChild(buttonsList[i]);
    rightTopPanel.appendChild( divBarElementsList[i]);
}



divBarElementsList = [];


function clickDonwloadFile(){
    document.getElementById('fileInput').click();
}


function disableMap() {
    
    myMap.dragging.disable();
    myMap.touchZoom.disable();
    myMap.doubleClickZoom.disable();
    myMap.scrollWheelZoom.disable();
    myMap.boxZoom.disable();

    if (myMap.tap) myMap.tap.disable();
};

function enableMap() {
    
    myMap.dragging.enable();
    myMap.touchZoom.enable();
    myMap.doubleClickZoom.enable();
    myMap.scrollWheelZoom.enable();
    myMap.boxZoom.enable();

    if (myMap.tap) myMap.tap.enable();
};
        

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

