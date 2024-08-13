var BillPayModule = (function () {
	var capturedImage = null; //To store the captured  image
	var isOnBoardingFlow = false;

	var extractedDocId = null;
	var extractedResults = {};

	var FIELD_BILLERS = "Billers";
	var FIELD_SOURCE = "Source";
	var FIELD_DUEDATE = "DueDate";
	var FIELD_AUTO_PAYDATE = "AutoPayDate";
	var FIELD_LATE_PAYMENT_DATE = "LatePaymentDate";
	var FIELD_PRODUCT_VERSION = "ProductVersion";

	//Server options are used to extract the bill details
	var serverSettingsOptions = {
		serverType: "RTTI", //KTA
		serverURLForRTTI: "https://use_a_valid_URL_instead_of_this",
		serverURLForKTA: "",
		ktaUserName: "",
		ktaPassword: "",
		ktasessionId: KTALimitedSessionID,
		processIdentityName: "KofaxBillPaySync",
		storeFolderAndDocuments: "false",
	};

	var updateValues = function (isFirstTimeRecord, value, index) {
		var options = new FieldChangeOption();
		if (extractedResults[index].valid && extractedResults[index].valid === true) {
			options.IsValid = 1;
		} else {
			options.IsValid = 0;
		}

		options.ErrorDescription = extractedResults[index].errorDescription;
		options.FormattingFailed = extractedResults[index].formattingFailed;
		options.FieldName = extractedResults[index].name;
		options.OriginalValue = isFirstTimeRecord ? "" : extractedResults[index].text;
		options.Confidence = extractedResults[index].confidence;
		options.ChangedValue = value;
		options.DocumentID = extractedDocId;
		AppStatsModule.recordFieldChangeEventsinAppStats(options);

		extractedResults[index].text = value;
	};

	//Here we are initializing all events in extraction results display screen
	var initializeExtractionResultsforStandalone = function () {
		Utils.showLoadingIndicator();
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
		//Added delay because of page transition.
		setTimeout(function () {
			var base64 = Utils.convertImageDataToBase64(capturedImage);
			imgFrontElement.src = "data:image/jpeg;base64," + base64;
			Utils.hideLoadingIndicator();
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
				window.history.go(-($.mobile.navigate.history.stack.length - 2));
			} else {
				window.history.go(-($.mobile.navigate.history.stack.length - 1));
			}
		});

		var li = [];

		for (var i = 0; i < extractedResults.length; i++) {
			var inputType = "text";
			var value = extractedResults[i].text;
			if (extractedResults[i].name == FIELD_DUEDATE) {
				inputType = "date";
				value = DateParser.parseToyyyymmdd(extractedResults[i].text);
			}

			// Expect "Billers" and "Source" field , all the other values from the extraction results need to be displayed .
			if (extractedResults[i].name !== FIELD_BILLERS && extractedResults[i].name !== FIELD_SOURCE) {
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
							'" onchange="BillPayModule.updateValues(false,this.value,' +
							i +
							')"/></li>'
					);
				}
			}
		}

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
	};

	var extractData = function (imagedata, isOnBoardingflow) {
		var dictDPI = { dpi: parseInt(ProcessorModule.creditCardProcessorOptions.dpi) };
		capturedImage = imagedata;
		isOnBoardingFlow = isOnBoardingflow;
		if (isOnBoardingFlow) {
			performRTTIExtraction();
			return;
		}
		if (serverSettingsOptions.serverType == "RTTI") {
			performRTTIExtraction();
		} else {
			//  This section is for KTA
			performKTAExtraction();
		}
	};

	var handleExtractionError = function (errorMessage) {
		if (errorMessage.code == KfxWebSDK.ERROR_CODE_VALIDATION) {
			// Input Validation error

			handleExtractionResultError(errorMessage.message);
		} else {
			$("#ID_MORETEXT").css({
				height: "0px",
			});

			$("#ID_MORE").show();
			$("#extractionfailed").hide();
			$("#ID_MORETEXT").text("");
			AppModule.extractionErrorMessage = errorMessage.message;

			$("#ID_EXTRACTIONERRORPOPUP").popup("open");
		}
	};

	var handleExtractionResultError = function (errDesc) {
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
			if ($("input[name=radio-choice]:checked", "#ServerType").val() == "RTTI") {
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
		serverSettingsOptions.serverType = $("input[name=radio-choice]:checked", "#ServerType").val();

		if (serverSettingsOptions.serverType == "RTTI") {
			serverSettingsOptions.serverURLForRTTI = $("#serverurl").val();
		} else {
			serverSettingsOptions.serverURLForKTA = $("#serverurl").val();
			serverSettingsOptions.ktaUserName = $("#ktausername").val();
			serverSettingsOptions.ktaPassword = $("#ktapassword").val();
			serverSettingsOptions.ktasessionId = $("#ktasessionId").val();
			serverSettingsOptions.processIdentityName = $("#ProcessIdentity").val();
		}
	};

	var performRTTIExtraction = function () {
		var uint8ImageArray = [];

		var dataURL;

		dataURL = Utils.convertImageDataToDataURL(capturedImage);
		var binary = Utils.dataUrlToUint8Array(dataURL);
		uint8ImageArray.push(binary);

		var rttiOptions = Utils.defaultStructureForRTTIOptions();
		rttiOptions.url = serverSettingsOptions.serverURLForRTTI;
		rttiOptions.images = uint8ImageArray;

		rttiOptions.serverParameters = {
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
				// Check if the user has not clicked Back button i.e, the user is on current page
				ParserModule.parseRTTIExtractionResponse(result, parserSuccessCallBack, parserErrorCallBack);
			},
			function (errorMessage) {
				// Check if the user has not clicked Back button i.e, the user is on current page

				var currentpage = $(".ui-page-active").attr("id");

				if (currentpage == "previewscreen" && capturedImage) {
					Utils.hideLoadingIndicator();
					handleExtractionError(errorMessage);
				}
			}
		);
	};

	function handleRTTIParsedResponse(parsedResults, rttiOptions) {
		var currentpage = $(".ui-page-active").attr("id");

		if (currentpage == "previewscreen" && capturedImage) {
			console.log(parsedResults);
			if (parsedResults[0].result != "Error") {
				extractedResults = parsedResults[0].fields;
				extractedDocId = parsedResults[0].documentId;

				Utils.hideLoadingIndicator();

				if (rttiOptions.timingInfo) {
					alert(timingInfoValues.message);
				}
				if (!isOnBoardingFlow) {
					$.mobile.navigate("./Result.html", { transition: "none" });
				} else {
					NewAccountModule.setBillPayCommunicationAddressFromExtractionResults(extractedResults);
					$.mobile.navigate("./CommunicationAddress.html", { transition: "none" });
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

		var base64 = Utils.convertImageDataToBase64(capturedImage);
		base64Array.push(base64);

		var ktaOptions = Utils.defaultStructureForKTAOptions();
		ktaOptions.url = serverSettingsOptions.serverURLForKTA;
		ktaOptions.images = base64Array;
		ktaOptions.serverParameters.username = serverSettingsOptions.ktaUserName;
		ktaOptions.serverParameters.password = serverSettingsOptions.ktaPassword;
		ktaOptions.serverParameters.sessionId = serverSettingsOptions.ktasessionId;
		ktaOptions.serverParameters.processIdentityName = serverSettingsOptions.processIdentityName;
		ktaOptions.serverParameters.documentGroupName = "";
		ktaOptions.serverParameters.documentName = "";
		ktaOptions.serverParameters.ktaDeleteDocument = serverSettingsOptions.ktaDeleteDocument;
		ktaOptions.serverParameters["ProcessImage"] = true;

		var timingInfo;
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
				parseKTAExtractionResponse(result, parserSuccessCallBack, parserErrorCallBack);
			},
			function (errorMessage) {
				// Check if the user has not clicked Back button i.e, the user is on current page

				var currentpage = $(".ui-page-active").attr("id");

				if (currentpage == "previewscreen" && capturedImage) {
					Utils.hideLoadingIndicator();
					handleExtractionError(errorMessage);
				}
			}
		);
	};

	function parseKTAExtractionResponse(serverResponse, successCallBack, errorCallBack) {
		ParserModule.parseKTAExtractionResponse(serverResponse, successCallBack, errorCallBack);
	}

	function displayExtractionResults(results, ktaOptions, timingInfoValues) {
		// Check if the user has not clicked Back button i.e, the user is on current page

		var currentpage = $(".ui-page-active").attr("id");

		if (currentpage == "previewscreen" && capturedImage) {
			console.log(results);

			extractedResults = results.fields;
			extractedDocId = "";
			Utils.hideLoadingIndicator();

			if (ktaOptions.timingInfo) {
				alert(timingInfoValues.message);
			}

			if (!isOnBoardingFlow) {
				$.mobile.navigate("./Result.html", { transition: "none" });
			} else {
				$.mobile.navigate("./CommunicationAddress.html", { transition: "none" });
			}
		}
	}

	//Here return the global functions
	return {
		initializeExtractionResultsforStandalone: initializeExtractionResultsforStandalone,
		cancelExtraction: cancelExtraction,
		initializeServerSettingsScreenEvents: initializeServerSettingsScreenEvents,
		saveServerSettings: saveServerSettings,
		extractData: extractData,
		handleExtractionError: handleExtractionError,
		handleExtractionResultError: handleExtractionResultError,
		updateValues: updateValues,
	};
})();
