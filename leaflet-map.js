// *** *** Map Functions *** ***

var _map = null;
var _markers = [];

/* Required Map functions:
 *
 * map = createMap(mapDivName)
 * marker = createMarker(latitude, longitude, popupText)
 * removeMarker(marker)
 * removeAllMarkers()
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

		marker.remove();
	}
}

function removeAllMarkers() {
	while (_markers.length > 0) {
		var marker = _markers.pop();
		removeMarker(marker);
	}
}
