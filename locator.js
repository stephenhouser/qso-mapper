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
function latln2loc(latitude, longitude, precision) {
	if (latitude === null || longitude === null) {
		return null;
	}

	var locator = '';
	var lat = parseFloat(latitude) + 90;
	var lon = parseFloat(longitude) + 180;

	// Field
	lat = (lat / 10) + 0.0000001;
	lon = (lon / 20) + 0.0000001;
	locator += _n2l(Math.floor(lon)) + _n2l(Math.floor(lat));

	// Square
	lat = 10 * (lat - Math.floor(lat));
	lon = 10 * (lon - Math.floor(lon));
	locator += Math.floor(lon).toString() + Math.floor(lat).toString();

	// Subsquare
	lat = 24 * (lat - Math.floor(lat));
	lon = 24 * (lng - Math.floor(lon));
	locator += _n2l(Math.floor(lon)) + _n2l(Math.floor(lat));

	// Extended square
	lat = 10 * (lat - Math.floor(lat));
	lon = 10 * (lon - Math.floor(lng));
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
		
/* loc2latlng - return latitude and longitude for Maidenhead (grid square) Locator.
 *
 * - `locator` is a string of the format `[a-rA-R]{2}[0-9]{2}[a-xA-X]{2}[0-9]{2}[a-xA-X]{2}`
 * - returns `[latitude, longitude]` as floating point numbers
 */
function loc2latlng(locator) {
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
	var lng = ((l[0] * 20) + (l[2] * 2) + (l[4] / 12) + (l[6] / 120) + (l[8] / 2880) - 180);
    return [lat, lng];
}

//loc2latlng("");
// loc2latlng('FN');
// loc2latlng("FN43");
// loc2latlng("FN43rq");
// loc2latlng("FN43rq12");
// loc2latlng("FN43rq12ss");

// var [lat, lng] = loc2latlng('FN43rq');
// console.log(lat + ', ' + lng);
// var loc = latl_n2loc(lat, lng);
// console.log(loc);