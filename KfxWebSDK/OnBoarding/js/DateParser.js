var DateParser = (function () {
	function appendZero(str) {
		if (str.toString().length == 1) {
			str = "0" + str;
		}
		return str;
	}

	var parseToyyyymmdd = function (dateString) {
		if (dateString.length == 0) {
			return dateString;
		}
		var oldDate = new Date(dateString);
		var mm = appendZero(oldDate.getMonth() + 1); // getMonth() is zero-based
		var dd = appendZero(oldDate.getDate());

		return [oldDate.getFullYear(), "-", mm, "-", dd].join("");
	};

	return {
		parseToyyyymmdd: parseToyyyymmdd,
	};
})();
