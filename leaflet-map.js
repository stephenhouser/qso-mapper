/* Leaflet JS Map Functions (https://leafletjs.com)
 *
 * Using OpenStreetMap (https://www.openstreetmap.org)
 */

/* Required Map functions:
 *
 * map = createMap(mapDivName)
 * marker = createMarker(latitude, longitude, popupText)
 * removeMarker(marker)
 * removeAllMarkers()
 */

/* Internal variables */
var _map = null;
var _markers = [];
var _markerFeatureGroup = null;
var mapAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

var mapTileFormat = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// For https://mapbox.com use the followng
// var mapTileFormat = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={access_token}'

/* createMap - Initialize and create map in named section of DOM
 * 
 * Set up any handlers needed by the map and perform any initialization
 * of the map library.
 */
function createMap(mapDivName) {
	_map = L.map(mapDivName).setView([43.686292, -70.549876], 3);

	L.tileLayer(mapTileFormat, {
		attribution: mapAttribution,
	}).addTo(_map);

	_markerFeatureGroup = new L.featureGroup();
	_markerFeatureGroup.addTo(_map);

	return _map;
}

/* createMarker - create a marker on the map at the given position.
 *
 * Set up a marker on the map and corresponding pop-up for when the
 * marker is selected.
 */
function createMarker(latitude, longitude, popupText) {
	var marker = L.marker([latitude, longitude])
	// marker.addTo(_map)
	marker.addTo(_markerFeatureGroup)
		.bindPopup(popupText);

	_markers.push(marker);
	return marker;
}

/* removeMarker - remove the given marker from the map.
 */
function removeMarker(marker) {
	if (marker !== null) {
		var markerIndex = _markers.indexOf(marker);
		if (markerIndex > -1) {
			_markers.splice(markerIndex, 1);
		}

		marker.remove();
	}
}

/* removeAllMarkers - remove all markers from the map
 */
function removeAllMarkers() {
	while (_markers.length > 0) {
		var marker = _markers.pop();
		removeMarker(marker);
	}
}

function zoomToAllMarkers() {
	_map.fitBounds(_markerFeatureGroup.getBounds(), { padding: L.point(40, 40) });
}