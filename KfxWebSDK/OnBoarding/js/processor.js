var ProcessorModule = (function () {
	var checkDepositProcessorOptions = null,
		mobileIdProcessorOptions = null,
		creditCardProcessorOptions = null;

	var setDefaultOptions = function () {
		checkDepositProcessorOptions = {
			ProcessOnServer: true,
			doProcess: true,
			autoCrop: true,
			mode: "B/W",
			deskew: "on",
			cropPadding: 0,
			dpi: "200",
		};
		mobileIdProcessorOptions = {
			ProcessOnServer: true,
			doProcess: false,
			autoCrop: true,
			mode: "B/W",
			deskew: "on",
			cropPadding: 0,
			dpi: "300",
		};
		creditCardProcessorOptions = {
			ProcessOnServer: true,
			doProcess: false,
			autoCrop: true,
			mode: "B/W",
			deskew: "on",
			cropPadding: 0,
			dpi: "200",
		};
		passportProcessorOptions = {
			ProcessOnServer: true,
			doProcess: false,
			autoCrop: true,
			mode: "B/W",
			deskew: "on",
			cropPadding: 0,
			dpi: "200",
		};
	};

	setDefaultOptions();
	var sendCallback = function (callback, data) {
		if (typeof callback === "function") {
			callback(data);
		}
	};

	return {
		checkDepositProcessorOptions: checkDepositProcessorOptions,
		mobileIdProcessorOptions: mobileIdProcessorOptions,
		creditCardProcessorOptions: creditCardProcessorOptions,
		passportProcessorOptions: passportProcessorOptions,
	};
})();
