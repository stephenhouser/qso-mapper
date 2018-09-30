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
#:Synopsis
#
# use Ham::Locator;
# my $m = new Ham::Locator;
# $m->set_loc('IO93lo');
# my ($latitude, $longitude) = $m->loc2latlng;
#=======================================================================
#
# With thanks to:-
# * http://home.arcor.de/waldemar.kebsch/The_Makrothen_Contest/fmaidenhead.js
# * http://no.nonsense.ee/qthmap/index.js
*/
function _l2n(letter) {
	var lw = letter.toLowerCase();
	return lw.charCodeAt(0) - 'a'.charCodeAt(0);
}

function _n2l(number) {
	return 'abcdefghijklmnopqrstuvwxyz'.charAt(number);
}

function latl_n2loc(latitude, longitude, precision) {
	if (latitude === null || longitude === null) {
		return null;
	}

	var field_lat = parseFloat(latitude);
	var field_lng = parseFloat(longitude);

	var locator = '';

	var lat = field_lat + 90;
	var lng = field_lng + 180;

	// Field
	lat = (lat / 10) + 0.0000001;
	lng = (lng / 20) + 0.0000001;
	locator += _n2l(Math.floor(lng)) + _n2l(Math.floor(lat));

	// Square
	lat = 10 * (lat - Math.floor(lat));
	lng = 10 * (lng - Math.floor(lng));
	locator += Math.floor(lng).toString() + Math.floor(lat).toString();

	// Subsquare
	lat = 24 * (lat - Math.floor(lat));
	lng = 24 * (lng - Math.floor(lng));
	locator += _n2l(Math.floor(lng)) + _n2l(Math.floor(lat));

	// Extended square
	lat = 10 * (lat - Math.floor(lat));
	lng = 10 * (lng - Math.floor(lng));
	locator += Math.floor(lng).toString() + Math.floor(lat).toString();

	// Extended Subsquare
	lat = 24 * (lat - Math.floor(lat));
	lng = 24 * (lng - Math.floor(lng));
	locator += _n2l(Math.floor(lng)) + _n2l(Math.floor(lat));

	if (precision !== null) {
		return locator.substring(0, precision)
	}

	return locator;
}
         
function loc2latlng(locator) {
	if (typeof (locator) !== 'string' || locator === "") {
		return null;
	}

	var loc = locator; //.toUpperCase();
 
	if (locator.length < 4) {
		loc += '55LL55LL';
	} else if (locator.length < 6) {
		loc += 'LL55LL';
	} else if (locator.length < 8) {
		loc += '55LL';
	} else if (locator.length < 10) {
		loc += 'LL';
	}

	if (! /^[a-rA-R]{2}[0-9]{2}[a-xA-X]{2}[0-9]{2}[a-xA-X]{2}$/.test(loc)) {
		// throw 'Not a valid locator';
		return null;
	}

	loc = loc.toLowerCase();
	var i = 0;
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


var [lat, lng] = loc2latlng('FN43rq');
console.log(lat + ', ' + lng);
var loc = latl_n2loc(lat, lng);
console.log(loc);