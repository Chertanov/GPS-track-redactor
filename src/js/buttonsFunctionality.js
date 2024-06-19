function clearMap()
{

    myMap.eachLayer(function (layer) 
    {   if(layer.myId != "Base")
        myMap.removeLayer(layer);});
}

function clearFile(choice)
{

    Markers[choice].forEach((point) => myMap.removeLayer(point));

}


function showWayPoint(location)
{
    var icon = new L.Icon.Default();
    icon.options.shadowSize = [0,0];
    return new L.Marker([location[1], location[0]],{icon : icon});

}


function reloadPath(points_index){
    let path = turf.lineString(Points[points_index]);
    pathLayer = L.geoJSON(path);
    pathLayer.addTo(myMap);
    Markers[points_index].push(pathLayer);
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


function getUniqueDaysFromTimestamps(timestamps) {
    const daysSet = new Set();

    timestamps.forEach(seconds => {

        const date = new Date(seconds * 1000);

        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); 
        const day = date.getUTCDate().toString().padStart(2, '0');

        const dayString = `${year}-${month}-${day}`;

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

    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }

    options.forEach(function(optionText) {
        var option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        selectElement.appendChild(option);
    });
}


function findTimeMarker(trackIndex){

    disableMap();

    var points_time_list = Points[trackIndex];

    var dateSelect = document.getElementById('datepicker');

    var selectedDate = dateSelect.value;

    const fourthElements = points_time_list.map(subArray => subArray[3]);



    const uniqueDays = getUniqueDaysFromTimestamps(fourthElements);

    const uniqueDaysArray = Array.from(uniqueDays);

    const dateTimes = convertTimestamps(fourthElements);


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
            selectedDate = dateText; 
            addOptions(timeSelect, dateTimes[selectedDate] || []);

        }
    });


    timeModal.style.display = 'block';

    closeTimeModalSpan.addEventListener('click', () => {
        timeModal.style.display = 'none';
        enableMap();
    }, { once: true });

    timeModal.addEventListener('click', (event) => {
        event.stopPropagation(); 
    });


    saveTimeBtn.addEventListener('click', () => {
        const hours_value = timeSelect.value;
        const selectedTotalTime = selectedDate+"T"+hours_value+"Z";


        var time = new Date(selectedTotalTime).getTime() / 1000;


        var timeIndex = fourthElements.findIndex((timestamp_item)=> timestamp_item === time);


        for (var i = 0; i < Markers[trackIndex].length - 1; i++) {
            Markers[trackIndex][i].setOpacity(0);
        }

        

        Markers[trackIndex][timeIndex].setOpacity(1);

        myMap.flyTo([Points[trackIndex][timeIndex][1], Points[trackIndex][timeIndex][0]],17);
        

        timeModal.style.display = 'none';

        enableMap();
    }, { once: true });
}

