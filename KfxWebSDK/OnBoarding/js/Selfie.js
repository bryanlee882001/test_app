var SelfieRequest = {
	ORIGINAL: 0,
	LIVELINESSONE: 1,
	LIVELINESSTWO: 2,
};

var SelfieModule = (function () {
	var snap1 = null,
		snap2 = null,
		selfieResults = null,
		currentRequest = null,
		selfieImage = null,
		livelinessSelfie1Results = null,
		livelinessSelfie2Results = null,
		self = null;
	var isPopupDisplayed = false;

	var serverSettingsOptions = {
		processIdentityNameForConcerto: "KofaxMobileIdFacialRecognition",
		ktaDeleteDocument: "YES",
	};

	var handleExtractionError = function (errorMessage) {
		if (errorMessage.code == KfxWebSDK.ERROR_CODE_VALIDATION) {
			// Input Validation error

			alert("Error in server response: " + errorMessage.message);
		} else {
			showExtractionError(errorMessage);
		}
	};

	var showExtractionError = function (errorMessage) {
		$("#ID_MORETEXT").css({
			height: "0px",
		});

		$("#ID_MORE").show();
		$("#extractionfailed").hide();
		$("#ID_MORETEXT").text("");
		AppModule.extractionErrorMessage = errorMessage.message;

		$("#ID_EXTRACTIONERRORPOPUP").popup("open");
	};

	var showExtractionResultError = function (errDesc) {
		$("#ID_MORETEXT").css({
			height: "0px",
		});

		$("#ID_MORE").hide();
		$("#extractionfailed").show();
		$("#ID_MORETEXT").text("");
		$("#extractionfailed").text("" + errDesc);
		AppModule.extractionErrorMessage = errDesc;

		$("#ID_EXTRACTIONERRORPOPUP").popup("open");
	};

	function performSelfieExtraction(selfieCapturedImage) {
		if (self === null) {
			self = this;
		}
		var base64Array = [];
		var base64;
		if (self.currentRequest === SelfieRequest.ORIGINAL) {
			self.selfieImage = selfieCapturedImage;
			base64 = Utils.convertImageDataToBase64(self.selfieImage);
		} else if (self.currentRequest === SelfieRequest.LIVELINESSONE) {
			base64 = self.snap1;
		} else if (self.currentRequest === SelfieRequest.LIVELINESSTWO) {
			base64 = self.snap2;
		}
		base64Array.push(base64);

		var ktaOptions = Utils.defaultStructureForSelfieOptions();

		ktaOptions.images = base64Array;
		ktaOptions.url =
			MobileIDModule.serverSettingsOptions.serverURLKTAForConcerto;
		ktaOptions.serverParameters.sessionId =
			MobileIDModule.serverSettingsOptions.ktaSessionIdForConcerto;
		ktaOptions.serverParameters.TransactionId =
			MobileIDModule.TransactionId;
		ktaOptions.serverParameters.processIdentityName =
			serverSettingsOptions.processIdentityNameForConcerto;
		ktaOptions.serverParameters.ktaDeleteDocument =
			serverSettingsOptions.ktaDeleteDocument;
		if (self.currentRequest !== SelfieRequest.ORIGINAL) {
			ktaOptions.serverParameters.LivenessSelfie = true;
		}
		performFacialRecognitionWithKTAServer(ktaOptions);
	}

	function performFacialRecognitionWithKTAServer(ktaOptions) {
		ExtractionModule.extractionWithKtaServer(
			ktaOptions,
			function (result, timingInfoValues) {
				if (
					self.currentRequest === SelfieRequest.ORIGINAL &&
					(!SelfieCaptureModule.selfieCameraOptions.videoStream ||
						!SelfieCaptureModule.hiddenCapture)
				) {
					self.selfieResults = parseSelfieResults(result);
					displayResults();
				} else if (
					self.currentRequest === SelfieRequest.ORIGINAL &&
					SelfieCaptureModule.selfieCameraOptions.videoStream &&
					SelfieCaptureModule.hiddenCapture
				) {
					self.selfieResults = parseSelfieResults(result);
					self.currentRequest = SelfieRequest.LIVELINESSONE;
					performSelfieExtraction();
				} else if (
					self.currentRequest === SelfieRequest.LIVELINESSONE
				) {
					self.livelinessSelfie1Results = parseSelfieResults(result);
					self.livelinessSelfie1Results =
						self.livelinessSelfie1Results.selfieResponse;
					self.currentRequest = SelfieRequest.LIVELINESSTWO;
					performSelfieExtraction();
				} else if (
					self.currentRequest === SelfieRequest.LIVELINESSTWO
				) {
					self.livelinessSelfie2Results = parseSelfieResults(result);
					self.livelinessSelfie2Results =
						self.livelinessSelfie2Results.selfieResponse;
					displayResults();
				}
			},
			function (errorMessage) {
				if (self.currentRequest === SelfieRequest.ORIGINAL) {
					var currentpage = $(".ui-page-active").attr("id");

					if (currentpage == "previewscreen" && self.selfieImage) {
						Utils.hideLoadingIndicator();
						handleExtractionError(errorMessage);
					}
				} else if (
					self.currentRequest === SelfieRequest.LIVELINESSONE
				) {
					self.currentRequest = SelfieRequest.LIVELINESSTWO;
				} else if (
					self.currentRequest === SelfieRequest.LIVELINESSTWO
				) {
					displayResults();
				}
			}
		);
	}

	function displayResults() {
		if (self.selfieResults.selfieResponse.frErrorInfo != "") {
			showExtractionResultError(
				self.selfieResults.selfieResponse.frErrorInfo
			);
			Utils.hideLoadingIndicator();
			return;
		}

		var currentpage = $(".ui-page-active").attr("id");

		if (currentpage == "previewscreen" && self.selfieImage) {
			console.log(self.selfieResults);

			Utils.hideLoadingIndicator();
			if (self.selfieResults == null) {
				showExtractionResultError(
					"Extraction results are getting empty."
				);
				return;
			}
			self.selfieResults = self.selfieResults.selfieResponse;

			$.mobile.navigate("./SelfieResults.html", { transition: "none" });
		}
	}

	var parseSelfieResults = function (serverResponse) {
		var returnedDocumentFieldsArray =
			getProperArrayFromSelfieResults(serverResponse);
		var selfiResponse = parseSelfieResponse(returnedDocumentFieldsArray);

		if (selfiResponse == null) {
			return null;
		}

		//Form a response dictionary with authentication and extraction results
		var dictResponse = {
			selfieResponse: selfiResponse,
		};

		//authenticationAndExtractionResults = dictResponse;
		return dictResponse;
	};

	// Get the results from server response.
	var getProperArrayFromSelfieResults = function (serverResponse) {
		var dict = serverResponse.d;
		if (dict === null || dict === "undefined") {
			return null;
		}
		return dict.ReturnedDocumentFields[0].ReturnedDocumentFields;
	};

	function parseSelfieResponse(returnedDocumentFieldsArray) {
		if (returnedDocumentFieldsArray == null) {
			return null;
		}

		var selfieResponse = {
			frMatchScore: null,
			frMatchResult: null,
			frtransactionId: null,
			selfieTests: null,
			documentImageAnalysis: null,
			documentRiskVectorAnalysis: null,
			lowFRThreshold: "",
			mediumFRThreshold: "",
			highFRThreshold: "",
			frErrorInfo: "",
			threshold: "",
		};

		var selResults;
		var frErrorInfo;
		var productVersion;

		for (var i = 0; i < returnedDocumentFieldsArray.length; i++) {
			if (returnedDocumentFieldsArray[i].Name == "FRReserved") {
				selResults = returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "FRMatchResult") {
				selfieResponse.frMatchResult =
					returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "FRTransactionID") {
				selfieResponse.frtransactionId =
					returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "FRMatchScore") {
				selfieResponse.frMatchScore =
					returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "FRErrorInfo") {
				frErrorInfo = returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "ProductVersion") {
				productVersion = returnedDocumentFieldsArray[i].Value;
			}
		}

		if (!(frErrorInfo == null || frErrorInfo.length <= 0)) {
			var errroResponse = JSON.parse(frErrorInfo);
			selfieResponse.frErrorInfo = errroResponse.ErrorMessage;
		}

		if (
			selResults != null &&
			selResults !== "undefined" &&
			Utils.isJSONValid(selResults) != false
		) {
			selResults = JSON.parse(selResults);
			var midVersion = Number(
				productVersion.split(".")[0] +
					"." +
					productVersion.split(".")[1]
			);

			var selfieTests =
				midVersion < 2.6
					? selResults.SelfieTests
					: {
							Result: selResults.SelfieImageIntegrityAnalysis
								.Result,
							PhotoBorderDetector:
								selResults.SelfieImageIntegrityAnalysis
									.PhotoBorderDetector.Selfie,
							NaturalCapture:
								selResults.SelfieImageIntegrityAnalysis
									.NaturalCapture.Selfie,
							CredentialDetector:
								selResults.SelfieImageIntegrityAnalysis
									.CredentialDetector.Selfie,
					  };
			var documentImageAnalysis =
				midVersion < 2.6
					? selResults.DocumentImageAnalysis
					: {
							Result: selResults.SelfieImageAnalysis.Result,
							ColorSpace:
								selResults.SelfieImageAnalysis.Selfie
									.ColorSpace,
							FaceCount:
								selResults.SelfieImageAnalysis.Selfie.NumFaces,
					  };
			var selfieScores = null;
			if (midVersion >= 2.6 && selResults.SelfieScores.length > 0) {
				selfieScores = selResults.SelfieScores[0];
			}
			if (
				midVersion >= 2.6 &&
				selResults.LivenessSelfieScores.length > 0
			) {
				selfieScores = selResults.LivenessSelfieScores[0];
				selfieResponse.frMatchResult =
					selResults.LivenessSelfieScores[0].Result;
				selfieResponse.frMatchScore =
					selResults.LivenessSelfieScores[0].VerificationScore;
			}
			var documentRiskVectorAnalysis =
				midVersion < 2.6
					? selResults.DocumentRiskVectorAnalysis
					: selResults.SelfieRiskVectorData;
			var lowFRThreshold =
				midVersion < 2.6
					? selResults.LowFRThreshold
					: selfieScores.LowThreshold;
			var highFRThreshold =
				midVersion < 2.6
					? selResults.HighFRThreshold
					: selfieScores.HighThreshold;
			var mediumFRThreshold =
				midVersion < 2.6
					? selResults.MediumFRThreshold
					: selfieScores.MediumThreshold;
			var livenessThreshold =
				midVersion < 2.6
					? selResults.LivenessThreshold
					: selfieScores.LivenessThreshold;

			if (selfieTests == null || selfieTests.length <= 0) {
				selfieTests = "";
			}

			if (
				documentImageAnalysis == null ||
				documentImageAnalysis.length <= 0
			) {
				documentImageAnalysis = "";
			}

			if (
				documentRiskVectorAnalysis == null ||
				documentRiskVectorAnalysis.length <= 0
			) {
				documentRiskVectorAnalysis = "";
			}

			if (lowFRThreshold == null || lowFRThreshold.length <= 0) {
				lowFRThreshold = "";
			}

			if (highFRThreshold == null || highFRThreshold.length <= 0) {
				highFRThreshold = "";
			}

			if (mediumFRThreshold == null || mediumFRThreshold.length <= 0) {
				mediumFRThreshold = "";
			}

			if (livenessThreshold == null || livenessThreshold.length <= 0) {
				livenessThreshold = "";
			}

			selfieResponse.documentImageAnalysis = documentImageAnalysis;
			selfieResponse.documentRiskVectorAnalysis =
				documentRiskVectorAnalysis;
			selfieResponse.selfieTests = selfieTests;
			selfieResponse.threshold = livenessThreshold;
			selfieResponse.lowFRThreshold = lowFRThreshold;
			selfieResponse.highFRThreshold = highFRThreshold;
			selfieResponse.mediumFRThreshold = mediumFRThreshold;
		}

		return selfieResponse;
	}

	var intializeLivelinessSelfieResults = function () {
		var results;
		if (self.currentRequest === SelfieRequest.LIVELINESSONE) {
			results = self.livelinessSelfie1Results;
		} else if (self.currentRequest === SelfieRequest.LIVELINESSTWO) {
			results = self.livelinessSelfie2Results;
		}

		$("#livelinessresult_back").click(function (event) {
			window.history.go(-1);
		});

		var li = [];

		li.push("<li>" + "Match Score " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				results.frMatchScore +
				'" readonly/></li>'
		);
		li.push("<li>" + "Transaction Id " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				results.frtransactionId +
				'" readonly/></li>'
		);
		li.push("<li>" + "Selfie Result " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				results.frMatchResult +
				'" readonly/></li>'
		);

		if (results.threshold != undefined && results.threshold.length != 0) {
			li.push("<li>" + "Threshold " + "</li>");
			li.push(
				"<li><input type=" +
					"text" +
					' style="width:100%;background-color:white;border:none;" value="' +
					results.threshold +
					'" readonly/></li>'
			);
		}

		li.push("<li>" + "" + "</li>");
		li.push(
			"<li><input type=" +
				"button" +
				' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
				"Document Tests" +
				'" onclick="MobileIDModule.navigateToDocumentTests()"/></li>'
		);
		li.push("<li>" + "" + "</li>");
		li.push(
			"<li ><input type=" +
				"button" +
				' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
				"Document Image Analysis" +
				'" onclick="MobileIDModule.navigateToDocumentImageAnalysis()"/></li>'
		);

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
	};

	var navigateToLivelinessResultsScreen = function (isLivelinessOne) {
		if (isLivelinessOne) {
			self.currentRequest = SelfieRequest.LIVELINESSONE;
		} else {
			self.currentRequest = SelfieRequest.LIVELINESSTWO;
		}
		$.mobile.navigate("./HiddenSelfieResults.html", { transition: "none" });
	};

	var initializeSelfieResults = function () {
		self.currentRequest = SelfieRequest.ORIGINAL;
		Utils.showLoadingIndicator();
		AppModule.selfieBackPressed = false;
		$("#result_back").click(function (event) {
			if (!isPopupDisplayed) {
				AppModule.selfieBackPressed = true;
				$("#selfieresult_popupalert").popup("open");
			} else {
				isPopupDisplayed = false;
			}
		});

		$("#selfieyes").click(function () {
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				HiddenSelfieModule.stopCamera();
			}
			$("#selfieresult_popupalert").hide();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		var imgFrontElement = document.getElementById(
			"result_headshotthumbnail"
		);
		var imgBackElement = document.getElementById("result_selfiethumbnail");
		//Added delay because of page transition.
		setTimeout(function () {
			imgFrontElement.src =
				"data:image/jpeg;base64," + MobileIDModule.VerificationPhoto64;
			var base64 = Utils.convertImageDataToBase64(self.selfieImage);
			imgBackElement.src = "data:image/jpeg;base64," + base64;
			Utils.hideLoadingIndicator();
		}, 500);

		// Get the modal
		var modal = document.getElementById("result_modal");

		// Get the image and insert it inside the modal
		var modalImg = document.getElementById("modalimg");
		imgFrontElement.onclick = function () {
			isPopupDisplayed = true;
			document.getElementById("footer").style.display = "none";
			modal.style.display = "block";
			modalImg.src = this.src;
		};

		imgBackElement.onclick = function () {
			isPopupDisplayed = true;
			document.getElementById("footer").style.display = "none";
			modal.style.display = "block";
			modalImg.src = this.src;
		};

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			isPopupDisplayed = false;
			document.getElementById("footer").style.display = "block";
			modal.style.display = "none";
		};
		//Adding the click event for Front button in FrontScreen
		$("#extractionresultsdisplayscreen_submit").click(function (event) {
			event.preventDefault();
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				HiddenSelfieModule.stopCamera();
			}
			window.history.go(-$.mobile.navigate.history.activeIndex);
		});

		var li = [];

		if (self.selfieResults.frMatchResult == PASSED) {
			$("#authenticationText").text(SELFIE_AUTHENTIC);
		} else if (self.selfieResults.frMatchResult == ATTENTION) {
			$("#authenticationText").text(SELFIE_NOT_AUTHENTIC_NEEDS_ATTENTION);
		} else {
			$("#authenticationText").text(SELFIE_NOT_AUTHENTIC);
		}

		li.push("<li>" + "Match Score " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				self.selfieResults.frMatchScore +
				'" readonly/></li>'
		);
		li.push("<li>" + "Transaction Id " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				self.selfieResults.frtransactionId +
				'" readonly/></li>'
		);
		li.push("<li>" + "Selfie Result " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				self.selfieResults.frMatchResult +
				'" readonly/></li>'
		);
		li.push("<li>" + "Low Threshold " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				self.selfieResults.lowFRThreshold +
				'" readonly/></li>'
		);
		li.push("<li>" + "Medium Threshold " + "</li>");
		li.push(
			"<li><input type=" +
				"text" +
				' style="width:100%;background-color:white;border:none;" value="' +
				self.selfieResults.mediumFRThreshold +
				'" readonly/></li>'
		);
		if (
			self.selfieResults.highFRThreshold != undefined &&
			self.selfieResults.highFRThreshold.length != 0
		) {
			li.push("<li>" + "High Threshold " + "</li>");
			li.push(
				"<li><input type=" +
					"text" +
					' style="width:100%;background-color:white;border:none;" value="' +
					self.selfieResults.highFRThreshold +
					'" readonly/></li>'
			);
		}

		li.push("<li>" + "" + "</li>");
		li.push(
			"<li><input type=" +
				"button" +
				' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
				"Document Tests" +
				'" onclick="MobileIDModule.navigateToDocumentTests()"/></li>'
		);
		li.push("<li>" + "" + "</li>");
		li.push(
			"<li ><input type=" +
				"button" +
				' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
				"Document Image Analysis" +
				'" onclick="MobileIDModule.navigateToDocumentImageAnalysis()"/></li>'
		);
		if (
			SelfieCaptureModule.selfieCameraOptions.videoStream &&
			SelfieCaptureModule.hiddenCapture
		) {
			li.push("<li>" + "" + "</li>");
			li.push(
				"<li><input type=" +
					"button" +
					' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
					"Liveness Selfie One Results" +
					'" onclick="SelfieModule.navigateToLivelinessResultsScreen(true)"/></li>'
			);
			li.push("<li>" + "" + "</li>");
			li.push(
				"<li ><input type=" +
					"button" +
					' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
					"Liveness Selfie Two Results" +
					'" onclick="SelfieModule.navigateToLivelinessResultsScreen(false)"/></li>'
			);
		}

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
	};

	return {
		performSelfieExtraction: performSelfieExtraction,
		initializeSelfieResults: initializeSelfieResults,
		selfieResults: selfieResults,
		snap1: snap1,
		snap2: snap2,
		currentRequest: currentRequest,
		navigateToLivelinessResultsScreen: navigateToLivelinessResultsScreen,
		intializeLivelinessSelfieResults: intializeLivelinessSelfieResults,
		livelinessSelfie1Results: livelinessSelfie1Results,
		livelinessSelfie2Results: livelinessSelfie2Results,
	};
})();
