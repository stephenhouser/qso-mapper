// from http://k7fry.com/grid/index.js
function chr(x) { return String.fromCharCode(x); }
function floor(x) { return Math.floor(x); }

function returnQth(lat, lng) {
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
} // returnQth()

function fromQth(qth) {
		var i = 0;
		var l = new Array();

		// AA11bb22

		qth = qth.toUpperCase();
		while (i < 10) {
			l[i] = isNaN(qth.charCodeAt(i)) ? 0 : qth.charCodeAt(i) - 65;
			i++;
		}
		console.log(l);

		l[2] += 17; l[3] += 17;
		l[6] += 17; l[7] += 17;

		console.log(l);

		var lng = (l[0]*20 + l[2]*2 + l[4]/12 + l[6]/120 + l[8]/2880 - 180);
		var lat = (l[1]*10 + l[3] + l[5]/24 + l[7]/240 + l[9]/5760 - 90);
		return [lat, lng];
		//return new GLatLng(lat, lng);
} // fromQth()

// FN43AA00AA
// FN53AA00AA
// FN54AA00AA
// FN44AA00AA
// FN43AA00AA
//43.686347  Longitude: -70.54988
console.log(fromQth('FN43rq44ar'));

function findQth(qth) {
	qthLen = qth.length;
	// centerpoints. if not 10 characters, choose the middle of the square
	if (qthLen < 4)  qth += '55LL55LL';
	if (qthLen < 6)  qth += 'LL55LL';
	if (qthLen < 8)  qth += '55LL';
	if (qthLen < 10) qth += 'LL';

	var qthFormat = /[A-R]{2}[0-9]{2}[A-X]{2}[0-9]{2}[A-X]{2}/;
	if (qthFormat.test(qth)) {
		z = qthLen * 2 - 1;
		if (z > 17)	map.setZoom(17);
		else map.setZoom(z);
		map.setCenter(fromQth(qth));
		GEvent.trigger(map, "click", null, fromQth(qth));
	} else {
		window.alert('Enter either 2, 4, 6, 8 or 10 valid characters.');
	}
} // findQth()