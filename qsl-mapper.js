// Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob) {
// 	// Great success! All the File APIs are supported.
// } else {
// 	alert('The File APIs are not fully supported in this browser.');
// }

var map = null;
var markers = [];
var openInfoWindow = null;

var qth = null;

function initMap() {
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: { lat: 40, lng: -30 },
		zoom: 3,
		mapTypeId: 'terrain',
	});
}

function addMarker(name, info, latitude, longitude) {
	if (map !== null) {
		let infowindow = new google.maps.InfoWindow({
			content: info
		});

		let marker = new google.maps.Marker({
			title: name,
			position: new google.maps.LatLng(latitude, longitude),
			map: map,
		});

		marker.addListener('click', function () {
			if (openInfoWindow !== null) {
				openInfoWindow.close();
			}

			infowindow.open(map, marker);
			openInfoWindow = infowindow;
		});

		markers.push(marker);
	}
}

function addMarkerForQSO(qso) {
	var info = '<div class="qso">'+
            '<h1>' + qso.call + '</h1>'+
			'<div><p>'+
			'Time:' + qso.qso_date + ' ' + qso.time_on +
			' Band:' + qso.band +
			' Mode:' + qso.mode +
			'</p></div></div>';

	addMarker(qso.call, info, parseCoordinate(qso.lat), parseCoordinate(qso.lon));
}

function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}

	markers = [];
}

function parseADIFLine(qsoLine) {
	var qso = {};

	fields = qsoLine.match(/\<(.+?):.+?\>([^\<]+)/g);
	for (var f = 0; f < fields.length; f++) {
		field_value = fields[f].match(/\<(.+?):.+?\>(.*)/);
		if (field_value !== null) {
			qso[field_value[1]] = field_value[2];
		}
	}

	return qso;
}

	//N040 26.719
	//my_lat: "N043 40.871"
	//43.686292, -70.549876
	//43° 41' 11'' N     -70° 32' 60'' W 
function parseCoordinate(coordinate) {
	var [_, nsew, d, m] = coordinate.match(/([NSEW])(\d+) ([.\d]+)/);	
	var dd = parseInt(d) + parseFloat(m) / 60;
	if (nsew == 'S' || nsew == 'W') {
		dd = -dd;
	}

	return dd;
}

function loadADIFFile(file) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var fileData = e.target.result;
		fileData = fileData.replace(/(\r\n\t|\n|\r\t)/gm, '');

		var fileMatch = fileData.match(/(.*)\<eoh>(.*)/);
		if (fileMatch && fileMatch.length == 3) {
			body = fileMatch[2];
			qsoMatches = body.match(/(.*?)\<eor\>/g);
			for (var q = 0; q < qsoMatches.length; q++) {
				qso = parseADIFLine(qsoMatches[q]);

				addMarkerForQSO(qso);

				if (qth === null) {
					var qthInfo = '<div class="qth">' +
						'<h1>' + qso.station_callsign + '</h1>' +
						'<p>Station QTH</p>'
						'</div>';
					addMarker(qso.station_callsign, qthInfo, parseCoordinate(qso.my_lat), parseCoordinate(qso.my_lon));
				}
				// console.log(qso);
			}
		} else {
			alert('Invalid ADIF file. Cannot find header marker <eoh>.');
		}
	};

	reader.readAsText(file);
}

function handleFiles(files) {
	var numFiles = files.length;
	for (var i = 0, numFiles = files.length; i < numFiles; i++) {
		var file = files[i];
		loadADIFFile(file);
	}
}
