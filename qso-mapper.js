/* qso-mapper.js - Show Amateur Radio QSOs on an interactive map and table.
 *
 * 2020/09/05 Stephen Houser, N1SH
 */

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
var resetButtonName = 'resetButton';

/* Global list of QSOs */
var qsos = [];

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
	document.getElementById(resetButtonName).addEventListener('click', handleReset);

	// If a url is specified in the query string, try to load and show markers from it
	// This allows pre-coding a URL with the ADIF file
	// https://stephenhouser.com/qso-mapper?url=sample/short.adi
	// https://stephenhouser.com/qso-mapper?url=https://stephenhouser.com/qso-mapper/sample/short.adi
	var url = getQueryVariable('url');
	if (url !== null) {
		disableFileUpload();
		loadQSOsFromURL(url);
	 }

	// TODO: Remove BootstrapTable jQuery dependency
	$('#call-log').on('click-cell.bs.table', function (field, value, row, element) {
		// TODO: Popping up the popup is leaflet specific
		if (element.marker !== null) {
			element.marker.openPopup();
		}
	});
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

/* handleReset - handle pressing of the 'clear' button
 *
 * - Removes any markers or polygons from the map
 * - Resets the form so a file with the same name can be loaded again.
 */
function handleReset() {
	setFileInputLabel('Select file...');

	removeAllQsos();

	var fileUploadForm = document.getElementById(fileUploadFormName);
	fileUploadForm.reset();
}

function setTitle(title) {
	if (title.startsWith('# ')) {
		var navBrand = document.getElementsByClassName('navbar-brand');
		for (let i = 0; i < navBrand.length; i++) {
			navBrand[i].textContent = title.substring(2);
		}
	}
}

/* loadQSOsFromFile - loads QSOs from uploaded file */
function loadQSOsFromFile(file) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var [header, loadedQsos] = Adif.parseAdif(e.target.result);
		setTitle(header);
		addQsos(loadedQsos);
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
				var [header, loadedQsos] = Adif.parseAdif(httpRequest.responseText);
				setTitle(header);
				addQsos(loadedQsos);
			} else {
				alert("There was a problem loating " + url);
			}
		}
	}

	makeRequest(url);
}

/* addQsos - load QSOs from an ADIF  (string)
 *
 * - Calls addMarkerFunc(lat, lon, text) for each QSO
 * - Calls zoomToAllMarkers to zoom the map to contain the markers.
 */
function addQsos(qsos) {
	for (var q = 0; q < qsos.length; q++) {
		addQso(qsos[q]);
	}

	// TODO: Remove BootstrapTable jQuery dependency
	$('#call-table').bootstrapTable('append', qsos);

	zoomToAllMarkers();
}

/* removeAllQsos - remove all loaded QSOs from the map and the application */
function removeAllQsos() {
	while (qsos.length > 0) {
		var qso = qsos.pop();
		removeQso(qso);
	}

	// TODO: Remove BootstrapTable jQuery dependency
	$('#call-table').bootstrapTable('removeAll');
}

/* addQso - Add a single QSO to the Map
 *
 * - Calls addMarkerFunc(lat, lon, text) for each QSO
 * - Calls zoomToAllMarkers to zoom the map to contain the markers.
 */
function addQso(qso) {
	// Keep copies of the marker in the QSO. Might be a bad idea.
	qso['marker'] = addMarkerForQso(qso);
	qso['square'] = addSquareForQSO(qso);
	qsos.push(qso);
}

function removeQso(qso) {
	if (qso !== null) {
		var qsoIndex = qsos.indexOf(qso);
		if (qsoIndex > -1) {
			qsos.splice(qsoIndex, 1);
		}

		if (typeof (qso.square) !== 'undefined') {
			removePolygon(qso.square);
		}

		if (typeof (qso.marker) !== 'undefined') {
			removeMarker(qso.marker);
		}
	}
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
	var options = {};
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

/* squareForQso - returns a polygon for the QSO's approximate location 
 *
 * top left, top right, bottom right, bottom left
 * [lat, lon], [lat, lon], [lat, lon], [lat, lon]
 */
function squareForQso(qso) {
	var gridsquare = qso.gridsquare
	if (typeof (qso.gridsquare) === 'string' && qso.gridsquare !== '') {
		var gsLen = gridsquare.length;

		var topLeftSquare = gridsquare + 'AA00AA00AA'.substring(gsLen);
		var botRightSquare = gridsquare + 'RR99XX99XX'.substring(gsLen);

		var [top, left] = Locator.loc2latlon(topLeftSquare);
		var [bottom, right] = Locator.loc2latlon(botRightSquare);
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
	// TODO: Using lat and lon from the ADIF is sometime off from real position.
	if (typeof (qso.lat) === 'string' && typeof (qso.lon) === 'string') {
		var latitude = Adif.parseCoordinate(qso.lat);
		var longitude = Adif.parseCoordinate(qso.lon);
		return [latitude, longitude];
	}

	if (typeof (qso.gridsquare) === 'string' && qso.gridsquare !== '') {
		var [latitude, longitude] = Locator.loc2latlon(qso.gridsquare);
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
