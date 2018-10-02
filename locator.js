/* locator.js - Amatuer Radio Maidenhead (grid square) Locator functions.
 *
 * This is a JavaScript adaptation of the Perl Ham::Locator code attributed below.
 * 
 * (c) 2018 Stephen Houser <stephenhouser@gmail.com>
 */

/*
#=======================================================================
# Locator.pm / Ham::Locator
# $Id: Locator.pm 10 2011-01-16 15:36:53Z andys $
# $HeadURL: http://daedalus.dmz.dn7.org.uk/svn/Ham-Locator/lib/Ham/Locator.pm $
# (c)2010 Andy Smith <andy.smith@nsnw.co.uk>
#-----------------------------------------------------------------------
#:Description
# Module to easily convert between Maidenhead locators and coordinates
# in latitude and longitude format.
#-----------------------------------------------------------------------
#
# With thanks to:-
# * http://home.arcor.de/waldemar.kebsch/The_Makrothen_Contest/fmaidenhead.js
# * http://no.nonsense.ee/qthmap/index.js
*/

(function () {
	/* l2n - Letter To Number -- return offset of letter from 'a' */
	function _l2n(letter) {
		var lw = letter.toLowerCase();
		return lw.charCodeAt(0) - 'a'.charCodeAt(0);
	}

	/* n2l - Number To Letter -- return letter for offset from 'a' */
	function _n2l(number) {
		return 'abcdefghijklmnopqrstuvwxyz'.charAt(number);
	}

	/* latln2loc - return latitude and longitude for Maidenhead (grid square) Locator.
	*
	* - `latitude` and `longitude` are floating point numbers
	* - `precision` is the number of places to round the grid square locator to
	* - returns a string of the format `[a-rA-R]{2}[0-9]{2}[a-xA-X]{2}[0-9]{2}[a-xA-X]{2}`
	*/
	function latlon2loc(latitude, longitude, precision) {
		if (latitude === null || longitude === null) {
			return null;
		}

		var locator = '';
		var lat = parseFloat(latitude) + 90;
		var lon = parseFloat(longitude) + 180;

		// Field
		lat = (lat / 10) + 0.0000001;
		lon = (lon / 20) + 0.0000001;
		locator += _n2l(Math.floor(lon)).toUpperCase() + _n2l(Math.floor(lat)).toUpperCase();

		// Square
		lat = 10 * (lat - Math.floor(lat));
		lon = 10 * (lon - Math.floor(lon));
		locator += Math.floor(lon).toString() + Math.floor(lat).toString();

		// Subsquare
		lat = 24 * (lat - Math.floor(lat));
		lon = 24 * (lon - Math.floor(lon));
		locator += _n2l(Math.floor(lon)) + _n2l(Math.floor(lat));

		// Extended square
		lat = 10 * (lat - Math.floor(lat));
		lon = 10 * (lon - Math.floor(lon));
		locator += Math.floor(lon).toString() + Math.floor(lat).toString();

		// Extended Subsquare
		lat = 24 * (lat - Math.floor(lat));
		lon = 24 * (lon - Math.floor(lon));
		locator += _n2l(Math.floor(lon)) + _n2l(Math.floor(lat));

		// Round to precision (if specified)
		if (precision !== null) {
			return locator.substring(0, precision)
		}

		return locator;
	}

	/* loc2latlon - return latitude and longitude for Maidenhead (grid square) Locator.
	*
	* - `locator` is a string of the format `[a-rA-R]{2}[0-9]{2}[a-xA-X]{2}[0-9]{2}[a-xA-X]{2}`
	* - returns `[latitude, longitude]` as floating point numbers
	*/
	function loc2latlon(locator) {
		if (typeof (locator) !== 'string' || locator.length < 2 || locator.length > 10) {
			throw 'Invalid Maidenhead (grid square) Locator: ' + locator;
			return null;
		}

		// If locator is not complete, pad to center of more specific locator
		var loc = locator + '--55LL55LL'.substring(locator.length);

		if (! /^[a-rA-R]{2}[0-9]{2}[a-xA-X]{2}[0-9]{2}[a-xA-X]{2}$/.test(loc)) {
			throw "Invalid Maidenhead (grid square) Locator: " + locator;
			return null;
		}

		loc = loc.toLowerCase();
		var l = [];

		for (var i = 0; i < 10; i++) {
			var a = loc.substring(i, i + 1);
			if (/[a-zA-Z]/.test(a)) {
				l.push(_l2n(a))
			} else {
				l.push(parseInt(a));
			}
		}

		var lat = ((l[1] * 10) + l[3] + (l[5] / 24) + (l[7] / 240) + (l[9] / 5760) - 90);
		var lon = ((l[0] * 20) + (l[2] * 2) + (l[4] / 12) + (l[6] / 120) + (l[8] / 2880) - 180);
		return [lat, lon];
	}

	// First four test examples are from "Conversion Between Geodetic and Grid Locator Systems",
	// by Edmund T. Tyson N5JTY QST January 1989
	// original test data in Python / citations by Walter Underwood K6WRU
	// last test and coding into Javascript from Python by Paul Brewer KI6CQ
	var testData = [
		['Munich', [48.14666, 11.60833], 'JN58td'],
		['Montevideo', [-34.91, -56.21166], 'GF15vc'],
		['Washington, DC', [38.92, -77.065], 'FM18lw'],
		['Wellington', [-41.28333, 174.745], 'RE78ir'],
		['Newington, CT (W1AW)', [41.714775, -72.727260], 'FN31pr'],
		['Palo Alto (K6WRU)', [37.413708, -122.1073236], 'CM87wj'],
		['Chattanooga (KI6CQ/4)', [35.0542, -85.1142], "EM75kb"],
		['Buxton (N1SH)', [43.686292, -70.549876], 'FN43rq']
	];

	function testAll() {
		//loc2latlon("");
		loc2latlon("FN");
		loc2latlon("FN43");
		loc2latlon("FN43rq");
		loc2latlon("FN43rq12");
		loc2latlon("FN43rq12ss");

		var [lat, lon] = loc2latlon("FN43rq");
		console.log(lat + ", " + lon);
		var loc = latlon2loc(lat, lon);
		console.log(loc);
		testToGrid();

		// testToLatLon fails, see below
		//testToLatLon();
	}

	function testToGrid() {
		var testsPassed = 0;
		for (var i = 0; i < testData.length; i++) {
			var [name, [lat, lon], grid] = testData[i];
			var result;

			var computedGrid = latlon2loc(lat, lon, grid.length);
			if (computedGrid === grid) {
				testsPassed++;
				result = 'passed';
			} else {
				result = 'failed';
			}

			console.log('testToGrid ' + i + ' [' + name + '] ' 
				+ 'expected="' + grid + '" ' 
				+ 'got="' + computedGrid + '" '
				+ result);
		}

		console.log('testToGrid ' + testsPassed + ' of ' + testData.length + " tests passed");
		return testsPassed;
	}

	function testToLatLon() {
		// These fail becuase loc2latlon returns the CENTER of the grid square
		// and our data points are not the center of their grid squares.
		function compareFloat(x, y) {
			var fx = x.toFixed(2);
			var fy = y.toFixed(2);
			// console.log('compare ' + fx + ' === ' + fy);
			return fx === fy;
		}

		var testsPassed = 0;
		for (var i = 0; i < testData.length; i++) {
			var [name, [lat, lon], grid] = testData[i];
			var result;

			var [computedLat, computedLon] = loc2latlon(grid);
			if (compareFloat(computedLat, lat) && compareFloat(computedLon, lon)) {
				testsPassed++;
				result = "passed";
			} else {
				result = "failed";
			}

			console.log('testToLatLon ' + i + ' [' + name + '] '
				+ 'expected=(' + lat + ', ' + lon + ') '
				+ 'got=(' + computedLat + ', ' + computedLon + ') '
				+ result);
		}

		console.log("testToLatLon " + testsPassed + " of " + testData.length + " tests passed");
		return testsPassed;
	}

	/* Export public functions */
	var locatorExports = {
		loc2latlon: loc2latlon,
		latln2loc: latlon2loc,
		test: testAll
	};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = locatorExports;
	} else {
		window.Locator = locatorExports;
	}
})();


