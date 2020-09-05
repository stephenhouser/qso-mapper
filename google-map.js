/* google-map.js - Google Maps JS Functions
 *
 * Currently this file is not maintained. The project has switched to using
 * leaflet.js. This code is here for reference and may actually still work.
 * 
 * 2020/09/05 Stephen Houser, N1SH
*/

/* Required Map functions:
 *
 * map = createMap(mapDivName)
 * marker = createMarker(latitude, longitude, popupText)
 * removeMarker(marker)
 * removeAllMarkers()
 */

var _map = null;
var _markers = [];
var _openInfoWindow = null;

function createMap(mapDivName) {
	_map = new google.maps.Map(document.getElementById(mapDivName), {
		center: { lat: 43.686292, lng: -70.549876 },
    	zoom: 3,
    	mapTypeId: "terrain"
  	});

  _markers = [];
  return _map;
}

function createMarker(latitude, longitude, popupText) {
	let marker = new google.maps.Marker({
		title: name,
		position: new google.maps.LatLng(latitude, longitude),
		map: _map
	});

	marker.addListener('click', function () {
		if (_openInfoWindow !== null) {
			_openInfoWindow.close();
		}

		let infowindow = new google.maps.InfoWindow({
			content: popupText
		});

		infowindow.open(_map, marker);
		_openInfoWindow = infowindow;
	});

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
