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
	var loadURL = getQueryVariable('url');
	if (loadURL !== null) {
		requestADIFFromURL(loadURL);
		disableFileUpload();
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

	uploadFiles(this.files);
}

/* handleResetUpload - handle pressing of the 'reset' button
 *
 * - Removes any markers from the map
 * - Resets the file upload form
 */
function handleResetUpload() {
	setFileInputLabel('Select file...');
	removeAllMarkers();
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

/* uploadFiles - loads QSOs from uploaded files */
function uploadFiles(files) {
	var numFiles = files.length;
	for (var i = 0, numFiles = files.length; i < numFiles; i++) {
		var reader = new FileReader();
		reader.onload = function (e) {
			loadQsosFromADIF(e.target.result, addMarkerForQso);
		};

		reader.readAsText(files[i]);
	}
}

/* loadQsosFromADIF - load QSOs from a single ADIF file */
function loadQsosFromADIF(adifString, addMarkerFunc) {
	var qsos = parseADIF(adifString);
	for (var q = 0; q < qsos.length; q++) {
		addMarkerFunc(qsos[q]);
	}
	zoomToAllMarkers();
}

/* addMarkerForQso - add a marker to the map for a given QSO */
function addMarkerForQso(qso) {
	var latlon = latLonForQso(qso);
	if (latlon === null) {
		//throw "No location for qso";
		return null;
	}

	maidenheadGrid(qso.gridsquare);

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

/* latLonForQSO - get the latitude and longitude for a QSO
 *
 * A QSO *may* already contain a latitide and longitude. If so, use those
 * values. Otherwise, if the QSO contains a grid square (maidenhead locator),
 * use the center of the square as the latitude and longitude.
 * This makes use of the HamGridSquare.js:
 * 	https://gist.github.com/stephenhouser/4ad8c1878165fc7125cb547431a2bdaa
 */
function latLonForQso(qso) {
	if (typeof (qso.lat) === 'string' && typeof (qso.lon) === 'string') {
		var latitude = parseCoordinate(qso.lat);
		var longitude = parseCoordinate(qso.lon);
		return [latitude, longitude];
	}

	if (typeof (qso.gridsquare) === 'string' 
		&& (qso.gridsquare.length == 4 || qso.gridsquare.length == 6)) {
		var [latitude, longitude] = latLonForGrid(qso.gridsquare);
		return [latitude, longitude];
	}

	return null;
}

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

function requestADIFFromURL(url) {
	var httpRequest;
	function makeRequest(url) {
		httpRequest = new XMLHttpRequest();

		if (!httpRequest) {
			alert('Giving up :( Cannot create an XMLHTTP instance');
			return false;
		}
		httpRequest.onreadystatechange = alertContents;
		httpRequest.open('GET', url);
		httpRequest.send();
	}

	function alertContents() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				loadQsosFromADIF(httpRequest.responseText, addMarkerForQso);
			} else {
				alert('There was a problem with the request.');
			}
		}
	}

	makeRequest(url);
}

// FN43AA00AA
// FN53AA00AA
// FN54AA00AA
// FN44AA00AA
// FN43AA00AA

// return character for character code
function chr(x) { 
	return String.fromCharCode(x); 
}

// return character code for character
function ord(c) { 
	return c.charCodeAt(0)
}

function floor(x) { return Math.floor(x); }

function grids(lat, lng) {
	var qth = '';
	lat += 90; lng += 180;
	lat = lat / 10 + 0.0000001;
	lng = lng / 20 + 0.0000001;
	qth += chr(65 + lng) + chr(65 + lat);
	lat = 10 * (lat - floor(lat));
	lng = 10 * (lng - floor(lng));
	qth += chr(48 + lng) + chr(48 + lat);
	lat = 24 * (lat - floor(lat));
	lng = 24 * (lng - floor(lng));
	qth += chr(65 + lng) + chr(65 + lat);
	lat = 10 * (lat - floor(lat));
	lng = 10 * (lng - floor(lng));
	qth += chr(48 + lng) + chr(48 + lat);
	lat = 24 * (lat - floor(lat));
	lng = 24 * (lng - floor(lng));
	qth += chr(65 + lng) + chr(65 + lat);
	return qth;
} 


function latlon(qth) {
	var i = 0;
	var l = new Array();

	qth = qth.toUpperCase();
	while (i < 10) {
		l[i] = isNaN(qth.charCodeAt(i)) ? 0 : qth.charCodeAt(i) - 65;
		i++;
	}
	console.log(l);

	l[2] += 17; l[3] += 17;
	l[6] += 17; l[7] += 17;

	console.log(l);

	var lng = (l[0] * 20 + l[2] * 2 + l[4] / 12 + l[6] / 120 + l[8] / 2880 - 180);
	var lat = (l[1] * 10 + l[3] + l[5] / 24 + l[7] / 240 + l[9] / 5760 - 90);
	return [lat, lng];
}

//FN43RQ00AA
//FN43SQ00AA
//FN43SR00AA
//FN43RR00AA

//FN43SR00AA
// returns 4 points of rectangle
// [lat, lon], [lat, lon], [lat, lon], [lat, lon]
function maidenheadGrid(locator) {
	var prefix = locator.substring(0, locator.length - 2);
	var c1 = ord(locator.substring(locator.length - 2, locator.length - 1));
	var c2 = ord(locator.substring(locator.length - 1, locator.length));
	var g1 = prefix + chr(c1) + chr(c2) //+ "00AA00AA".substring(locator.length - 2);
	var g2 = prefix + chr(c1 + 1) + chr(c2) //+ "00AA00AA".substring(locator.length - 2);
	var g3 = prefix + chr(c1 + 1) + chr(c2 + 1) //+ "00AA00AA".substring(locator.length - 2);
	var g4 = prefix + chr(c1) + chr(c2 + 1) //+ "00AA00AA".substring(locator.length - 2);

	console.log(locator + ' parses to ' + prefix + ' ' + c1 + ' ' + c2);

	console.log(g1); console.log(latlon(g1));
	console.log(g3);
	console.log(g4);

	var polygon = L.polygon([
		latLonForGrid(g1),
		latLonForGrid(g2),
		latLonForGrid(g3),
		latLonForGrid(g4)
	]).addTo(_map);

	// var polygon = L.polygon([
	// 	latlon(g1),
	// 	latlon(g2),
	// 	latlon(g3),
	// 	latlon(g4)
	// ]).addTo(_markerFeatureGroup);
}