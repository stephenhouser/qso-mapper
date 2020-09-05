/* leaflet-map.js - Leaflet JS Map Functions (https://leafletjs.com)
 *
 * Using OpenStreetMap (https://www.openstreetmap.org) or Mapbox (https://mapbox.com)
 * 
 * 2020/09/05 Stephen Houser, N1SH
*/

/* 
 * Which map tile source to use:
 * 	'openstreetmap'	-- use https://openstreetmap.org (does not use `mapAccessToken`)
 *	'mapbox'		-- use https://mapbox.com (requires `mapAccessToken` from mapbox)
 */
var mapTiles = 'openstreetmap';
var mapAccessToken = '';	// <-- put your mapbox token here if you are using mapbox, otherwise ignore.

/* Required Map functions:
 *
 * map = createMap(mapDivName)
 * marker = createMarker(latitude, longitude, popupText)
 * removeMarker(marker)
 * removeAllMarkers()
 */

/* Internal variables */
var _map = null;

// Currently markers and polygons are maintained separately.
// There's no reason at this point for doing this.
// Should they be in one array of mapObjects and one 'feature group'?
var _markers = [];
var _markerFeatureGroup = null;
var _polygons = [];
var _polygonFeatureGroup = null;

/* createMap - Initialize and create map in named section of DOM
 * 
 * Set up any handlers needed by the map and perform any initialization
 * of the map library.
 */
function createMap(mapDivName) {
	_map = L.map(mapDivName).setView([43.686292, -70.549876], 3);

	var mapAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
	'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

	if (mapTiles == 'openstreetmap') {
		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: mapAttribution,
		}).addTo(_map);
	} else if (mapTiles == 'mapbox') {
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: mapAttribution,
			id: 'mapbox/streets-v11',
			accessToken: mapAccessToken
		}).addTo(_map);
	} else {
		alert('Map configuration error: No mapTiles source set. Cannot load maps!');
	}

	_markerFeatureGroup = new L.featureGroup();
	_markerFeatureGroup.addTo(_map);

	_polygonFeatureGroup = new L.featureGroup();
	_polygonFeatureGroup.addTo(_map);

	return _map;
}

/* createPolygon - create a polygon on the map with the given borders.
 *
 * - The first parameter is a list of [[lat, lon], ...]
 * - The second parameter are 'options' for the polygon as an object {}
 * 	for example `{color: 'red'}`
 */
function createPolygon(points, options) {
	var poly = L.polygon(points, options);
	poly.addTo(_polygonFeatureGroup);
	_polygons.push(poly);
	return poly;
}

/* removePolygon - remove the specified polygon from the map */
function removePolygon(poly) {
	if (poly !== null) {
		var polyIndex = _polygons.indexOf(poly);
		if (polyIndex > -1) {
			_polygons.splice(polyIndex, 1);
		}

		poly.remove();
  	}
}

/* removeAllPolygons - remove all the polygons from the map */
function removeAllPolygons() {
	while (_polygons.length > 0) {
		var poly = _polygons.pop();
		removePolygon(poly);
	}
}

/* createMarker - create a marker on the map at the given position.
 *
 * Set up a marker on the map and corresponding pop-up for when the
 * marker is selected.
 */
function createMarker(latitude, longitude, popupText) {
	// To use a smaller marker, use something like this...
	// var blueMarkerSmall = L.icon({
	// 	iconUrl: 'icons/blu-blank.png',
	// 	iconSize:     [32, 32], // size of the icon
	// 	iconAnchor:   [16, 32], // point of the icon which will correspond to marker's location
	// 	popupAnchor:  [0, -16] // point from which the popup should open relative to the iconAnchor
	// });
	//var marker = L.marker([latitude, longitude], {icon: blueMarkerSmall});

	var marker = L.marker([latitude, longitude]);
	
	marker.addTo(_markerFeatureGroup)
		.bindPopup(popupText);

	_markers.push(marker);
	return marker;
}

/* removeMarker - remove the given marker from the map. */
function removeMarker(marker) {
	if (marker !== null) {
		var markerIndex = _markers.indexOf(marker);
		if (markerIndex > -1) {
			_markers.splice(markerIndex, 1);
		}

		marker.remove();
	}
}

/* removeAllMarkers - remove all markers from the map */
function removeAllMarkers() {
	while (_markers.length > 0) {
		var marker = _markers.pop();
		removeMarker(marker);
	}
}

/* zoomToAllMarkers - zoom the map to show all the current markers */
function zoomToAllMarkers() {
	_map.fitBounds(_markerFeatureGroup.getBounds(), { padding: L.point(40, 40) });
}
