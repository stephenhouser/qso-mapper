// *** *** Map Functions *** ***

var markers = [];

/*
 * map = createMap(mapDivName)
 * marker = createMarker(map)
 * removeMarker(map, marker)
 * remoceAllMarkers(map)
 */

// function initMap() {
// 	map = new google.maps.Map(document.getElementById("map-canvas"), {
// 		center: { lat: 43.686292, lng: -70.549876 },
//     	zoom: 3,
//     	mapTypeId: "terrain"
//   });
// }

function createMap(mapDivName) {
	var map = L.map(mapDivName).setView([43.686292, -70.549876], 10);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);

	// mapLink =
	// 	'<a href="http://openstreetmap.org">OpenStreetMap</a>';
	// L.tileLayer(
	// 	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	// 		attribution: '&copy; ' + mapLink + ' Contributors',
	// 		maxZoom: 18,
	// 	}).addTo(map);
	return map;
}

function createMarker(map, popupText, latitude, longitude) {
	var marker = L.marker([latitude, longitude])
	marker.addTo(map)
		.bindPopup(popupText)
		.openPopup();

	markers.push(marker);
	return marker;
}

function removeAllMarkers(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}

	markers = [];
}
