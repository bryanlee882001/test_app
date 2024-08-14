Utils = (function () {
	/**
	 * Converts the Imagedata of an image to DataURL format
	 *
	 * @param {Object} imageData : ImageData of an image
	 * @return {Object} dataURL : the dataURL   format of an image
	 * @api public
	 */

	function convertImageDataToDataURL(imageData) {
		var canvas = document.createElement("canvas");
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		var context = canvas.getContext("2d");
		context.putImageData(imageData, 0, 0);
		var dataUrl = canvas.toDataURL("image/jpeg");
		context = null;
		canvas = null;
		return dataUrl;
	}

	/**
	 * Converts the Imagedata of an image to Base64 format
	 *
	 * @param {Object} imageData : ImageData of an image
	 * @return {Object} base64 : the base64   format of an image
	 * @api public
	 */

	function convertImageDataToBase64(imageData) {
		var canvas = document.createElement("canvas");
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		var context = canvas.getContext("2d");
		context.putImageData(imageData, 0, 0);
		var dataUrl = canvas.toDataURL("image/jpeg");
		var base64 = dataUrl.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
		context = null;
		canvas = null;
		dataUrl = null;
		return base64;
	}

	/**
	 * Converts the Unit8Array of an image to Base64 format
	 *
	 * @param {Object} u8Arr : Unit8Array
	 * @return {Object} base64 : the base64   format of an image
	 * @api public
	 */

	function convertUint8ArrayToBase64(u8Arr) {
		var CHUNK_SIZE = 0x8000; //arbitrary number
		var index = 0;
		var length = u8Arr.length;
		var result = "";
		var slice;
		while (index < length) {
			slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
			result += String.fromCharCode.apply(null, slice);
			index += CHUNK_SIZE;
		}
		return btoa(result);
	}

	/**
	 * Converts the Data URL  of an canvas to Unit8Array
	 *
	 * @param {Object} data : Data URL or Base64  of an image
	 * @return {Object} binary : The Unit8Array of an image
	 * @api public
	 */

	function dataUrlToUint8Array(data) {
		var base64 = data.replace(/^data:image\/(jpeg|jpg|png);base64,/, ""); // Remove leading mimetype
		var base64Map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var length = (Math.floor(base64.length) / 4) * 3;
		if (base64Map.charAt(base64.length - 1) === "=") {
			length--;
		}
		if (base64Map.charAt(base64.length - 2) === "=") {
			length--;
		}
		var binary = new Uint8Array(length);
		var byteIndex = 0;
		for (var i = 0; i < base64.length; i += 4) {
			var c1 = base64Map.indexOf(base64.charAt(i + 0));
			var c2 = base64Map.indexOf(base64.charAt(i + 1));
			var c3 = base64Map.indexOf(base64.charAt(i + 2));
			var c4 = base64Map.indexOf(base64.charAt(i + 3));
			var b1 = (c1 << 2) | (c2 >> 4);
			var b2 = ((c2 & 15) << 4) | (c3 >> 2);
			var b3 = ((c3 & 3) << 6) | c4;
			binary[byteIndex] = b1;
			//console.log('b1: ' + b1);
			if (c3 != 64) {
				binary[byteIndex + 1] = b2;
				//console.log('b2: ' + b2);
			}
			if (c4 != 64) {
				binary[byteIndex + 2] = b3;
				//console.log('b3: ' + b3);
			}
			byteIndex += 3;
		}
		return binary;
	}

	// to generate random Unique identifier.
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
	}

	function showLoadingIndicator() {
		$("body").append('<div class="modalWindow"/>');
		$.mobile.loading("show", {
			text: "Please wait",
			textVisible: true,
			theme: "b",
			html: "",
		});
	}

	function hideLoadingIndicator() {
		$(".modalWindow").remove();
		$.mobile.loading("hide");
	}

	var toast = function () {
		var x = document.getElementById("snackbar");
		x.className = "show";
		setTimeout(function () {
			x.className = x.className.replace("show", "");
		}, 3000);
	};

	var hideKeyboard = function () {
		document.activeElement.blur();
	};

	var numberValidate = function (evt) {
		var theEvent = evt || window.event;
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
		var regex = /[0-9]/;
		if (!regex.test(key)) {
			theEvent.returnValue = false;
			if (theEvent.preventDefault) theEvent.preventDefault();
		}
	};

	var ssnValidate = function (evt) {
		var theEvent = evt || window.event;
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
		var regex = /[0-9]|\-/;
		if (!regex.test(key)) {
			theEvent.returnValue = false;
			if (theEvent.preventDefault) theEvent.preventDefault();
		}
	};

	var amountValidate = function (evt) {
		var theEvent = evt || window.event;
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
		var regex = /[0-9]|\./;
		if (!regex.test(key)) {
			theEvent.returnValue = false;
			if (theEvent.preventDefault) theEvent.preventDefault();
		}
	};

	var isIOSDevice = function () {
		var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		return isIOS;
	};
	function defaultStructureForKTAOptions() {
		var defaultStructureForKTAOptions = {
			url: "",
			images: [],
			timingInfo: false,
			serverParameters: {
				documentGroupName: "",
				documentName: "",
				password: "",
				processIdentityName: "",
				username: "",
				ktaDeleteDocument: "NO",
				sessionId: null,
			},
		};
		return defaultStructureForKTAOptions;
	}

	function defaultStructureForKTAMobileIDOptions() {
		var defaultStructureForKTAOptions = {
			url: "",
			images: [],
			timingInfo: false,
			serverParameters: {
				documentGroupName: "",
				documentName: "",
				password: "",
				processIdentityName: "",
				username: "",
				ktaDeleteDocument: "NO",
				sessionId: null,
				ExtractPhotoImage: true,
			},
		};
		return defaultStructureForKTAOptions;
	}

	function defaultStructureForSelfieOptions() {
		var defaultStructureForSelfieOptions = {
			url: "",
			images: [],
			timingInfo: false,
			serverParameters: {
				processIdentityName: "",
				sessionId: null,
				TransactionId: "",
			},
		};
		return defaultStructureForSelfieOptions;
	}

	function defaultStructureForRTTIOptions() {
		var defaultStructureForRTTIOptions = {
			url: "",
			images: [],
			timingInfo: false,
			serverParameters: {},
		};
		return defaultStructureForRTTIOptions;
	}

	function getCurrentModuleName() {
		var currentModuleName = "";
		if (currentModule == Module.MOBILEID) {
			currentModuleName = "MobileID";
		} else if (currentModule == Module.CHECK) {
			currentModuleName = "CheckDeposit";
		} else if (currentModule == Module.BILLPAY) {
			currentModuleName = "BillPay";
		} else if (currentModule == Module.CREDITCARD) {
			currentModuleName = "CreditCard";
		} else if (currentModule == Module.PASSPORT) {
			currentModuleName = "MobileID";
		}
		return currentModuleName;
	}

	function isJSONValid(jsonString) {
		try {
			JSON.parse(jsonString);
		} catch (e) {
			return false;
		}
		return true;
	}

	function iOSVersion() {
		if (/iP(hone|od|ad)/.test(navigator.platform)) {
			var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
			return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		}
	}

	return {
		convertImageDataToDataURL: convertImageDataToDataURL,
		dataUrlToUint8Array: dataUrlToUint8Array,
		convertImageDataToBase64: convertImageDataToBase64,
		convertUint8ArrayToBase64: convertUint8ArrayToBase64,
		showLoadingIndicator: showLoadingIndicator,
		hideLoadingIndicator: hideLoadingIndicator,
		toast: toast,
		hideKeyboard: hideKeyboard,
		numberValidate: numberValidate,
		amountValidate: amountValidate,
		ssnValidate: ssnValidate,
		defaultStructureForKTAOptions: defaultStructureForKTAOptions,
		defaultStructureForKTAMobileIDOptions: defaultStructureForKTAMobileIDOptions,
		defaultStructureForRTTIOptions: defaultStructureForRTTIOptions,
		defaultStructureForSelfieOptions: defaultStructureForSelfieOptions,
		guid: guid,
		getCurrentModuleName: getCurrentModuleName,
		isJSONValid: isJSONValid,
		isIOSDevice: isIOSDevice,
		iOSVersion: iOSVersion,
	};
})();
