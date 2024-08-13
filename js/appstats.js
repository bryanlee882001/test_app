var initialExtractionValuesForAppStats = [];

function FieldChangeOption() {
	this.IsValid = "";
	this.ErrorDescription = "";
	this.FormattingFailed = null;
	this.FieldName = "";
	this.OriginalValue = "";
	this.Confidence = null;
	this.ChangedValue = "";
	this.DocumentID = "";
}

var AppStatsModule = (function () {
	var appStatsOptions = {
		AppStatsEnabled: false,
		AppStatsServerURL: "https://use_a_valid_URL_instead_of_this",
	};

	var initAppStats = function () {
		KfxWebSDK.AppStats.initAppStats(
			function (initSuccess) {
				console.log("init app stats initSuccess:" + initSuccess);
			},
			function (initError) {
				console.log("init app stats initError" + initError);
			}
		);
	};

	var startAppStats = function (successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && !isAppstatsRecording()) {
			KfxWebSDK.AppStats.startRecord(
				function (startSuccess) {
					console.log("app stats startSuccess" + startSuccess);
					successCB(startSuccess);
				},
				function (startError) {
					console.log("app stats startError" + startError);
					errorCB(startError);
				}
			);
		}
	};

	var stopAppStats = function (successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && isAppstatsRecording()) {
			KfxWebSDK.AppStats.stopRecord(
				function (stopSuccess) {
					console.log("app stats stopSuccess" + stopSuccess);
					successCB(stopSuccess);
				},
				function (stopError) {
					console.log("app stats stopError" + stopError);
					errorCB(stopError);
				}
			);
		}
	};

	var beginAppStatsSession = function (sessionID, categoryType, successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && isAppstatsRecording()) {
			var options = { sessionkey: "", category: "" };

			options.sessionkey = sessionID;
			options.category = categoryType;

			KfxWebSDK.AppStats.beginSession(
				options,
				function (beginSuccess) {
					console.log("app stats beginSuccess" + beginSuccess);
					successCB(beginSuccess);
				},
				function (beginError) {
					console.log("app stats beginError" + beginError);
					errorCB(beginError);
				}
			);
		}
	};

	var endAppStatsSession = function (isSuccess, description, successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && isAppstatsRecording()) {
			KfxWebSDK.AppStats.endSession(
				{ success: isSuccess, message: description },
				function (endSessionSuccess) {
					console.log("app stats endSessionSuccess" + endSessionSuccess);
					successCB(endSessionSuccess);
				},
				function (endsessionError) {
					console.log("app stats endsessionError" + endsessionError);
					errorCB(endsessionError);
				}
			);
		}
	};

	var exportAppstats = function (successCB, errorCB) {
		KfxWebSDK.AppStats.exportAppStats(
			function (exportSuccess) {
				console.log("app stats exportSuccess" + JSON.stringify(exportSuccess));

				sendAppStatsToServer(exportSuccess);
				successCB(exportSuccess);
			},
			function (exportError) {
				console.log("app stats exportError" + exportError);
				errorCB(exportError);
			}
		);
	};

	var isAppstatsRecording = function () {
		return KfxWebSDK.AppStats.isRecording();
	};

	var logAppStatsSession = function (sessionString, responseString, successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && isAppstatsRecording()) {
			var options = { sessionType: "", response: "" };
			options.sessionType = sessionString;
			options.response = responseString;
			KfxWebSDK.AppStats.logSessionEvent(
				options,
				function (logSessionSuccess) {
					console.log("app stats logSessionSuccess" + logSessionSuccess);
					successCB(logSessionSuccess);
				},
				function (logSessionError) {
					console.log("app stats logSessionError" + logSessionError);
					errorCB(logSessionError);
				}
			);
		}
	};

	var logFieldChangeEvent = function (options, successCB, errorCB) {
		if (appStatsOptions.AppStatsEnabled && isAppstatsRecording()) {
			KfxWebSDK.AppStats.logFieldChangeEvent(
				options,
				function (logFieldChangeSuccess) {
					console.log("app stats logFieldChangeEvent success" + logFieldChangeSuccess);
					successCB(logFieldChangeSuccess);
				},
				function (logFieldChangeError) {
					console.log("app stats logFieldChangeEvent error" + logFieldChangeError);
					errorCB(logFieldChangeError);
				}
			);
		}
	};

	var sendAppStatsToServer = function (data) {
		$.ajax({
			type: "PUT",
			url: appStatsOptions.AppStatsServerURL,
			data: data,
			success: function (successdata) {
				console.log(successdata);
			},
		});
	};

	function recordFieldChangeEventsinAppStats(options) {
		AppStatsModule.logFieldChangeEvent(
			options,
			function (success) {
				console.log("app- appstats logFieldChangeEvent success" + success);
			},
			function (error) {
				console.log("app- appstats logFieldChangeEvent error" + error);
			}
		);
	}

	return {
		appStatsOptions: appStatsOptions,
		initAppStats: initAppStats,
		startAppStats: startAppStats,
		stopAppStats: stopAppStats,
		beginAppStatsSession: beginAppStatsSession,
		endAppStatsSession: endAppStatsSession,
		logAppStatsSession: logAppStatsSession,
		exportAppstats: exportAppstats,
		logFieldChangeEvent: logFieldChangeEvent,
		isAppstatsRecording: isAppstatsRecording,
		recordFieldChangeEventsinAppStats: recordFieldChangeEventsinAppStats,
	};
})();
