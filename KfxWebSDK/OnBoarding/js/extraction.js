var ExtractionModule = (function () {
	var CROSS_DOMAIN_ERROR = "Protocol mismatch: Please make sure that your server has a secure connection.";
	var ktaSuccessCallback, ktaErrorCallback;
	return {
		extractionWithRttiServer: function (options, successCallback, errorCallback) {
			if (isHttpsUsed(window.location.protocol) && !isHttpsUsed(options.url)) {
				errorCallback({ message: CROSS_DOMAIN_ERROR });
				return;
			}
			options.serverParameters.SessionKey = AppStatsModule.appStatsOptions.AppStatsEnabled
				? rttiSessionKey
				: Utils.guid();
			AppStatsModule.logAppStatsSession(
				"RTTIRequest",
				JSON.stringify(options.serverParameters),
				function (success) {
					console.log(success);
				},
				function (error) {
					alert(error);
				}
			);
			KfxWebSDK.DocumentExtractor.performExtractionWithRttiServer(options, successCallback, errorCallback);
		},
		extractionWithKtaServer: function (options, successCallback, errorCallback) {
			if (isHttpsUsed(window.location.protocol) && !isHttpsUsed(options.url)) {
				errorCallback({ message: CROSS_DOMAIN_ERROR });
				return;
			}
			ktaSuccessCallback = successCallback;
			ktaErrorCallback = errorCallback;
			AppStatsModule.logAppStatsSession(
				"KTARequest",
				JSON.stringify(options.serverParameters),
				function (success) {
					console.log(success);
				},
				function (error) {
					alert(error);
				}
			);
			KfxWebSDK.DocumentExtractor.executeRequestOnKtaServer(
				options,
				successCallbackForAppStatsLogging,
				errorCallbackForAppStatsLogging
			);
		},
		cancelExtraction: function () {
			KfxWebSDK.DocumentExtractor.cancelExtraction();
		},
	};

	function isHttpsUsed(serverUrl) {
		return serverUrl.indexOf("https") >= 0;
	}

	function successCallbackForAppStatsLogging(successResponse, timingInfoValues) {
		//KTA response event record
		AppStatsModule.logAppStatsSession(
			"KTAResponse",
			JSON.stringify(successResponse),
			function (success) {
				//KTA response status event record
				AppStatsModule.logAppStatsSession(
					"KTAResponseStatus",
					"Completed",
					function (success) {
						if (successResponse.documentId === undefined || successResponse.documentId === null) {
							successResponse.documentId = " ";
						}
						//KTA response event  record Document ID
						AppStatsModule.logAppStatsSession(
							"KTADocumentId",
							successResponse.documentId,
							function (success) {
								if (successResponse.JobId === undefined || successResponse.JobId === null) {
									successResponse.JobId = " ";
								}
								//KTA response status event record JobID
								AppStatsModule.logAppStatsSession(
									"KTAJobId",
									successResponse.JobId,
									function (success) {
										console.log(success);
									},
									function (error) {
										alert(error);
									}
								);
								console.log(success);
							},
							function (error) {
								alert(error);
							}
						);
						console.log(success);
					},
					function (error) {
						alert(error);
					}
				);
				console.log(success);
			},
			function (error) {
				alert(error);
			}
		);

		ktaSuccessCallback(successResponse, timingInfoValues);
	}

	function errorCallbackForAppStatsLogging(errorResponse) {
		//KTA error response event record
		AppStatsModule.logAppStatsSession(
			"KTAResponse",
			JSON.stringify(errorResponse),
			function (success) {
				//KTA error response status event record
				AppStatsModule.logAppStatsSession(
					"KTAResponseStatus",
					"Error",
					function (success) {
						console.log(success);
					},
					function (error) {
						alert(error);
					}
				);
				console.log(success);
			},
			function (error) {
				alert(error);
			}
		);

		ktaErrorCallback(errorResponse);
	}
})();
