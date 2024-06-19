let fileQueue = [];

function addToQueue(files) {
    fileQueue.push(...files);
    processFileQueue();
    
}

function getFileType(fileName) {
    var extension = fileName.split('.').pop().toLowerCase();

    if (extension === 'gpx' || extension === 'kml') {
        return extension;
    } else {
        return null;
    }
}

let readingInProgress = false;


function displayPoints()
{
    for (let j = pointsLength; j< Points.length; j++){
        Markers.push([]);
        
        for (let i = 0; i < Points[j].length; i++)
        {
            
            marker = showWayPoint(Points[j][i]);
            Markers[j].push(marker);
            marker.addTo(myMap);
            marker.on('click', markerClick); 
            
        }
        reloadPath(j);
    }

    pointsLength = Points.length;
}


function processFileQueue() {
    if (fileQueue.length > 0) {
        if (!readingInProgress) {
            const file = fileQueue.shift();
            readTrackFile(file);
        }
    }else{
        changeButtonsAvailability(true);
        displayPoints();
        setElevationProfileStyle();
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
    return [pointsFromFile, trackVariant, -1];
}



function readKMLFile(xmlDoc){
    var pointsFromFile = [];
    var trackVariant = 0;
    var KMLTrackVariant = 0;
    var timeCoordinates;

    try{
        timeCoordinates = xmlDoc.getElementsByTagName('when');
        var time = new Date(timeCoordinates[0].textContent).getTime() / 1000;
        trackVariant = 1;
    } catch{};

    try{
        //var lineCoordinatesTest = xmlDoc.getElementsByTagName('gx:Track')[0];
        var time = xmlDoc.getElementsByTagName("gx:coord");
        var testItem = time[0].textContent;
        KMLTrackVariant = 1;
    }catch{};


    
    if(KMLTrackVariant === 1){
        var gxCoordinates = xmlDoc.getElementsByTagName("gx:coord");
        for (var i = 0; i < gxCoordinates.length; i++) {
            var coordText = gxCoordinates[i].textContent.trim();


                var parts = coordText.split(' ');
                var lon = parseFloat(parts[0]);
                var lat = parseFloat(parts[1]);
                var ele = parseFloat(parts[2]);
                if (trackVariant) {
                    var time = new Date(timeCoordinates[i].textContent).getTime() / 1000;
                    pointsFromFile.push([Number(lon),Number(lat),Number(ele), Number(time)]);
                }else{
                    pointsFromFile.push([Number(lon),Number(lat),Number(ele)]);
                }
        }
    }
    else{
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
    }
    return [pointsFromFile, trackVariant,KMLTrackVariant];    
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
               
        if (fileType === 'gpx') {
            fileCoordinatesInfo = readGPXFile(xmlDoc);
        } else if (fileType === 'kml') {
            fileCoordinatesInfo = readKMLFile(xmlDoc);
        } else {
            console.error('Unsupported file type');
        }
        
        Points.push(fileCoordinatesInfo[0]);
        PointsVariant.push(fileCoordinatesInfo[1]);
        KMLPointsVariant.push(fileCoordinatesInfo[2]);

        readingInProgress = false;
        processFileQueue();
    };
    reader.readAsText(file);
}



// $(document).ready(function(){
//     $('input[name="map_file"]').change(function(input){
//         var files = input.target.files;
        
//         addToQueue(files);  
//     });
// });


function save(i)
{
    var savingFile = fileList[i];
    var extension = savingFile.name.split('.').pop().toLowerCase();
   
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
        if (KMLPointsVariant[i] === 0){
            console.log(Points);
            if (PointsVariant[i] === 0){
                for(point of Points[i]){
                    content += `${point[0]},${point[1]},${point[2]} `
                }
                content = `\n<coordinates>${content}</coordinates>`
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
        }else if (KMLPointsVariant[i] === 1){
            if (PointsVariant[i] === 0){
                for(point of Points[i]){
                    content += `\n<gx:coord>${point[0]} ${point[1]} ${point[2]}</gx:coord>`
                }
            }else if(PointsVariant[i] === 1){
                for(point of Points[i]){
                    var timeStamp = new Date(point[3]*1000).toISOString();
                    var formatedTimeStamp = timeStamp.split('.')[0] + 'Z';
                    content += `\n<when>${formatedTimeStamp}</when>`
                    content += `\n<gx:coord>${point[0]} ${point[1]} ${point[2]}</gx:coord>`
                }
            }
            xmlDoc_list[i].getElementsByTagName('gx:Track')[0].innerHTML = content;
        }
    }
    
    download(i,extension);
}


function download(index, extension) {
    var savingFile = fileList[index];
    var fileName = savingFile.name.split('.')[0];

    let serializer = new XMLSerializer();
    let stringXML = serializer.serializeToString(xmlDoc_list[index]);
    let mimeType = '';
    let fileExtension = '';

    if (extension === "gpx") {
        mimeType = 'application/gpx+xml';
        fileExtension = 'gpx';
    } else if (extension === "kml") {
        mimeType = 'application/vnd.google-earth.kml+xml';
        fileExtension = 'kml';
    }

    var blob = new Blob([stringXML], { type: mimeType });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${fileName}_updated.${fileExtension}`;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
}