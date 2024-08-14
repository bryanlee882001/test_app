var MobileIDModule = (function () {
	var frontImage = null; // The current captured image.
	var backImage = null;
	var authenticationResults = null;
	var isOnBoardingFlow = true;
	var extractedDocId = null;
	var regionSelected;
	var extractedResults = {};

	var FIELD_FACEIMAGE64 = "FaceImage64";
	var FIELD_SIGNATUREIMAGE64 = "SignatureImage64";
	var FIELD_DATEOFBIRTH = "DateOfBirth";
	var FIELD_ISSUEDATE = "IssueDate";
	var FIELD_EXPIRATIONDATE = "ExpirationDate";
	var FIELD_VERIFICATION_RESERVED = "VerificationReserved";
	var FIELD_HEADSHOT = "HeadShot";
	var FIELD_ERROR_DETAILS = "ErrorDetails";
	var FIELD_PRODUCT_VERSION = "ProductVersion";
	var VERIFICATION_ERROR_INFO = "VerificationErrorInfo";
	var VERIFICATION_RESULT = "VerificationResult";
	var VERIFICATION_TRANSACTION_ID = "VerificationTransactionID";
	var VERIFICATION_PHOTO = "VerificationPhoto64";
	var TransactionId = "";
	var VerificationPhoto64 = "";

	var isAuthenticationDetailsScreenPressed = false;
	var isSelfieDetailsScreenPressed = false;
	var isSelfieRequired = false;
	var DetailsScreenTitle = "Document Risk Vector Analysis";

	var serverSettingsOptions = {
		serverType: "RTTI",
		//MobileID 2.0
		serverURLRTTIForConcerto:
			"https://use_a_valid_URL_instead_of_this",
		serverURLKTAForConcerto:
			"https://use_a_valid_URL_instead_of_this",
		ktaUserNameForConcerto: "",
		ktaPasswordForConcerto: "",
		ktaSessionIdForConcerto: KTALimitedSessionID,
		processIdentityNameForConcerto: "KofaxMobileIDCaptureSync",
		ktaDeleteDocument: "YES",
		idAuthentication: "OFF",
		selfieCheck: "OFF",
		autoCropVerification: "ON",
	};

	var handleExtractionError = function (errorMessage) {
		if (errorMessage.code == KfxWebSDK.ERROR_CODE_VALIDATION) {
			// Input Validation error
			handleExtractionResultError(errorMessage.message);
		} else {
			if (AppModule.capturedSide == CAPTURESIDE.CAPTURE_FRONT) {
				$("#capture_popupalert").popup("close");
				//While handling two popup alerts will get blank screen issue.To solve this issue by added below delay.
				setTimeout(function () {
					showExtractionError(errorMessage);
				}, 500);
			} else {
				showExtractionError(errorMessage);
			}
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

	var handleExtractionResultError = function (errDesc) {
		if (AppModule.capturedSide == CAPTURESIDE.CAPTURE_FRONT) {
			$("#capture_popupalert").popup("close");
			//While handling two popup alerts will get blank screen issue.To solve this issue by added below delay.
			setTimeout(function () {
				showExtractionResultError(errDesc);
			}, 500);
		} else {
			showExtractionResultError(errDesc);
		}
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

	var initializeExtractionResultsforStandalone = function () {
		Utils.showLoadingIndicator();
		var isbackPressed = false;
		$("#result_back").click(function (event) {
			isbackPressed = true;
			$("#result_popupalert").popup("open");
		});

		$("#yes").click(function () {
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture &&
				serverSettingsOptions.serverType == "KTA"
			) {
				HiddenSelfieModule.stopCamera();
			}
			$("#result_popupalert").hide();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		var imgFrontElement = document.getElementById("result_frontthumbnail");
		var imgBackElement = document.getElementById("result_backthumbnail");
		//Added delay because of page transition.
		setTimeout(function () {
			var base64 = Utils.convertImageDataToBase64(frontImage);
			imgFrontElement.src = "data:image/jpeg;base64," + base64;
			if (backImage == null) {
				Utils.hideLoadingIndicator();
			} else {
				var base64 = Utils.convertImageDataToBase64(backImage);
				imgBackElement.src = "data:image/jpeg;base64," + base64;
				Utils.hideLoadingIndicator();
			}
		}, 500);

		// Get the modal
		var modal = document.getElementById("result_modal");

		// Get the image and insert it inside the modal
		var modalImg = document.getElementById("modalimg");
		imgFrontElement.onclick = function () {
			document.getElementById("footer").style.display = "none";
			modal.style.display = "block";
			modalImg.src = this.src;
		};

		if (backImage != null) {
			imgBackElement.onclick = function () {
				document.getElementById("footer").style.display = "none";
				modal.style.display = "block";
				modalImg.src = this.src;
			};
		}

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			document.getElementById("footer").style.display = "block";
			modal.style.display = "none";
		};
		//Adding the click event for Front button in FrontScreen
		$("#extractionresultsdisplayscreen_submit").click(function (event) {
			event.preventDefault();

			if (isSelfieRequired) {
				if (SelfieCaptureModule.selfieCameraOptions.videoStream) {
					if (
						SelfieCaptureModule.hiddenCapture &&
						SelfieCaptureModule.selfieCaptureOptions
							.enableAutoCapture === true
					) {
						SelfieModule.snap1 = HiddenSelfieModule.takeSelfie();
					}
					$.mobile.navigate("./SelfieInstructions.html", {
						transition: "none",
					});
				} else {
					AppModule.doSelfieCapture();
				}
			} else {
				if (
					SelfieCaptureModule.selfieCameraOptions.videoStream &&
					SelfieCaptureModule.hiddenCapture
				) {
					HiddenSelfieModule.stopCamera();
				}
				var pagesToRemove = $.mobile.navigate.history.stack.length;

				if (isbackPressed) {
					pagesToRemove = $.mobile.navigate.history.stack.length - 2;
				} else {
					pagesToRemove = $.mobile.navigate.history.stack.length - 1;
				}
				if (isAuthenticationDetailsScreenPressed) {
					pagesToRemove = pagesToRemove - 1;
					isAuthenticationDetailsScreenPressed = false;
				}

				window.history.go(-pagesToRemove);
			}
		});

		var li = [];
		if (
			serverSettingsOptions.idAuthentication == "ON" &&
			serverSettingsOptions.serverType == "KTA"
		) {
			if (authenticationResults.authenticationResult == PASSED) {
				$("#authenticationText").text(DOUUMENT_AUTHENTIC);
				$("#extractionresultsdisplayscreen_submit").text(
					"Authenticate with Selfie"
				);
				isSelfieRequired = true;
			} else if (
				authenticationResults.authenticationResult == ATTENTION
			) {
				$("#authenticationText").text(
					DOUUMENT_NOT_AUTHENTIC_NEEDS_ATTENTION
				);
				$("#extractionresultsdisplayscreen_submit").text(
					"Authenticate with Selfie"
				);
				isSelfieRequired = true;
			} else {
				$("#authenticationText").text(DOUUMENT_NOT_AUTHENTIC);
				isSelfieRequired = false;
			}

			li.push("<li>" + "Authentication Result " + "</li>");
			li.push(
				"<li><input type=" +
					"text" +
					' style="width:100%;background-color:white;border:none;" value="' +
					authenticationResults.authenticationResult +
					'" readonly/></li>'
			);
			li.push("<li>" + "Transaction Id " + "</li>");
			li.push(
				"<li><input type=" +
					"text" +
					' style="width:100%;background-color:white;border:none;" value="' +
					authenticationResults.transactionId +
					'" readonly/></li>'
			);

			MobileIDModule.TransactionId = authenticationResults.transactionId;
			MobileIDModule.VerificationPhoto64 =
				authenticationResults.VerificationPhoto64;
		} else {
			isSelfieRequired = false;
		}

		for (var i = 0; i < extractedResults.length; i++) {
			var inputType = "text";
			var value = extractedResults[i].text;

			if (
				extractedResults[i].name == FIELD_ISSUEDATE ||
				extractedResults[i].name == FIELD_DATEOFBIRTH ||
				extractedResults[i].name == FIELD_EXPIRATIONDATE
			) {
				inputType = "date";
				value = DateParser.parseToyyyymmdd(extractedResults[i].text);
			}

			// Expect "FaceImage64" and "SignatureImage64" field , all the other values from the extraction results need to be displayed .
			if (
				extractedResults[i].name !== FIELD_FACEIMAGE64 &&
				extractedResults[i].name !== FIELD_SIGNATUREIMAGE64 &&
				extractedResults[i].name !== FIELD_VERIFICATION_RESERVED &&
				extractedResults[i].name !== FIELD_HEADSHOT &&
				extractedResults[i].name !== FIELD_ERROR_DETAILS &&
				extractedResults[i].name !== VERIFICATION_ERROR_INFO &&
				extractedResults[i].name !== VERIFICATION_RESULT &&
				extractedResults[i].name !== VERIFICATION_TRANSACTION_ID &&
				extractedResults[i].name !== VERIFICATION_PHOTO
			) {
				updateValues(true, value, i);
				var field_name = extractedResults[i].name;
				field_name = field_name.replace(/([A-Z])/g, " $1").trim();
				li.push("<li>" + field_name + "</li>");
				if (extractedResults[i].name == FIELD_PRODUCT_VERSION) {
					li.push(
						"<li><input type=" +
							inputType +
							' style="width:100%;background-color:#d0d5d6;color:white;border:none;" value="' +
							value +
							'" readonly/></li>'
					);
				} else {
					li.push(
						"<li><input type=" +
							inputType +
							' style="width:100%;background-color:white;border:none;" value="' +
							value +
							'" onchange="MobileIDModule.updateValues(false,this.value,' +
							i +
							')"/></li>'
					);
				}
			}
		}

		if (
			serverSettingsOptions.idAuthentication == "ON" &&
			serverSettingsOptions.serverType == "KTA"
		) {
			li.push("<li>" + "" + "</li>");
			li.push(
				"<li><input type=" +
					"button" +
					' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
					"Document Alerts" +
					'" onclick="MobileIDModule.navigateToDocumentAlerts()"/></li>'
			);
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
			li.push("<li>" + "" + "</li>");
			li.push(
				"<li><input type=" +
					"button" +
					' style="width:100%;height:40px;background-color:#00b3b3;color:white;border:none;align:left;" value="' +
					"Document Classification" +
					'" onclick="MobileIDModule.navigateToDocumentClassification()"/></li>'
			);
		}

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
	};

	var navigateToDocumentAlerts = function (event) {
		DetailsScreenTitle = "Document Alerts";
		if (
			authenticationResults.documentAlerts != null &&
			Object.keys(authenticationResults.documentAlerts).length > 0
		) {
			$.mobile.navigate("./AuthenticationDetails.html", {
				transition: "none",
			});
		} else {
			bootbox.alert("Document Alerts not available.");
		}
	};

	var navigateToDocumentTests = function (event) {
		DetailsScreenTitle = "Document Tests";
		if (
			authenticationResults.documentTests != null &&
			Object.keys(authenticationResults.documentTests).length > 0
		) {
			$.mobile.navigate("./DocumentTests.html", { transition: "none" });
		} else {
			bootbox.alert("Document Tests not available.");
		}
	};

	var navigateToDocumentImageAnalysis = function (event) {
		DetailsScreenTitle = "Document Image Analysis";
		if (
			authenticationResults.documentImageAnalysis != null &&
			Object.keys(authenticationResults.documentImageAnalysis).length > 0
		) {
			$.mobile.navigate("./DocumentImageAnalysis.html", {
				transition: "none",
			});
		} else {
			bootbox.alert("Document Image Analysis not available.");
		}
	};

	var navigateToDocumentRiskVectorAnalysis = function (event) {
		DetailsScreenTitle = "Document Risk Vector Analysis";
		if (
			authenticationResults.documentRiskVectorAnalysis != null &&
			Object.keys(authenticationResults.documentRiskVectorAnalysis)
				.length > 0
		) {
			$.mobile.navigate("./DocumentRiskVectorAnalysis.html", {
				transition: "none",
			});
		} else {
			bootbox.alert("Document Risk Vector Analysis not available.");
		}
	};

	var navigateToDocumentClassification = function (event) {
		DetailsScreenTitle = "Document Classification";
		if (
			authenticationResults.documentClassification != null &&
			Object.keys(authenticationResults.documentClassification).length > 0
		) {
			$.mobile.navigate("./DocumentClassification.html", {
				transition: "none",
			});
		} else {
			bootbox.alert("Document Classification not available.");
		}
	};

	var extractData = function (
		frontimage,
		backimage,
		isOnBoardingflow,
		region
	) {
		frontImage = null;
		backImage = null;
		var dictDPI = {
			dpi: parseInt(ProcessorModule.mobileIdProcessorOptions.dpi),
		};
		frontImage = frontimage;
		if (backimage != null) {
			backImage = backimage;
		}
		regionSelected = region;
		isOnBoardingFlow = isOnBoardingflow;

		if (isOnBoardingFlow || serverSettingsOptions.serverType == "RTTI") {
			performRTTIExtraction();
		} else {
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				HiddenSelfieModule.startCamera();
			}
			performKTAExtraction();
		}
	};

	var cancelExtraction = function () {
		ExtractionModule.cancelExtraction();
	};

	function hideSelfieCaptureOption(hide) {
		if (hide) {
			$("#IDAutoCropVerificationDiv").hide();
			$("#IDEnableFlashCaptureDiv").hide();
		} else {
			$("#IDAutoCropVerificationDiv").show();
			KfxWebSDK.Utilities.supportsFlash(
				function () {
					if (cameraOptions.isUseAdvcanceCapture) {
						$("#IDEnableFlashCaptureDiv").show();
					}
				},
				function () {}
			);
		}
		var iOSVersion = Utils.iOSVersion();
		if (
			(iOSVersion !== undefined &&
				iOSVersion.length > 0 &&
				iOSVersion[0] < 11) ||
			!SelfieCaptureModule.isSelfieCaptureSupported
		) {
			hideSelfieCapture(true);
		} else {
			hideSelfieCapture(hide);
		}
	}

	function hideSelfieCapture(hide) {
		if (hide) {
			$("#IDSelfieCaptureDiv").hide();
			hideHiddenCapture(true);
		} else {
			$("#IDSelfieCaptureDiv").show();
			if (SelfieCaptureModule.selfieCameraOptions.videoStream) {
				hideHiddenCapture(false);
			} else {
				hideHiddenCapture(true);
			}
		}
	}

	function hideHiddenCapture(hide) {
		if (hide) {
			$("#IDHiddenCaptureDiv").hide();
			$("#IDSelfieMinFaceSizeDiv").hide();
			$("#IDEnableAutoCaptureDiv").hide();
			$("#IDEnableBlinkDetectionDiv").hide();
		} else {
			$("#IDHiddenCaptureDiv").show();
			$("#IDSelfieMinFaceSizeDiv").show();
			$("#IDEnableAutoCaptureDiv").show();
			if (SelfieCaptureModule.selfieCaptureOptions.enableAutoCapture) {
				$("#IDEnableBlinkDetectionDiv").show();
			} else {
				$("#IDEnableBlinkDetectionDiv").hide();
			}
		}
	}

	// Sets the default or already set values for Server Settings
	var initializeServerSettingsScreenEvents = function () {
		$("#ServerType").change(function () {
			serverSettingsOptions.serverType = $(
				"input[name=radio-choice]:checked",
				"#ServerType"
			).val();
			if (
				$("input[name=radio-choice]:checked", "#ServerType").val() ==
				"RTTI"
			) {
				hideSelfieCaptureOption(true);
				hideOrShowAuthenticationOptions(true);
				$("#serverurl").val(
					serverSettingsOptions.serverURLRTTIForConcerto
				);
				hideOrShowKTADetails(true);
			} else {
				setKTAServerAndDeviceTypeSettings();
				hideOrShowAuthenticationOptions(false);
				hideOrShowKTADetails(false);
				if (serverSettingsOptions.idAuthentication == "OFF") {
					hideSelfieCaptureOption(true);
				} else {
					hideSelfieCaptureOption(false);
				}
			}
		});

		$("#IDSelfieCapture").change(function () {
			SelfieCaptureModule.selfieCameraOptions.videoStream =
				$("#IDSelfieCapture").val() == "ON" ? true : false;
			if ($("#IDSelfieCapture").val() == "ON") {
				hideHiddenCapture(false);
			} else {
				hideHiddenCapture(true);
			}
		});

		$("#IDEnableAutoCapture").change(function () {
			SelfieCaptureModule.selfieCaptureOptions.enableAutoCapture =
				$("#IDEnableAutoCapture").val() == "ON" ? true : false;
			if ($("#IDEnableAutoCapture").val() == "ON") {
				$("#IDEnableBlinkDetectionDiv").show();
			} else {
				$("#IDEnableBlinkDetectionDiv").hide();
			}
		});

		$("#IDAuthentication").change(function () {
			serverSettingsOptions.idAuthentication = $(
				"#IDAuthentication"
			).val();
			if ($("#IDAuthentication").val() == "ON") {
				hideSelfieCaptureOption(false);
			} else {
				hideSelfieCaptureOption(true);
			}
		});

		$("#serverurl").change(function () {
			saveServerSettings();
		});
		$("#ProcessIdentity").change(function () {
			saveServerSettings();
		});
		$("#ktasessionId").change(function () {
			saveServerSettings();
		});
		$("input[type='radio']")
			.filter(".servertype")
			.each(function () {
				if (serverSettingsOptions.serverType == $(this).val()) {
					$(this).prop("checked", true).checkboxradio("refresh");
				} else {
					$(this).prop("checked", false).checkboxradio("refresh");
				}
			});

		if (
			serverSettingsOptions.idAuthentication == "OFF" ||
			serverSettingsOptions.serverType == "RTTI"
		) {
			hideSelfieCaptureOption(true);
		} else {
			hideSelfieCaptureOption(false);
		}

		$("#minfacesize").val(
			SelfieCaptureModule.selfieCaptureOptions.criteria.minFaceSize
		);
		$("#IDAuthentication")
			.val(serverSettingsOptions.idAuthentication)
			.selectmenu("refresh");
		$("#IDSelfieCapture")
			.val(
				SelfieCaptureModule.selfieCameraOptions.videoStream
					? "ON"
					: "OFF"
			)
			.selectmenu("refresh");
		$("#IDAutoCropVerification")
			.val(serverSettingsOptions.autoCropVerification)
			.selectmenu("refresh");
		$("#IDEnableFlashCapture")
			.val(cameraOptions.enableFlashCapture)
			.selectmenu("refresh");
		$("#IDHiddenCapture")
			.val(SelfieCaptureModule.hiddenCapture ? "ON" : "OFF")
			.selectmenu("refresh");
		$("#IDEnableAutoCapture")
			.val(
				SelfieCaptureModule.selfieCaptureOptions.enableAutoCapture
					? "ON"
					: "OFF"
			)
			.selectmenu("refresh");
		$("#IDEnableBlinkDetection")
			.val(
				SelfieCaptureModule.selfieCaptureOptions.enableBlinkDetection
					? "ON"
					: "OFF"
			)
			.selectmenu("refresh");

		$("input[type='radio']")
			.filter(".selfiecheck")
			.each(function () {
				if (serverSettingsOptions.selfieCheck == $(this).val()) {
					$(this).prop("checked", true).checkboxradio("refresh");
				} else {
					$(this).prop("checked", false).checkboxradio("refresh");
				}
			});

		$("#ktausername").val(serverSettingsOptions.ktaUserNameForConcerto);
		$("#ktapassword").val(serverSettingsOptions.ktaPasswordForConcerto);
		$("#ktasessionId").val(serverSettingsOptions.ktaSessionIdForConcerto);
		$("#ProcessIdentity").val(
			serverSettingsOptions.processIdentityNameForConcerto
		);

		if (serverSettingsOptions.serverType == "RTTI") {
			$("#serverurl").val(serverSettingsOptions.serverURLRTTIForConcerto);
			hideOrShowKTADetails(true);
			hideOrShowAuthenticationOptions(true);
		} else {
			$("#serverurl").val(serverSettingsOptions.serverURLKTAForConcerto);
			hideOrShowAuthenticationOptions(false);
			hideOrShowKTADetails(false);
		}
		$("#ccExtractionMethod").hide();
	};

	//Here we display form elements based on the selected server
	var hideOrShowKTADetails = function (hide) {
		if (hide) {
			$("#KTADETAILS").hide();
		} else {
			$("#KTADETAILS").show();
		}
	};

	var hideOrShowAuthenticationOptions = function (hide) {
		if (hide) {
			$("#IDAuthenticationDiv").hide();
			$("#SelfieCheckDiv").hide();
		} else {
			$("#IDAuthenticationDiv").show();
			$("#SelfieCheckDiv").show();
		}
	};

	//Save the server settings
	var saveServerSettings = function () {
		serverSettingsOptions.serverType = $(
			"input[name=radio-choice]:checked",
			"#ServerType"
		).val();

		if (serverSettingsOptions.serverType == "RTTI") {
			serverSettingsOptions.serverURLRTTIForConcerto = $(
				"#serverurl"
			).val();
		} else {
			serverSettingsOptions.serverURLKTAForConcerto = $(
				"#serverurl"
			).val();
			serverSettingsOptions.ktaUserNameForConcerto = $(
				"#ktausername"
			).val();
			serverSettingsOptions.ktaPasswordForConcerto = $(
				"#ktapassword"
			).val();
			serverSettingsOptions.ktaSessionIdForConcerto = $(
				"#ktasessionId"
			).val();
			serverSettingsOptions.idAuthentication = $(
				"#IDAuthentication"
			).val();
			//serverSettingsOptions.selfieCheck = $('input[name=radio-choice-selfiecheck]:checked', '#SelfieCheck').val();
			serverSettingsOptions.processIdentityNameForConcerto = $(
				"#ProcessIdentity"
			).val();
			SelfieCaptureModule.selfieCameraOptions.videoStream =
				$("#IDSelfieCapture").val() == "ON" ? true : false;
			serverSettingsOptions.autoCropVerification = $(
				"#IDAutoCropVerification"
			).val();
			cameraOptions.enableFlashCapture = $("#IDEnableFlashCapture").val();
			SelfieCaptureModule.hiddenCapture =
				$("#IDHiddenCapture").val() == "ON" ? true : false;
			SelfieCaptureModule.selfieCaptureOptions.enableAutoCapture =
				$("#IDEnableAutoCapture").val() == "ON" ? true : false;
			SelfieCaptureModule.selfieCaptureOptions.enableBlinkDetection =
				$("#IDEnableBlinkDetection").val() == "ON" ? true : false;
			SelfieCaptureModule.selfieCameraOptions.enableBlinkDetection =
				$("#IDEnableBlinkDetection").val() == "ON" ? true : false;
			var minFaceSize = parseFloat($("#minfacesize").val());
			if (
				minFaceSize !== minFaceSize ||
				minFaceSize <= 0 ||
				minFaceSize >= 1
			) {
				SelfieCaptureModule.selfieCaptureOptions.criteria.minFaceSize = 0.5;
			} else {
				SelfieCaptureModule.selfieCaptureOptions.criteria.minFaceSize = minFaceSize;
			}
		}
	};

	var setKTAServerAndDeviceTypeSettings = function () {
		$("#serverurl").val(serverSettingsOptions.serverURLKTAForConcerto);
		$("#ktausername").val(serverSettingsOptions.ktaUserNameForConcerto);
		$("#ktapassword").val(serverSettingsOptions.ktaPasswordForConcerto);
		$("#ktasessionId").val(serverSettingsOptions.ktaSessionIdForConcerto);
		$("#ProcessIdentity").val(
			serverSettingsOptions.processIdentityNameForConcerto
		);
	};

	var updateValues = function (isFirstTimeRecord, value, index) {
		var options = new FieldChangeOption();
		if (
			extractedResults[index].valid &&
			extractedResults[index].valid === true
		) {
			options.IsValid = 1;
		} else {
			options.IsValid = 0;
		}

		options.ErrorDescription = extractedResults[index].errorDescription;
		options.FormattingFailed = extractedResults[index].formattingFailed;
		options.FieldName = extractedResults[index].name;
		options.OriginalValue = isFirstTimeRecord
			? ""
			: extractedResults[index].text;
		options.Confidence = extractedResults[index].confidence;
		options.ChangedValue = value;
		options.DocumentID = extractedDocId;
		AppStatsModule.recordFieldChangeEventsinAppStats(options);

		extractedResults[index].text = value;
	};

	var performRTTIExtraction = function () {
		var uint8ImageArray = [];
		var dataURL;
		var url = "";

		dataURL = Utils.convertImageDataToDataURL(frontImage);
		var binary = Utils.dataUrlToUint8Array(dataURL);
		uint8ImageArray.push(binary);

		if (backImage != null) {
			dataURL = Utils.convertImageDataToDataURL(backImage);
			var binary = Utils.dataUrlToUint8Array(dataURL);
			uint8ImageArray.push(binary);
		}

		var rttiOptions = Utils.defaultStructureForRTTIOptions();
		url = serverSettingsOptions.serverURLRTTIForConcerto;

		rttiOptions.url = url;
		rttiOptions.images = uint8ImageArray;

		rttiOptions.serverParameters = {
			xImageResize: "ID-1",
			xregion: regionSelected,
			xIDType: "ID",
			xCropImage: true,
		};

		function parserSuccessCallBack(parsedResults) {
			handleRTTIParsedResponse(parsedResults, rttiOptions);
		}

		function parserErrorCallBack(error) {
			Utils.hideLoadingIndicator();
			handleExtractionError(error);
		}

		ExtractionModule.extractionWithRttiServer(
			rttiOptions,
			function (result, timingInfoValues) {
				ParserModule.parseRTTIExtractionResponse(
					result,
					parserSuccessCallBack,
					parserErrorCallBack
				);
			},
			function (errorMessage) {
				var currentpage = $(".ui-page-active").attr("id");

				if (currentpage == "previewscreen" && frontImage) {
					Utils.hideLoadingIndicator();
					handleExtractionError(errorMessage);
				}
			}
		);
	};

	function handleRTTIParsedResponse(parsedResults, rttiOptions) {
		var currentpage = $(".ui-page-active").attr("id");
		if (currentpage == "previewscreen" && frontImage) {
			console.log(parsedResults);
			Utils.hideLoadingIndicator();
			if (parsedResults[0].result != "Error") {
				if (!parsedResults[0].fields) {
					handleExtractionResultError(FIELDS_EMPTY_ERROR);
					return;
				}

				extractedResults = parsedResults[0].fields;

				extractedDocId = parsedResults[0].documentId;
				if (rttiOptions.timingInfo) {
					alert(timingInfoValues.message);
				}
				if (!isOnBoardingFlow) {
					$.mobile.navigate("./FrontAndBackResults.html", {
						transition: "none",
					});
				} else {
					NewAccountModule.setExtractionInformationFromExtractionResults(
						extractedResults
					);
					$.mobile.navigate("./EntryForm1.html", {
						transition: "none",
					});
				}
			} else {
				var ErrorDescription = parsedResults[0].errorDescription;
				Utils.hideLoadingIndicator();
				handleExtractionResultError(ErrorDescription);
			}
		}
	}

	var performKTAExtraction = function () {
		//  This section is for KTA

		var base64Array = [];
		var base64;
		base64 = Utils.convertImageDataToBase64(frontImage);
		base64Array.push(base64);

		if (backImage != null) {
			base64 = Utils.convertImageDataToBase64(backImage);
			base64Array.push(base64);
		}

		var ktaOptions = Utils.defaultStructureForKTAMobileIDOptions();
		ktaOptions.url = serverSettingsOptions.serverURLKTAForConcerto;
		ktaOptions.serverParameters.username =
			serverSettingsOptions.ktaUserNameForConcerto;
		ktaOptions.serverParameters.password =
			serverSettingsOptions.ktaPasswordForConcerto;
		ktaOptions.serverParameters.sessionId =
			serverSettingsOptions.ktaSessionIdForConcerto;
		ktaOptions.serverParameters.processIdentityName =
			serverSettingsOptions.processIdentityNameForConcerto;
		ktaOptions.serverParameters.ExtractPhotoImage = true;
		ktaOptions.images = base64Array;
		ktaOptions.serverParameters.documentGroupName = "";
		ktaOptions.serverParameters.documentName = "";
		ktaOptions.serverParameters["Region"] = regionSelected;
		ktaOptions.serverParameters["IDType"] = "ID";
		ktaOptions.serverParameters["Barcode"] = null;
		ktaOptions.serverParameters["CropImage"] = true;
		ktaOptions.serverParameters.ktaDeleteDocument =
			serverSettingsOptions.ktaDeleteDocument;

		console.log(ktaOptions);

		if (serverSettingsOptions.idAuthentication == "ON") {
			ktaOptions.serverParameters["Verification"] = true;
			ktaOptions.serverParameters["AutoCropVerification"] =
				serverSettingsOptions.autoCropVerification == "ON"
					? true
					: false;
			ktaOptions.serverParameters["FrontFlashImage"] =
				cameraOptions.enableFlashCapture === "ON" ? true : false;
			if (flashImage) {
				base64 = Utils.convertImageDataToBase64(flashImage);
				base64Array.push(base64);
			}
			authenticateAndExtractIDWithKTAServer(ktaOptions);
		} else {
			extractIDWithKTAServer(ktaOptions);
		}
	};

	function findErrorFromResults(results) {
		try {
			var fields = results["extractionResponse"]["fields"];
			var errorObject = null;
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				var name = field["name"];
				var text = field["text"];
				if (name == "ErrorDetails" && text.length > 0) {
					errorObject = field;
					break;
				}
			}
			return errorObject;
		} catch (ex) {
			Utils.hideLoadingIndicator();
			handleExtractionResultError(ex);
		}
	}

	function authenticateAndExtractIDWithKTAServer(ktaOptions) {
		var timingInfo;

		function parserSuccessCallBack(parsedResults) {
			var errorObject = findErrorFromResults(parsedResults);
			if (errorObject) {
				var parsedErrorObject = JSON.parse(errorObject["text"]);
				Utils.hideLoadingIndicator();
				handleExtractionResultError(
					parsedErrorObject["errordescription"]
				);
			} else {
				checkAndDisplayResults(parsedResults, timingInfo, ktaOptions);
			}
		}

		function parserErrorCallBack(error) {
			Utils.hideLoadingIndicator();
			handleExtractionError(error);
		}

		ExtractionModule.extractionWithKtaServer(
			ktaOptions,
			function (result, timingInfoValues) {
				timingInfo = timingInfoValues;
				ParserModule.parseKTAAuthenticationResponse(
					result,
					parserSuccessCallBack,
					parserErrorCallBack
				);
			},
			function (errorMessage) {
				var currentpage = $(".ui-page-active").attr("id");

				if (currentpage == "previewscreen" && frontImage) {
					Utils.hideLoadingIndicator();
					handleExtractionError(errorMessage);
				}
			}
		);
	}

	function extractIDWithKTAServer(ktaOptions) {
		var timingInfo;

		function parserSuccessCallBack(parsedResults) {
			checkAndDisplayResults(parsedResults, timingInfo, ktaOptions);
		}

		function parserErrorCallBack(error) {
			Utils.hideLoadingIndicator();
			handleExtractionError(error);
		}

		ExtractionModule.extractionWithKtaServer(
			ktaOptions,
			function (result, timingInfoValues) {
				timingInfo = timingInfoValues;
				ParserModule.parseKTAExtractionResponse(
					result,
					parserSuccessCallBack,
					parserErrorCallBack
				);
			},
			function (errorMessage) {
				var currentpage = $(".ui-page-active").attr("id");

				if (currentpage == "previewscreen" && frontImage) {
					Utils.hideLoadingIndicator();
					handleExtractionError(errorMessage);
				}
			}
		);
	}

	function checkAndDisplayResults(result, timingInfoValues, ktaOptions) {
		var currentpage = $(".ui-page-active").attr("id");

		if (currentpage == "previewscreen" && frontImage) {
			console.log(result);

			if (ktaOptions.timingInfo) {
				alert(timingInfoValues.message);
			}
			if (serverSettingsOptions.idAuthentication == "ON") {
				extractedResults = result.extractionResponse.fields;
				authenticationResults = result.authenticationResponse;
			} else {
				extractedResults = result.fields;
			}

			extractedDocId = "";
			Utils.hideLoadingIndicator();

			if (ktaOptions.timingInfo) {
				alert(timingInfoValues.message);
			}
			if (!isOnBoardingFlow) {
				$.mobile.navigate("./FrontAndBackResults.html", {
					transition: "none",
				});
			} else {
				$.mobile.navigate("./paymentsubmit.html", {
					transition: "none",
				});
			}
		}
	}

	var initializeDocumentAlertsScreen = function () {
		var documentAlerts = authenticationResults.documentAlerts;
		var keys = Object.keys(documentAlerts);

		var value = Authention_Alert_Type.PASSED;
		var text = value.concat(
			"(",
			documentAlerts[Object.keys(documentAlerts)[0]].length.toString(),
			")"
		);
		document.getElementById("radioChoice_passed").textContent = text;

		value = Authention_Alert_Type.FAILED;
		text = value.concat(
			"(",
			documentAlerts[Object.keys(documentAlerts)[1]].length.toString(),
			")"
		);
		document.getElementById("radioChoice_failed").textContent = text;

		value = Authention_Alert_Type.ATTENTION;
		text = value.concat(
			"(",
			documentAlerts[Object.keys(documentAlerts)[2]].length.toString(),
			")"
		);
		document.getElementById("radioChoice_attention").textContent = text;

		value = Authention_Alert_Type.CAUTION;
		text = value.concat(
			"(",
			documentAlerts[Object.keys(documentAlerts)[3]].length.toString(),
			")"
		);
		document.getElementById("radioChoice_caution").textContent = text;

		//By default Passed results are selected.So show details of passed results
		selectedAlertType = Object.keys(documentAlerts)[0];
		showDocumentAlerts(documentAlerts[selectedAlertType]);
		isAuthenticationDetailsScreenPressed = true;

		$("#DocumentAlerts").change(function () {
			selectedAlertType = Object.keys(documentAlerts)[
				$("input[name=radio-choice]:checked", "#DocumentAlerts").val()
			];

			showDocumentAlerts(documentAlerts[selectedAlertType]);
		});
	};

	function initializeDocumentTestsScreen(isSelfieResult) {
		var documentTests;
		if (isSelfieResult) {
			parseSelfieDocTests();
		} else {
			parseVerificationDocTests();
		}
	}

	function initializeDocumentImageAnalysisScreen(isSelfieResult) {
		var documentImageAnalysis;
		if (isSelfieResult) {
			parseSelfieDocImgAnalysis();
		} else {
			parseVerificationDocImgAnalysis();
		}
	}

	function initializeDocumentRiskVectorAnalysisScreen(isSelfieResult) {
		var documentRiskVectorAnalysis;
		if (isSelfieResult) {
			parseSelfieDocRiskVectorAnalysis();
		} else {
			parseVerificationDocRiskVectorAnalysis();
		}
	}

	var parseSelfieDocTests = function () {
		if (SelfieModule.currentRequest === SelfieRequest.ORIGINAL) {
			documentTests = SelfieModule.selfieResults.selfieTests;
		} else if (
			SelfieModule.currentRequest === SelfieRequest.LIVELINESSONE
		) {
			documentTests = SelfieModule.livelinessSelfie1Results.selfieTests;
		} else if (
			SelfieModule.currentRequest === SelfieRequest.LIVELINESSTWO
		) {
			documentTests = SelfieModule.livelinessSelfie2Results.selfieTests;
		}
		if (documentTests != null) {
			var keys = Object.keys(documentTests);
			MobileIDModule.isSelfieDetailsScreenPressed = true;
			var li = [];
			addResultToVerificationScreen(li, documentTests[RESULT]);
			for (var i = 0; i < keys.length; i++) {
				var documentTestsObjectTitle = keys[i];
				if (documentTestsObjectTitle != RESULT) {
					var list = document.createElement("li");
					list.setAttribute("class", "classli");
					$("<p />", {
						text: documentTestsObjectTitle,
						id: "documentTestsHeading",
					}).appendTo(list);

					var documentTestsObject =
						documentTests[documentTestsObjectTitle];
					var documentTestsSubTitleKeys = Object.keys(
						documentTestsObject
					);
					for (
						var subTitleIndex = 0;
						subTitleIndex < documentTestsSubTitleKeys.length;
						subTitleIndex++
					) {
						var div = document.createElement("div");
						var subTitleName =
							documentTestsSubTitleKeys[subTitleIndex];
						$("<p />", {
							text: subTitleName,
							id: "documentTestsHeading",
						}).appendTo(div);

						var subTitleObject = documentTestsObject[subTitleName];
						$("<p />", {
							text: subTitleObject,
							id: "documentTestsData",
						}).appendTo(div);

						$(div).appendTo(list);
					}
				}
				li.push(list);
			}

			$("#documentTests").append(li);
		}
	};

	var parseVerificationDocTests = function () {
		documentTests = authenticationResults.documentTests;
		var keys = Object.keys(documentTests);
		isAuthenticationDetailsScreenPressed = true;
		var li = [];
		addResultToVerificationScreen(li, documentTests[RESULT]);
		for (var i = 0; i < keys.length; i++) {
			var documentTestsObjectTitle = keys[i];
			if (documentTestsObjectTitle != RESULT) {
				var list = document.createElement("li");
				list.setAttribute("class", "classli");
				$("<p />", {
					text: documentTestsObjectTitle,
					id: "documentTestsHeading",
				}).appendTo(list);

				var documentTestsObject =
					documentTests[documentTestsObjectTitle];
				var documentTestsSubTitleKeys = Object.keys(
					documentTestsObject
				);
				for (
					var subTitleIndex = 0;
					subTitleIndex < documentTestsSubTitleKeys.length;
					subTitleIndex++
				) {
					var div = document.createElement("div");
					var subTitleName = documentTestsSubTitleKeys[subTitleIndex];
					$("<p />", {
						text: subTitleName,
						id: "documentTestsHeading",
					}).appendTo(div);

					var subTitleObject = documentTestsObject[subTitleName];
					var subTitleDescriptionKeys = Object.keys(subTitleObject);

					for (
						var subDescriptionIndex = 0;
						subDescriptionIndex < subTitleDescriptionKeys.length;
						subDescriptionIndex++
					) {
						var subTitleDescriptionName =
							subTitleDescriptionKeys[subDescriptionIndex];
						var subTitleDescriptionValue =
							subTitleObject[subTitleDescriptionName];
						var displayDescriptionValue = subTitleDescriptionName.concat(
							":",
							subTitleDescriptionValue
						);

						$("<p />", {
							text: displayDescriptionValue,
							id: "documentTestsData",
						}).appendTo(div);
					}

					$(div).appendTo(list);
				}
			}
			li.push(list);
		}

		$("#documentTests").append(li);
	};

	var parseSelfieDocImgAnalysis = function () {
		if (SelfieModule.currentRequest === SelfieRequest.ORIGINAL) {
			documentImageAnalysis =
				SelfieModule.selfieResults.documentImageAnalysis;
		} else if (
			SelfieModule.currentRequest === SelfieRequest.LIVELINESSONE
		) {
			documentImageAnalysis =
				SelfieModule.livelinessSelfie1Results.documentImageAnalysis;
		} else if (
			SelfieModule.currentRequest === SelfieRequest.LIVELINESSTWO
		) {
			documentImageAnalysis =
				SelfieModule.livelinessSelfie2Results.documentImageAnalysis;
		}

		if (documentImageAnalysis != null) {
			var keys = Object.keys(documentImageAnalysis);
			MobileIDModule.isSelfieDetailsScreenPressed = true;
			var li = [];
			addResultToVerificationScreen(li, documentImageAnalysis[RESULT]);
			for (var i = 0; i < keys.length; i++) {
				var documentImageAnalysisObjectTitle = keys[i];
				if (documentImageAnalysisObjectTitle != RESULT) {
					var list = document.createElement("li");
					list.setAttribute("class", "classli");
					$("<p />", {
						text: documentImageAnalysisObjectTitle,
						id: "documentTestsHeading",
					}).appendTo(list);

					var div = document.createElement("div");
					var documentImageAnalysisObject =
						documentImageAnalysis[documentImageAnalysisObjectTitle];
					$("<p />", {
						text: documentImageAnalysisObject,
						id: "documentTestsData",
					}).appendTo(div);

					$(div).appendTo(list);
					li.push(list);
				}
			}

			$("#imageAnalysis").append(li);
		}
	};

	var parseVerificationDocImgAnalysis = function () {
		documentImageAnalysis = authenticationResults.documentImageAnalysis;

		var keys = Object.keys(documentImageAnalysis);
		isAuthenticationDetailsScreenPressed = true;
		var li = [];
		addResultToVerificationScreen(li, documentImageAnalysis[RESULT]);
		for (var i = 0; i < keys.length; i++) {
			var documentImageAnalysisObjectTitle = keys[i];
			if (documentImageAnalysisObjectTitle != RESULT) {
				var list = document.createElement("li");
				list.setAttribute("class", "classli");
				$("<p />", {
					text: documentImageAnalysisObjectTitle,
					id: "documentTestsHeading",
				}).appendTo(list);

				var documentImageAnalysisObject =
					documentImageAnalysis[documentImageAnalysisObjectTitle];
				var documentImageAnalysisSubTitleKeys = Object.keys(
					documentImageAnalysisObject
				);
				for (
					var subTitleIndex = 0;
					subTitleIndex < documentImageAnalysisSubTitleKeys.length;
					subTitleIndex++
				) {
					var div = document.createElement("div");
					var subTitleName =
						documentImageAnalysisSubTitleKeys[subTitleIndex];
					var Value = documentImageAnalysisObject[subTitleName];
					var displayDescriptionValue = subTitleName.concat(
						" : ",
						Value == null ? "" : Value
					);
					$("<p />", {
						text: displayDescriptionValue,
						id: "documentTestsData",
					}).appendTo(div);

					$(div).appendTo(list);
				}
				li.push(list);
			}
		}

		$("#imageAnalysis").append(li);
	};

	var parseSelfieDocRiskVectorAnalysis = function () {
		documentRiskVectorAnalysis =
			SelfieModule.selfieResults.documentRiskVectorAnalysis;
		if (documentRiskVectorAnalysis != null) {
			var keys = Object.keys(documentRiskVectorAnalysis);
			MobileIDModule.isSelfieDetailsScreenPressed = true;
			var li = [];
			addResultToVerificationScreen(
				li,
				documentRiskVectorAnalysis[RESULT]
			);
			for (var i = 0; i < keys.length; i++) {
				var documentRiskVectorAnalysisObjectTitle = keys[i];
				if (documentRiskVectorAnalysisObjectTitle != RESULT) {
					var list = document.createElement("li");
					list.setAttribute("class", "classli");
					$("<p />", {
						text: documentRiskVectorAnalysisObjectTitle,
						id: "documentTestsHeading",
					}).appendTo(list);
					var documentRiskVectorAnalysisObject =
						documentRiskVectorAnalysis[
							documentRiskVectorAnalysisObjectTitle
						];

					var documentRiskVectorAnalysisSubTitleKeys = Object.keys(
						documentRiskVectorAnalysisObject
					);
					for (
						var subTitleIndex = 0;
						subTitleIndex <
						documentRiskVectorAnalysisSubTitleKeys.length;
						subTitleIndex++
					) {
						var div = document.createElement("div");
						var subTitleName =
							documentRiskVectorAnalysisSubTitleKeys[
								subTitleIndex
							];
						var documentRiskVectorAnalysisSubObject =
							documentRiskVectorAnalysisObject[subTitleName];
						var displayDescriptionValue = subTitleName.concat(
							":",
							documentRiskVectorAnalysisSubObject == null
								? ""
								: documentRiskVectorAnalysisSubObject
						);
						$("<p />", {
							text: displayDescriptionValue,
							id: "documentTestsData",
						}).appendTo(div);
						$(div).appendTo(list);
					}
					li.push(list);
				}
			}

			$("#vectorAnalysis").append(li);
		}
	};

	var parseVerificationDocRiskVectorAnalysis = function () {
		documentRiskVectorAnalysis =
			authenticationResults.documentRiskVectorAnalysis;

		var keys = Object.keys(documentRiskVectorAnalysis);
		MobileIDModule.isSelfieDetailsScreenPressed = true;
		var li = [];
		addResultToVerificationScreen(li, documentRiskVectorAnalysis[RESULT]);
		for (var i = 0; i < keys.length; i++) {
			var documentRiskVectorAnalysisObjectTitle = keys[i];
			if (documentRiskVectorAnalysisObjectTitle != RESULT) {
				var list = document.createElement("li");
				list.setAttribute("class", "classli");
				$("<p />", {
					text: documentRiskVectorAnalysisObjectTitle,
					id: "documentTestsHeading",
				}).appendTo(list);
				var documentRiskVectorAnalysisObject =
					documentRiskVectorAnalysis[
						documentRiskVectorAnalysisObjectTitle
					];

				var documentRiskVectorAnalysisSubTitleKeys = Object.keys(
					documentRiskVectorAnalysisObject
				);
				for (
					var subTitleIndex = 0;
					subTitleIndex <
					documentRiskVectorAnalysisSubTitleKeys.length;
					subTitleIndex++
				) {
					var div = document.createElement("div");
					var subTitleName =
						documentRiskVectorAnalysisSubTitleKeys[subTitleIndex];
					$("<p />", {
						text: subTitleName,
						id: "documentTestsHeading",
					}).appendTo(list);
					var documentRiskVectorAnalysisSubObject =
						documentRiskVectorAnalysisObject[subTitleName];
					var subTitleDescriptionKeys = Object.keys(
						documentRiskVectorAnalysisSubObject
					);
					for (
						var subDescriptionIndex = 0;
						subDescriptionIndex < subTitleDescriptionKeys.length;
						subDescriptionIndex++
					) {
						var subTitleDescriptionName =
							subTitleDescriptionKeys[subDescriptionIndex];
						var subTitleDescriptionValue =
							documentRiskVectorAnalysisSubObject[
								subTitleDescriptionName
							];
						var displayDescriptionValue = subTitleDescriptionName.concat(
							":",
							subTitleDescriptionValue == null
								? ""
								: subTitleDescriptionValue
						);
						$("<p />", {
							text: displayDescriptionValue,
							id: "documentTestsData",
						}).appendTo(div);
					}

					$(div).appendTo(list);
				}
				li.push(list);
			}
		}

		$("#vectorAnalysis").append(li);
	};

	var addResultToVerificationScreen = function (li, result) {
		if (result != null && result !== "undefined") {
			var list = document.createElement("li");
			list.setAttribute("class", "classli");
			$("<p />", {
				text: DetailsScreenTitle,
				id: "documentTestsHeading",
			}).appendTo(list);
			var resultname = "Result";
			var resultDescription = resultname.concat(":", result);
			var div = document.createElement("div");
			$("<p />", {
				text: resultDescription,
				id: "documentTestsData",
			}).appendTo(div);
			$(div).appendTo(list);
			li.push(list);
		}
	};

	var initializeDocumentClassificationScreen = function () {
		var documentClassification =
			authenticationResults.documentClassification;
		isAuthenticationDetailsScreenPressed = true;

		var list = document.createElement("li");
		list.setAttribute("class", "classli");
		var documentClassificationSubTitleKeys = Object.keys(
			documentClassification
		);

		for (
			var subTitleIndex = 0;
			subTitleIndex < documentClassificationSubTitleKeys.length;
			subTitleIndex++
		) {
			var div = document.createElement("div");
			var subTitleName =
				documentClassificationSubTitleKeys[subTitleIndex];
			var Value = documentClassification[subTitleName];
			var displayDescriptionValue = subTitleName.concat(
				" : ",
				Value == null ? "" : Value
			);
			$("<p />", {
				text: displayDescriptionValue,
				id: "documentTestsData",
			}).appendTo(div);
			$(div).appendTo(list);
		}

		$("#docClassificationId").append(list);
	};

	function showDocumentAlerts(results) {
		var li = [];

		$("#documentAlerts li:not(:first)").remove();

		for (var i = 0; i < results.length; i++) {
			//create divs for each document alert
			var result = results[i];
			var keys = Object.keys(result);
			var list = document.createElement("li");
			list.setAttribute("id", "documentAlertsLi");

			for (
				var alertTextsIndex = 0;
				alertTextsIndex < keys.length;
				alertTextsIndex++
			) {
				var key = keys[alertTextsIndex];
				key = key.replace(/([A-Z])/g, " $1").trim();
				var value = result[key];
				var desDiv = document.createElement("div");
				desDiv.id = "documentAlertsDiv";
				var par = document.createElement("p");
				par.innerHTML = "<b>" + key + ":" + "</b>" + value;
				desDiv.appendChild(par);
				list.appendChild(desDiv);
			}

			li.push(list);
			$("#documentAlerts").append(li);
		}
	}

	var onSelfieInstructionScreen = function () {
		$("#selfieInstructionScreenContinue").click(function () {
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				SelfieModule.snap2 = HiddenSelfieModule.takeSelfie();
			}
			AppModule.doSelfieCapture();
		});
	};

	return {
		initializeServerSettingsScreenEvents: initializeServerSettingsScreenEvents,
		initializeExtractionResultsforStandalone: initializeExtractionResultsforStandalone,
		initializeDocumentAlertsScreen: initializeDocumentAlertsScreen,
		initializeDocumentTestsScreen: initializeDocumentTestsScreen,
		initializeDocumentImageAnalysisScreen: initializeDocumentImageAnalysisScreen,
		initializeDocumentRiskVectorAnalysisScreen: initializeDocumentRiskVectorAnalysisScreen,
		initializeDocumentClassificationScreen: initializeDocumentClassificationScreen,
		saveServerSettings: saveServerSettings,
		serverSettingsOptions: serverSettingsOptions,
		extractData: extractData,
		cancelExtraction: cancelExtraction,
		handleExtractionError: handleExtractionError,
		handleExtractionResultError: handleExtractionResultError,
		navigateToDocumentAlerts: navigateToDocumentAlerts,
		navigateToDocumentTests: navigateToDocumentTests,
		navigateToDocumentImageAnalysis: navigateToDocumentImageAnalysis,
		navigateToDocumentRiskVectorAnalysis: navigateToDocumentRiskVectorAnalysis,
		navigateToDocumentClassification: navigateToDocumentClassification,
		updateValues: updateValues,
		TransactionId: TransactionId,
		VerificationPhoto64: VerificationPhoto64,
		isSelfieDetailsScreenPressed: isSelfieDetailsScreenPressed,
		onSelfieInstructionScreen: onSelfieInstructionScreen,
	};
})();
