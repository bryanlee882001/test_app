var CheckDepositModule = (function () {
	var frontImage = null; //To store the captured and processed images and maintain the mode and side
	var backImage = null;
	var isOnBoardingFlow = true;
	var selectedRegion = null;

	var extractedResults = null;
	var extractedDocId = null;

	var extractedResultsFields = [
		"ProductVersion",
		"A2iA_CheckAmount",
		"A2iA_CheckCodeline",
		"A2iA_CheckDate",
		"A2iA_CheckNumber",
		"A2iA_CheckPayeeName",
		"A2iA_CheckLAR",
		"A2iA_CheckCAR",
		"A2iA_CheckCodeline_AuxiliaryOnUs",
		"A2iA_CheckCodeline_EPC",
		"A2iA_CheckCodeline_Transit",
		"A2iA_CheckCodeline_OnUs1",
		"IQAFailure_UndersizeImage",
		"IQAFailure_FoldedOrTornDocumentCorners",
		"IQAFailure_FoldedOrTornDocumentEdges",
		"IQAFailure_DocumentFramingError",
		"IQAFailure_DocumentSkew",
		"IQAFailure_OversizeImage",
		"IQAFailure_PiggybackDocument",
		"IQAFailure_ImageTooLight",
		"IQAFailure_ImageTooDark",
		"IQAFailure_HorizontalStreaks",
		"IQAFailure_BelowMinFrontImageSize",
		"IQAFailure_AboveMaxFrontImageSize",
		"IQAFailure_BelowMinRearImageSize",
		"IQAFailure_AboveMaxRearImageSize",
		"IQAFailure_SpotNoise",
		"IQAFailure_ImageDimensionMismatch",
		"IQAFailure_OutOfFocus",
		"UsabilityFailure_CAR",
		"UsabilityFailure_LAR",
		"UsabilityFailure_Signature",
		"UsabilityFailure_PayeeName",
		"UsabilityFailure_Date",
		"UsabilityFailure_Codeline",
		"UsabilityFailure_PayeeEndorsement",
		"CheckUsable",
		"ReasonForRejection",
		"RestrictiveEndorsement",
		"RestrictiveEndorsementPresent",
	];

	//Server options are used to extract the check  details
	var serverSettingsOptions = {
		serverType: "RTTI",
		serverURLForRTTI:
			"https://use_a_valid_URL_instead_of_this",
		serverURLForKTA: "",
		ktaUserName: "",
		ktaPassword: "",
		ktasessionId: KTALimitedSessionID,
		processIdentityName: "KofaxCheckDepositSync",
		ktaDeleteDocument: "YES",
	};

	var FIELD_CHECKDATE = "A2iA_CheckDate";
	var FIELD_CHECKCODELINE = "A2iA_CheckCodeline";
	var FIELD_REASONFORREJECTION = "ReasonForRejection";
	var FIELD_RESTRICTIVEENDORSEMENT = "RestrictiveEndorsement";
	var FIELD_RESTRICTIVEENDORSEMENTPRESENT = "RestrictiveEndorsementPresent";
	var FIELD_CHECKAMOUNT = "A2iA_CheckAmount";
	var FIELD_CHECKCODELINETRANSIT = "A2iA_CheckCodeline_Transit";
	var FIELD_CHECKCODELINEONUS1 = "A2iA_CheckCodeline_OnUs1";
	var FIELD_CHECKNUMBER = "A2iA_CheckNumber";
	var FIELD_CHECKPAYEENAME = "A2iA_CheckPayeeName";
	var FIELD_READONLY = "Flag_ReadOnly";
	var FIELD_IQAFAILURE = "IQAFailure";
	var FIELD_USABILITYFAILURE = "UsabilityFailure";
	var FIELD_PRODUCT_VERSION = "ProductVersion";

	var filterExtractionResults = function () {
		var filteredExtractionResults = [];

		for (var i = 0; i < extractedResults.length; i++) {
			// First check , if the current field needs to be shown or not

			if (
				$.inArray(extractedResults[i].name, extractedResultsFields) >= 0
			) {
				// Codeline i.e., MICR should not have special characters

				if (extractedResults[i].name === FIELD_CHECKCODELINE) {
					extractedResults[i].text = extractedResults[i].text
						.split(",")
						.join(" ");
					extractedResults[i].text = extractedResults[i].text
						.split(".")
						.join(" ");
				}

				// The IQAFAILURE and USABILITYFAILURE value should be shown as Succeeded  or Failed

				if (
					extractedResults[i].name.indexOf(FIELD_IQAFAILURE) != -1 ||
					extractedResults[i].name.indexOf(FIELD_USABILITYFAILURE) !=
						-1
				) {
					if (extractedResults[i].text == "TRUE") {
						extractedResults[i].text = "Failed";
					} else {
						extractedResults[i].text = "Succeeded";
					}
				}

				// Reason for Rejection

				if (extractedResults[i].name === FIELD_REASONFORREJECTION) {
					var fieldAlternatives =
						extractedResults[i].fieldAlternatives;

					if (
						fieldAlternatives != null &&
						typeof fieldAlternatives != "undefined"
					) {
						if (fieldAlternatives.length > 0) {
							var count = 0;
							var value = "";
							var dictField;
							for (dictField in fieldAlternatives) {
								count++;
								value += dictField.text + " ";
								if (count != fieldAlternatives.length) {
									value += ".";
								}
							}
						}
					}
				}

				// Restrictive Endorsement

				if (extractedResults[i].name === FIELD_RESTRICTIVEENDORSEMENT) {
					// First check if the RestrictiveEndorsementPresent is True or False
					if (i < extractedResults.length - 1) {
						if (
							extractedResults[i + 1].name ===
							FIELD_RESTRICTIVEENDORSEMENTPRESENT
						) {
							if (extractedResults[i + 1].text == "FALSE") {
								continue;
							}
						}
					}
				}

				// Check if the field can be editable or not

				if (
					extractedResults[i].name === FIELD_CHECKAMOUNT ||
					extractedResults[i].name === FIELD_CHECKCODELINETRANSIT ||
					extractedResults[i].name === FIELD_CHECKCODELINEONUS1 ||
					extractedResults[i].name === FIELD_CHECKDATE ||
					extractedResults[i].name === FIELD_CHECKNUMBER ||
					extractedResults[i].name === FIELD_CHECKPAYEENAME
				) {
					extractedResults[i][FIELD_READONLY] = false;
				} else {
					extractedResults[i][FIELD_READONLY] = true;
				}

				filteredExtractionResults.push(extractedResults[i]);
			}
		}

		extractedResults = filteredExtractionResults;
	};

	//Here we are initializing all events in extraction results display screen
	var initializeExtractionResultsDisplayScreenEvents = function () {
		$("#extractionresultsdisplayscreen_submit").text("Done");
		//Adding the click event for Front button in FrontScreen
		$("#extractionresultsdisplayscreen_submit").click(function (event) {
			event.preventDefault();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		filterExtractionResults();

		var li = [];
		for (var i = 0; i < extractedResults.length; i++) {
			var inputType = "text";

			if (extractedResults[i].name == "A2iA_CheckPayeeName") {
				$("#payeename")
					.val(extractedResults[i].text)
					.removeAttr("placeholder");
			} else if (extractedResults[i].name == "A2iA_CheckNumber") {
				$("#checknumber")
					.val(extractedResults[i].text)
					.removeAttr("placeholder");
			} else if (extractedResults[i].name == "A2iA_CheckAmount") {
				$("#amount")
					.val(extractedResults[i].text)
					.removeAttr("placeholder");
			}

			if (extractedResults[i].name === FIELD_CHECKDATE) {
				inputType = "date";
			}
		}
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

	var initializeExtractionResultsforStandalone = function () {
		Utils.showLoadingIndicator();
		$("#extractionresultsdisplayscreen_submit").text("Done");
		var isbackPressed = false;
		$("#result_back").click(function (event) {
			isbackPressed = true;
			$("#result_popupalert").popup("open");
		});

		$("#yes").click(function () {
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
			if (isbackPressed) {
				window.history.go(
					-($.mobile.navigate.history.stack.length - 2)
				);
			} else {
				window.history.go(
					-($.mobile.navigate.history.stack.length - 1)
				);
			}
		});

		filterExtractionResults();

		var li = [];

		for (var i = 0; i < extractedResults.length; i++) {
			var inputType = "text";
			var value = extractedResults[i].text;
			if (extractedResults[i].name === FIELD_CHECKDATE) {
				inputType = "date";
				value = DateParser.parseToyyyymmdd(extractedResults[i].text);
			}
			var field_name = extractedResults[i].name;
			field_name = field_name.replace(/([A-Z])/g, " $1").trim();
			li.push("<li>" + field_name + "</li>");
			updateValues(true, value, i);
			if (
				!extractedResults[i].Flag_ReadOnly &&
				extractedResults[i].name != FIELD_PRODUCT_VERSION
			) {
				li.push(
					"<li><input type=" +
						inputType +
						' style="width:100%;background-color:white;border:none;" value="' +
						value +
						'" onchange="CheckDepositModule.updateValues(false,this.value,' +
						i +
						')"/></li>'
				);
			} else {
				li.push(
					"<li><input type=" +
						inputType +
						' style="width:100%;background-color:#d0d5d6;color:white;border:none;" value="' +
						value +
						'" readonly/></li>'
				);
			}
		}

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
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
			dpi: parseInt(ProcessorModule.checkDepositProcessorOptions.dpi),
		};
		selectedRegion = region;
		frontImage = frontimage;
		if (backimage != null) {
			backImage = backimage;
		}
		isOnBoardingFlow = isOnBoardingflow;

		if (isOnBoardingFlow || serverSettingsOptions.serverType == "RTTI") {
			performRTTIExtraction();
		} else {
			performKTAExtraction();
		}
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

	var cancelExtraction = function () {
		ExtractionModule.cancelExtraction();
	};

	//Here we are initializing all events in server settings screen
	var initializeServerSettingsScreenEvents = function () {
		$("#ServerType").change(function () {
			if (
				$("input[name=radio-choice]:checked", "#ServerType").val() ==
				"RTTI"
			) {
				$("#serverurl").val(serverSettingsOptions.serverURLForRTTI);
				hideOrShowKTADetails(true);
			} else {
				$("#serverurl").val(serverSettingsOptions.serverURLForKTA);
				hideOrShowKTADetails(false);
			}
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

		$("#ktausername").val(serverSettingsOptions.ktaUserName);
		$("#ktapassword").val(serverSettingsOptions.ktaPassword);
		$("#ktasessionId").val(serverSettingsOptions.ktasessionId);
		$("#ProcessIdentity").val(serverSettingsOptions.processIdentityName);

		if (serverSettingsOptions.serverType == "RTTI") {
			$("#serverurl").val(serverSettingsOptions.serverURLForRTTI);
			hideOrShowKTADetails(true);
		} else {
			$("#serverurl").val(serverSettingsOptions.serverURLForKTA);
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

	//Save the server settings
	var saveServerSettings = function () {
		serverSettingsOptions.serverType = $(
			"input[name=radio-choice]:checked",
			"#ServerType"
		).val();

		if (serverSettingsOptions.serverType == "RTTI") {
			serverSettingsOptions.serverURLForRTTI = $("#serverurl").val();
		} else {
			serverSettingsOptions.serverURLForKTA = $("#serverurl").val();
			serverSettingsOptions.ktaUserName = $("#ktausername").val();
			serverSettingsOptions.ktaPassword = $("#ktapassword").val();
			serverSettingsOptions.ktasessionId = $("#ktasessionId").val();
			serverSettingsOptions.processIdentityName =
				$("#ProcessIdentity").val();
		}
	};

	var performRTTIExtraction = function () {
		var uint8ImageArray = [];

		var dataURL;

		dataURL = Utils.convertImageDataToDataURL(frontImage);
		var binary = Utils.dataUrlToUint8Array(dataURL);
		uint8ImageArray.push(binary);

		if (backImage != null) {
			dataURL = Utils.convertImageDataToDataURL(backImage);
			var binary = Utils.dataUrlToUint8Array(dataURL);
			uint8ImageArray.push(binary);
		}

		var rttiOptions = Utils.defaultStructureForRTTIOptions();
		rttiOptions.url = serverSettingsOptions.serverURLForRTTI;
		rttiOptions.images = uint8ImageArray;

		rttiOptions.serverParameters = {
			xCountry: selectedRegion,
			processimage: true,
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
			if (parsedResults[0].result != "Error") {
				extractedResults = parsedResults[0].fields;
				extractedDocId = parsedResults[0].documentId;
				Utils.hideLoadingIndicator();

				if (rttiOptions.timingInfo) {
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
			} else {
				var ErrorDescription = parsedResults[0].errorDescription;
				Utils.hideLoadingIndicator();
				handleExtractionResultError(ErrorDescription);
			}
		}
	}

	var performKTAExtraction = function () {
		var base64Array = [];
		var base64;
		base64 = Utils.convertImageDataToBase64(frontImage);
		base64Array.push(base64);

		if (backImage != null) {
			base64 = Utils.convertImageDataToBase64(backImage);
			base64Array.push(base64);
		}

		var ktaOptions = Utils.defaultStructureForKTAOptions();
		ktaOptions.url = serverSettingsOptions.serverURLForKTA;
		ktaOptions.images = base64Array;
		ktaOptions.serverParameters.username =
			serverSettingsOptions.ktaUserName;
		ktaOptions.serverParameters.password =
			serverSettingsOptions.ktaPassword;
		ktaOptions.serverParameters.sessionId =
			serverSettingsOptions.ktasessionId;
		ktaOptions.serverParameters.processIdentityName =
			serverSettingsOptions.processIdentityName;
		ktaOptions.serverParameters.documentGroupName = "";
		ktaOptions.serverParameters.documentName = "";
		ktaOptions.serverParameters["Country"] = selectedRegion;
		ktaOptions.serverParameters["ProcessImage"] = true;
		ktaOptions.serverParameters.ktaDeleteDocument =
			serverSettingsOptions.ktaDeleteDocument;
		console.log(ktaOptions);

		var timingInfo = null;
		function parserSuccessCallBack(parsedResults) {
			displayExtractionResults(parsedResults, ktaOptions, timingInfo);
		}

		function parserErrorCallBack(error) {
			Utils.hideLoadingIndicator();
			handleExtractionError(error);
		}

		ExtractionModule.extractionWithKtaServer(
			ktaOptions,
			function (result, timingInfoValues) {
				timingInfo = timingInfoValues;
				parseKTAExtractionResponse(
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

	function parseKTAExtractionResponse(
		serverResponse,
		successCallBack,
		errorCallBack
	) {
		ParserModule.parseKTAExtractionResponse(
			serverResponse,
			successCallBack,
			errorCallBack
		);
	}

	function displayExtractionResults(results, ktaOptions, timingInfoValues) {
		// Check if the user has not clicked Back button i.e, the user is on current page

		var currentpage = $(".ui-page-active").attr("id");
		if (currentpage == "previewscreen" && frontImage) {
			console.log(results);

			extractedResults = results.fields;
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

	//Here return the global functions
	return {
		initializeExtractionResultsDisplayScreenEvents:
			initializeExtractionResultsDisplayScreenEvents,
		initializeExtractionResultsforStandalone:
			initializeExtractionResultsforStandalone,
		initializeServerSettingsScreenEvents:
			initializeServerSettingsScreenEvents,
		saveServerSettings: saveServerSettings,
		cancelExtraction: cancelExtraction,
		extractData: extractData,
		handleExtractionError: handleExtractionError,
		handleExtractionResultError: handleExtractionResultError,
		updateValues: updateValues,
	};
})();
