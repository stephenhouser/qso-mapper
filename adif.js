
/* adif.js - Parse ADIF files (https://adif.org) into JavaScript array of QSOs
 *
 * 2020/09/05 Stephen Houser, N1SH
*/

(function () {
	function parseAdif(adifFileData) {
		var qsos = [];

		// remove all newlines from the file before parsing
		cleanAdifData = adifFileData.replace(/(\r\n\t|\n|\r\n|\r\t)/gm, "");

		//console.log(cleanAdifData);

		var filePartsMatch = cleanAdifData.match(/(.*)\<eoh>(.*)/i);
		if (filePartsMatch && filePartsMatch.length == 3) {
			header = filePartsMatch[1];
			body = filePartsMatch[2];

			qsoMatches = body.match(/(.*?)\<eor\>/gi);
			for (var q = 0; q < qsoMatches.length; q++) {
				qso = parseRecord(qsoMatches[q]);
				qsos.push(qso);
			}
		} else {
			throw "Invalid ADIF file. Cannot find header marker <eoh>.";
		}

		return [header, qsos];
	}

	// Series of `<name:len>data` fields
	/* parseRecord - parse an ADIF record into a QSO object */
	function parseRecord(record) {
		var qso = {};

		fields = record.match(/\<(.+?):.+?\>([^\<]+)/g);
		for (var f = 0; f < fields.length; f++) {
			var f_v = parseField(fields[f]);
			if (f_v !== null && f_v.length == 2) {
				qso[f_v[0].toLowerCase()] = f_v[1];
			}
		}

		qso = addDateTimeToQso(qso);
		return qso;
	}

	/* addDateTimeToQso - Adds a computed `date_time` field to the QSO in memory.
	 *
	 * This is used later on when displaying the 
	 */
	function addDateTimeToQso(qso) {
		var dString = qso.qso_date.substring(0, 4) + '/'
			+ qso.qso_date.substring(4, 6) + '/'
			+ qso.qso_date.substring(6);

		var tString = qso.time_on.substring(0, 2) + ':'
			+ qso.time_on.substring(2, 4);
		if (qso.time_on.length > 4) {
			tString = tString + ':' + qso.time_on.substring(4);
		}

		newQso = qso;
		newQso['date_time'] = dString + ' ' + tString;
		return newQso;
	}

	// `<name:len>data`
	// <gridsquare:4>FN43
	/* parseField - parse a single ADIF field into a javascript value */
	function parseField(field) {
		// don't capture whitespace at end of field
		var field_value = field.match(/\<(.+?):.+?\>(.*?)\s*$/);
		if (field_value !== null) {
			return [field_value[1].toLowerCase(), field_value[2]]; // lowercased the ADIF fields
		}

		return null;
	}

	/* parseCoordinate - parse an ADIF formatted coordinate to decimal.
	 *
	 */
	function parseCoordinate(dms) {
		if (typeof dms !== "string") {
			throw "parseCoordinate: Invalid (null) coordinate passed.";
		}

		// Ex: N040 26.719
		halfDecimalMatch = dms.match(/([NSEW])([0-9]+)\s+([0-9]*\.?[0-9]+)/);
		if (halfDecimalMatch != null) {
			var [_, direction, degrees, minutes] = halfDecimalMatch;
			var dd = parseInt(degrees) + parseFloat(minutes) / 60;
			if (direction == "S" || direction == "W") {
				dd = -dd;
			}

			return dd;
		}

		// Ex: 43° 41' 11'' N     -70° 32' 60'' W
		fullDMSMatch = dms.match(
			/([+-][0-9]{1,2})°?\s+([0-9]{1,2})'?\s+([0-9]{1,2})(["']{1,2})?\s+([NSEW])/
		);
		if (fullDMSMatch != null) {
			var [_, degrees, minutes, seconds, _, hemisphere] = coordinate.match(
				/([+-][0-9]{1,2})°?\s+([0-9]{1,2})'?\s+([0-9]{1,2})(["']{1,2})?\s+([NSEW])/
			);
			var dd =
				parseInt(degrees) +
				parseFloat(minutes) / 60 +
				parseFloat(seconds) / 60 / 60;
			if (hemisphere === "S" || hemisphere === "W") {
				dd = -1 * dd;
			}

			return dd;
		}

		return dms;
	}

	function testAll() {
		console.log('Not implemented');
		return false;
	}

	/* Export public functions */
	var adifExports = {
		parseAdif: parseAdif,
		parseCoordinate: parseCoordinate,
		test: testAll
	};

	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = adifExports;
	} else {
		window.Adif = adifExports;
	}
})();

