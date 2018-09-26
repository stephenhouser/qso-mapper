// HamGridSquare.js
// Copyright 2014 Paul Brewer KI6CQ
// License:  MIT License http://opensource.org/licenses/MIT
//
// Javascript routines to convert from lat-lon to Maidenhead Grid Squares
// typically used in Ham Radio Satellite operations and VHF Contests
//
// Inspired in part by K6WRU Walter Underwood's python answer
// http://ham.stackexchange.com/a/244
// to this stack overflow question:
// How Can One Convert From Lat/Long to Grid Square
// http://ham.stackexchange.com/questions/221/how-can-one-convert-from-lat-long-to-grid-square
//

//
// 2018 Fork Stephen Houser N1SH
//
// This code supports 4 and 6 character Maidenhead (grid square) Locators.
// It does not support the 8-character extended locator strings.
// Maidenhead Locator System: https://en.wikipedia.org/wiki/Maidenhead_Locator_System
//

/* Get the Maidenhead Locator (grid square) for a given latitude and longitude.
 * 
 * The two parameters are:
 * `latitude` - floating point latitude value
 * `longitude` - floating point longitude value
 * 
 * Returns a 6-character maidenhead locator string (e.g. `FN43rq`)
 */
function gridForLatLon(latitude, longitude) {
	var UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWX'
	var LOWERCASE = UPPERCASE.toLowerCase();
	var adjLat, adjLon, 
		fieldLat, fieldLon, 
		squareLat, squareLon, 
		subLat, subLon, 
		rLat, rLon;

	// Parameter Validataion
	var lat = parseFloat(latitude);
	if (isNaN(lat)) {
		throw "latitude is NaN";
	}

	if (Math.abs(lat) === 90.0) {
		throw "grid squares invalid at N/S poles";
	}

	if (Math.abs(lat) > 90) {
		throw "invalid latitude: " + lat;
	}

	var lon = parseFloat(longitude);
	if (isNaN(lon)) {
		throw "longitude is NaN";
	}

  	if (Math.abs(lon) > 180) {
		throw "invalid longitude: " + lon;
	}

	// Latitude
	var adjLat = lat + 90;
	fieldLat = UPPERCASE[Math.trunc(adjLat / 10)];
	squareLat = '' + Math.trunc(adjLat % 10);
	rLat = (adjLat - Math.trunc(adjLat)) * 60;
	subLat = LOWERCASE[Math.trunc(rLat / 2.5)];
	  
	// Logitude
  	var adjLon = lon + 180;
  	fieldLon = UPPERCASE[Math.trunc(adjLon / 20)];
  	squareLon = ''+Math.trunc((adjLon / 2) % 10);
  	rLon = (adjLon - 2*Math.trunc(adjLon / 2)) * 60;
	subLon = LOWERCASE[Math.trunc(rLon / 5)];
	  
  	return fieldLon + fieldLat + squareLon + squareLat + subLon + subLat;
}

/* Get the Maidenhead Locator (grid square) for latitude and longitude objects.
 * 
 * This function can accept a variety of parameters, including:
 * * two parameters, `latitude` and `longitude`
 * * a single array of `[latitude, longitude]` 
 * * a single object with `lat` and `lon` keys (members)
 * * a single object with `latitude` and `longitude` keys (members)
 * * a single object with `lat()` and `lon()` functions
 * * a single object with `latitude()` and `longitude()` functions
 * 
 * All these varations must resolve to floating point numbers for both
 * latitude and longitude.
 * 
 * This function is a wrapper that decodes the parameters and calls
 * `gridForLatLon()` to perform the conversion/calculation.
 */ 
function latLonToGridSquare(param1, param2) {
	var lat = 0.0;
	var lon = 0.0;

	// Utility function to convert and validate floating point numbers.
	function toNum(x) {
		if (typeof (x) === 'number') {
			return x;
		}

		if (typeof (x) === 'string') {
			return parseFloat(x);
		}

		// If the parameter was a function...
		// dont call a function property here because of binding issue
		throw "HamGridSquare -- toNum -- can not convert input: " + x;
	}

	// support Chris Veness 2002-2012 LatLon library and
	// other objects with lat/lon properties
	// properties could be numbers, or strings
	if (typeof (param1) === 'object') {
		if (param1.length === 2) {
			// first parameter is an array `[lat, lon]`
			lat = toNum(param1[0]);
			lon = toNum(param1[1]);
			return gridForLatLon(lat, lon);
		}

		if (('lat' in param1) && ('lon' in param1)) {
			lat = (typeof (param1.lat) === 'function') ? toNum(param1.lat()) : toNum(param1.lat);
			lon = (typeof (param1.lon) === 'function') ? toNum(param1.lon()) : toNum(param1.lon);
			return gridForLatLon(lat, lon);
		}

		if (('latitude' in param1) && ('longitude' in param1)) {
			lat = (typeof (param1.latitude) === 'function') ? toNum(param1.latitude()) : toNum(param1.latitude);
			lon = (typeof (param1.longitude) === 'function') ? toNum(param1.longitude()) : toNum(param1.longitude);
			return gridForLatLon(lat, lon);
		}

		throw "HamGridSquare -- can not convert object -- " + param1;
	}

	lat = toNum(param1);
	lon = toNum(param2);
	return gridForLatLon(lat, lon);
}

/* Get the latitude and longitude for a Maidenhead (grid square) Locator.
 *
 * This function takes a single string parameter that is a Maidenhead (grid
 * square) Locator. It must be 4 or 6 characters in length and of the format.
 * * 4-character: `^[A-X][A-X][0-9][0-9]$`
 * * 6-character: `^[A-X][A-X][0-9][0-9][a-x][a-x]$`
 * * 8-character: `^[A-X][A-X][0-9][0-9][a-x][a-x][0-9][0-9]$` (not supported).
 * 
 * Returns an array of floating point numbers `[latitude, longitude]`.
 */
function latLonForGrid(grid) {
	var lat = 0.0;
	var lon = 0.0;
	
	function lat4(g){
		return 10 * (g.charCodeAt(1) - 'A'.charCodeAt(0)) + parseInt(g.charAt(3)) - 90;
	}
	
	function lon4(g){
		return 20 * (g.charCodeAt(0) - 'A'.charCodeAt(0)) + 2 * parseInt(g.charAt(2)) - 180;
	}

	if ((grid.length != 4) && (grid.length != 6)) {
		throw "grid square: grid must be 4 or 6 chars: " + grid;
	}

	if (/^[A-X][A-X][0-9][0-9]$/.test(grid)) {
		// Decode 4-character grid square
		lat = lat4(grid) + 0.5;
		lon = lon4(grid) + 1;
	} else if (/^[A-X][A-X][0-9][0-9][a-x][a-x]$/.test(grid)) {
		// Decode 6-character grid square
		lat = lat4(grid) + (1.0 / 60.0) * 2.5 * (grid.charCodeAt(5) - 'a'.charCodeAt(0) + 0.5);
		lon = lon4(grid) + (1.0 / 60.0) * 5 * (grid.charCodeAt(4) - 'a'.charCodeAt(0) + 0.5);
	} else {
		throw "gridSquareToLatLon: invalid grid: " + grid;
	}

	return [lat, lon];
};

/* Get the latitude and longitude for a Maidenhead (grid square) Locator.
 *
 * This function takes a single string parameter that is a Maidenhead (grid
 * square) Locator. It must be 4 or 6 characters in length and of the format.
 * * 4-character: `^[A-X][A-X][0-9][0-9]$`
 * * 6-character: `^[A-X][A-X][0-9][0-9][a-x][a-x]$`
 * * 8-character: `^[A-X][A-X][0-9][0-9][a-x][a-x][0-9][0-9]$` (not supported).
 * 
 * Returns an object based of the same type as the second parameter
 * * array of floating point numbers `[latitude, longitude]` (default return format)
 * * an object with `lat` and `lon` values if the second parameter is of type `object`
 * * a `LatLon` object if...
 */
function gridSquareToLatLon(grid, obj) {
	var returnLatLonConstructor = (typeof (LatLon) === 'function');
	var returnObj = (typeof (obj) === 'object');

	var [lat, lon] = latLonForGrid(grid);

	if (returnLatLonConstructor) {
		return new LatLon(lat, lon);
	}

	if (returnObj) {
		obj.lat = lat;
		obj.lon = lon;
		return obj;
	}

	return [lat, lon];
}

/* Test the grid square latitude and longitude conversion functions. */
function testGridSquare() {
	// First four test examples are from "Conversion Between Geodetic and Grid Locator Systems",
	// by Edmund T. Tyson N5JTY QST January 1989
	// original test data in Python / citations by Walter Underwood K6WRU
	// last test and coding into Javascript from Python by Paul Brewer KI6CQ
	var testData = [
		['Munich', [48.14666,11.60833], 'JN58td'],
		['Montevideo', [[-34.91,-56.21166]], 'GF15vc'],
		['Washington, DC', [{lat:38.92,lon:-77.065}], 'FM18lw'],
		['Wellington', [{latitude:-41.28333,longitude:174.745}], 'RE78ir'],
		['Newington, CT (W1AW)', [41.714775,-72.727260], 'FN31pr'],
		['Palo Alto (K6WRU)', [[37.413708,-122.1073236]], 'CM87wj'],
		['Chattanooga (KI6CQ/4)', [{lat:function(){ return "35.0542"; }, lon: function(){ return "-85.1142"}}], "EM75kb"],
		['Buxton (N1SH)', [43.686292, -70.549876], 'FN43rq']
	];
	var i=0,l=testData.length,result='',result2,result3,thisPassed=0,totalPassed=0;
	for(i=0;i<l;++i){
		result = latLonToGridSquare.apply({}, testData[i][1]);
		result2 = gridSquareToLatLon(result);
		result3 = latLonToGridSquare(result2);
		thisPassed = (result===testData[i][2]) && (result3===testData[i][2]);
		console.log("test "+i+": "+testData[i][0]+" "+JSON.stringify(testData[i][1])+
					" result = "+result+" result2 = "+result2+" result3 = "+result3+" expected= "+testData[i][2]+
					" passed = "+thisPassed);
		totalPassed += thisPassed;
	}
	console.log(totalPassed+" of "+l+" test passed");
	return totalPassed===l;
};

HamGridSquare = {
	latLonForGrid: latLonForGrid,
	gridForLatLon: gridForLatLon,
  	toLatLon: gridSquareToLatLon,
  	fromLatLon: latLonToGridSquare,
  	test: testGridSquare
};
