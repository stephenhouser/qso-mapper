// Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob) {
// 	// Great success! All the File APIs are supported.
// } else {
// 	alert('The File APIs are not fully supported in this browser.');
// }

var mapElementName = 'map-canvas';
var fileUploadFormName = 'fileUpload';
var fileInputFieldName = 'fileInput'

function initQsoMapper() {
	createMap(mapElementName);

	// Update file name when a file is chosen
	document.getElementById(fileInputFieldName).addEventListener('change', handleUploadFile);

	// Call removeAllMarkers when 'Reset' is clicked and reset fileName
	document.getElementById('resetMarkers').addEventListener('click', handleResetUpload);
}

// handle when upload file is triggered
function handleUploadFile() {
	var fileName = this.value;
	fileName = fileName.replace('C:\\fakepath\\', '');
	setFileInputLabel(fileName);

	uploadFiles(this.files);
}

// handle pressing of the 'reset' button
function handleResetUpload() {
	setFileInputLabel('Select file...');
	removeAllMarkers();
}

// set the current 'uploaded' file name
function setFileInputLabel(message) {
	var fileUploadForm = document.getElementById(fileUploadFormName);
	var fileLabels = fileUploadForm.getElementsByClassName('custom-file-label');
	if (fileLabels !== null && fileLabels.length >= 1) {
		fileLabels[0].innerHTML = message;
	}
}

// upload/process files
function uploadFiles(files) {
	var numFiles = files.length;
	for (var i = 0, numFiles = files.length; i < numFiles; i++) {
		loadMarkersFromADIF(files[i], addMarkerForQso);
	}
}

function loadMarkersFromADIF(file, addMarkerFunc) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var qsos = parseADIF(e.target.result);
		for (var q = 0; q < qsos.length; q++) {
			addMarkerFunc(qsos[q]);
		}
	};

	reader.readAsText(file);
}

function addMarkerForQso(qso) {
	var latlon = latLonForQso(qso);
	if (latlon === null) {
		//throw "No location for qso";
		return null;
	}

	var [latitude, longitude] = latlon;
	var popupText = '<div class="qso">' +
		'<h1>' + qso.call + '</h1>' +
		'<div><p>' +
		'Time:' + qso.qso_date + ' ' + qso.time_on +
		' Band:' + qso.band +
		' Mode:' + qso.mode +
		'</p></div></div>';

	marker = createMarker(latitude, longitude, popupText);
	return marker;
}

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
