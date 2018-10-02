
(function () {
	function parseAdif(adifFileData) {
		var qsos = [];

		// remove all newlines from the file before parsing
		cleanAdifData = adifFileData.replace(/(\r\n\t|\n|\r\t)/gm, "");

		var filePartsMatch = cleanAdifData.match(/(.*)\<eoh>(.*)/);
		if (filePartsMatch && filePartsMatch.length == 3) {
			body = filePartsMatch[2];

			qsoMatches = body.match(/(.*?)\<eor\>/g);
			for (var q = 0; q < qsoMatches.length; q++) {
				qso = parseRecord(qsoMatches[q]);
				qsos.push(qso);
			}
		} else {
			throw "Invalid ADIF file. Cannot find header marker <eoh>.";
		}

		return qsos;
	}

	// Series of `<name:len>data` fields
	function parseRecord(record) {
		var qso = {};

		fields = record.match(/\<(.+?):.+?\>([^\<]+)/g);
		for (var f = 0; f < fields.length; f++) {
			var f_v = parseField(fields[f]);
			if (f_v !== null && f_v.length == 2) {
				qso[f_v[0]] = f_v[1];
			}
		}

		return qso;
	}

	// `<name:len>data`
	// <gridsquare:4>FN43
	function parseField(field) {
		// don't capture whitespace at end of field
		var field_value = field.match(/\<(.+?):.+?\>(.*?)\s*$/);
		if (field_value !== null) {
			return [field_value[1], field_value[2]];
		}

		return null;
	}

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
	}

	function testAll() {
		console.log('Not implemented');
		return false;
	}

	/* Export public functions */
	var adifExports = {
		parseAdif: parseAdif,
		test: testAll
	};

	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = adifExports;
	} else {
		window.Adif = adifExports;
	}
})();

