// *** *** Map Functions *** ***

var _map = null;
var _markers = [];

/*
 * map = createMap(mapDivName)
 * marker = createMarker(map)
 * removeMarker(map, marker)
 * removeAllMarkers(map)
 */

var mapAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

// var mapTileFormat = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
var mapTileFormat = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';


function createMap(mapDivName) {
	_map = L.map(mapDivName).setView([43.686292, -70.549876], 10);

	L.tileLayer(mapTileFormat, {
		maxZoom: 3,
		attribution: mapAttribution,
	}).addTo(_map);

	return _map;
}

function createMarker(latitude, longitude, popupText) {
	var marker = L.marker([latitude, longitude])
	marker.addTo(_map)
		.bindPopup(popupText);

	_markers.push(marker);
	return marker;
}

function removeMarker(marker) {
	if (marker !== null) {
		var markerIndex = _markers.indexOf(marker);
		if (markerIndex > -1) {
			_markers.splice(markerIndex, 1);
		}

		marker.setMap(null);
	}
}

function removeAllMarkers() {
	for (var i = 0; i < _markers.length; i++) {
		_markers[i].setMap(null);
	}

	_markers = [];
}
