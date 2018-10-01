// Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob) {
// 	// Great success! All the File APIs are supported.
// } else {
// 	alert('The File APIs are not fully supported in this browser.');
// }

/*
TODO: Enable loading ADIF files from URL query string and saving in local storage

1. Use AJAX to get file from same repo as passed from URL
	https://stephenhouser.com/qso-mapper?short.adi
	https://stephenhouser.com/qso-mapper?https://stephenhouser.com/qso-mapper/short.adi
	- don't use any local storage
	- should the file upload be available when this is the case? prob not.
	- disable reset button and file upload

2. Use data uploaded by the file upload form
	- save in local storage
*/

/* Names of HTML DOM elements */
var mapElementName = 'map-canvas';
var fileUploadFormName = 'fileUpload';
var fileInputFieldName = 'fileInput';
var resetButtonName = 'resetMarkers';

/* initQsoMapper - main initialization for page
 *
 * - Creates and loads map element
 * - Attaches page event handlers
 */
function initQsoMapper() {
	createMap(mapElementName);

	// Update file name when a file is chosen
	document.getElementById(fileInputFieldName).addEventListener('change', handleUploadFile);

	// Call removeAllMarkers when 'Reset' is clicked and reset fileName
	document.getElementById(resetButtonName).addEventListener('click', handleResetUpload);

	// If a url is specified in the query string, try to load and show markers from it
	// This allows pre-coding a URL with the ADIF file
	// https://stephenhouser.com/qso-mapper?url=sample/short.adi
	// https://stephenhouser.com/qso-mapper?url=https://stephenhouser.com/qso-mapper/sample/short.adi
	var url = getQueryVariable('url');
	if (url !== null) {
		disableFileUpload();
		loadQSOsFromURL(url);
 	}
}

/* disableFileUpload - disable the file upload form and reset buttons
 *
 * - Updates the file upload form (with the current file name)
 * - Checks and parses the file, loading QSOs into an array
 * - Adds markers (from QSOs) to the map
 */
function disableFileUpload() {
	var fileUploadForm = document.getElementById(fileUploadFormName);
	fileUploadForm.hidden = true;

	var resetButton = document.getElementById(resetButtonName);
	resetButton.hidden = true;
}

/* handleFileUpload - handle when upload file is triggered
 *
 * - Updates the file upload form (with the current file name)
 * - Checks and parses the file, loading QSOs into an array
 * - Adds markers (from QSOs) to the map
 */
function handleUploadFile() {
	var fileName = this.value;
	fileName = fileName.replace('C:\\fakepath\\', '');
	setFileInputLabel(fileName);

	// For each file object uploaded...(usually only one).
	for (var i = 0; i < this.files.length; i++) {
	    loadQSOsFromFile(this.files[i]);
	  }
}

/* handleResetUpload - handle pressing of the 'reset' button
 *
 * - Removes any markers from the map
 * - Resets the form so a file with the same name can be loaded again.
 */
function handleResetUpload() {
	setFileInputLabel('Select file...');
	removeAllMarkers();
	removeAllPolygons();

	var fileUploadForm = document.getElementById(fileUploadFormName);
	fileUploadForm.reset();
}

/* loadQSOsFromFile - loads QSOs from uploaded file */
function loadQSOsFromFile(file) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var qsos = parseADIF(e.target.result);
		addQsosToMap(qsos);
	};

	reader.readAsText(file);
}

/* loadQSOsFromURL - load QSOs from URL */
function loadQSOsFromURL(url) {
	var httpRequest;
	function makeRequest(url) {
		httpRequest = new XMLHttpRequest();

		if (!httpRequest) {
			alert("Giving up :( Cannot create an XMLHTTP instance");
			return false;
		}

		httpRequest.onreadystatechange = readyStateChanged;
		httpRequest.open("GET", url);
		httpRequest.send();
	}

	function readyStateChanged() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				var qsos = parseADIF(httpRequest.responseText);
				addQsosToMap(qsos);
			} else {
				alert("There was a problem loating " + url);
			}
		}
	}

	makeRequest(url);
}

/* loadQsosFromADIF - load QSOs from an ADIF  (string) 
 *
 * - Calls addMarkerFunc(lat, lng, text) for each QSO
 * - Calls zoomToAllMarkers to zoom the map to contain the markers.
 */
function addQsosToMap(qsos) {
	for (var q = 0; q < qsos.length; q++) {
		addMarkerForQso(qsos[q]);
		addSquareForQSO(qsos[q]);
	}

	zoomToAllMarkers();
}

/* addSquareForQso - add a polygon to the map to outline QSO grid square 
 *
 * Color squares where the QSO has a latitude and longitude green
 * Other squares are default colored (blue).
 */
function addSquareForQSO(qso) {
	var square = squareForQso(qso);
	if (square === null) {
		return null;
	}

	// This is specifit to Leaflet.js and may not work on Google Maps.
	var options = { };
	if (typeof (qso.lat) === 'string' && typeof (qso.lon) === 'string') {
		options['color'] = 'green';
	}

	var [[top, left], [bottom, right]] = square;
	polygon = createPolygon(
		[[top, left], 
		[top, right], 
		[bottom, right], 
		[bottom, left]],
		options
	);

	return polygon;
}

/* addMarkerForQso - add a marker to the map for a given QSO */
function addMarkerForQso(qso) {
	var latlon = latLonForQso(qso);
	if (latlon === null) {
		//throw "No location for qso";
		return null;
	}

	var [latitude, longitude] = latlon;
	var popupText = '<div class="qso">' +
		'<h1>' + qso.call + '</h1><hr/>' +
		'<div><p>' +
		'Time:' + qso.qso_date + ' ' + qso.time_on +
		' Band:' + qso.band +
		' Mode:' + qso.mode +
		'</p></div></div>';

	marker = createMarker(latitude, longitude, popupText);
	return marker;
}

/* squareForQso - returns a polygon for the QSO's approximate location 
 *
 * top left, top right, bottom right, bottom left
 * [lat, lng], [lat, lng], [lat, lng], [lat, lng]
 */
function squareForQso(qso) {
	var gridsquare = qso.gridsquare
	if (typeof (qso.gridsquare) === 'string' && qso.gridsquare !== '') {

		var gsLen = gridsquare.length;

		var topLeftSquare = gridsquare + 'AA00AA00AA'.substring(gsLen);
		var botRightSquare = gridsquare + 'RR99XX99XX'.substring(gsLen);

		var [top, left] = loc2latlng(topLeftSquare);
		var [bottom, right] = loc2latlng(botRightSquare);
		return [[top, left], [bottom, right]];
	}

	return null;
}

/* latLonForQSO - get the latitude and longitude for a QSO
 *
 * A QSO *may* already contain a latitide and longitude. If so, use those
 * values. Otherwise, if the QSO contains a grid square (maidenhead locator),
 * use the center of the square as the latitude and longitude.
 * This makes use of the HamGridSquare.js:
 * 	https://gist.github.com/stephenhouser/4ad8c1878165fc7125cb547431a2bdaa
 */
function latLonForQso(qso) {
	// if (typeof (qso.lat) === 'string' && typeof (qso.lon) === 'string') {
	// 	var latitude = parseCoordinate(qso.lat);
	// 	var longitude = parseCoordinate(qso.lon);
	// 	return [latitude, longitude];
	// }
	if (typeof (qso.gridsquare) === 'string' && qso.gridsquare !== '') {
		var [latitude, longitude] = loc2latlng(qso.gridsquare);
		return [latitude, longitude];
	}

	return null;
}

/* setFileInputLabel - set the current 'uploaded' file name
 *
 * Utility function to set the last loaded file name on the file upload
 * form.
 */
function setFileInputLabel(message) {
	var fileUploadForm = document.getElementById(fileUploadFormName);
	var fileLabels = fileUploadForm.getElementsByClassName('custom-file-label');
	if (fileLabels !== null && fileLabels.length >= 1) {
		fileLabels[0].innerHTML = message;
	}
}

/* getQueryVariable - get HTTP/URL query variable or null if it does not exist. */
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}

	return null;
}
