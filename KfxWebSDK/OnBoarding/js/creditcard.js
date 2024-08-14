var CreditCardModule = (function () {
	var capturedImage = null; //To store the captured  image
	var isOnBoardingFlow = true;

	var extractedResults = null;
	var extractedDocId = null;

	var FIELD_DUEDATE = "DueDate";

	var FIELD_BILLERS = "Billers";
	var FIELD_SOURCE = "Source";

	//Server options are used to extract the credit card details
	var serverSettingsOptions = {
		serverType: "RTTI",
		serverURLForRTTI: "https://use_a_valid_URL_instead_of_this",
		processIdentityName: "KofaxCreditCardHTML5",
		extractMethodType: "Detect",
		ktaDeleteDocument: "NO",
	};

	//Here we are initializing all events in extraction results display screen
	var initializeExtractionResultsDisplayScreenEvents = function () {
		var li = [];
		for (var i = 0; i < extractedResults.length; i++) {
			var inputType = "text";

			if (extractedResults[i].name == "ExpirationDate") {
				$("#expirydate").val(extractedResults[i].text).removeAttr("placeholder");
			} else if (extractedResults[i].name == "CardNumber") {
				$("#my_number").val(extractedResults[i].text).removeAttr("placeholder");
			} else if (extractedResults[i].name == "CVV") {
				$("#security_code").val(extractedResults[i].text).removeAttr("placeholder");
			}

			if (extractedResults[i].name == FIELD_DUEDATE) {
				inputType = "date";
			}
		}
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
	var initializeExtractionResultsDisplayScreenEventsforStandalone = function () {
		Utils.showLoadingIndicator();
		var isAmountFieldExist = false;
		var isCVVFieldExist = false;
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
			$("#result_popupalert").popup("close");
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

			if (extractedResults[i].name == "Amount") {
				isAmountFieldExist = true;
			}
			if (extractedResults[i].name == "CVV") {
				isCVVFieldExist = true;
			}

			if (extractedResults[i].name == "CardNumber") {
				extractedResults[i].name = "Number";
			}

			// Expect "Billers" and "Source" field , all the other values from the extraction results need to be displayed .
			if (extractedResults[i].name !== FIELD_BILLERS && extractedResults[i].name !== FIELD_SOURCE) {
				updateValues(true, value, i);
				var field_name = extractedResults[i].name;
				field_name = field_name.replace(/([A-Z])/g, " $1").trim();
				li.push("<li>" + field_name + "</li>");
				li.push(
					"<li><input type=" +
						inputType +
						' style="width:100%;background-color:white;border:none;" value="' +
						value +
						'" onchange="CreditCardModule.updateValues(false,this.value,' +
						i +
						')"/></li>'
				);
			}
		}

		if (!isAmountFieldExist) {
			li.push("<li>" + "Amount" + "</li>");
			li.push(
				"<li><input type=" +
					"number" +
					' style="width:100%;background-color:white;border:none;" value="' +
					"" +
					'"/></li>'
			);
		}

		if (!isCVVFieldExist) {
			li.push("<li>" + "CVV" + "</li>");
			li.push(
				"<li><input type=" +
					"number" +
					' style="width:100%;background-color:white;border:none;" value="' +
					"" +
					'"/></li>'
			);
		}

		$("ul.paging").append($(li.join("")));

		$("ul.paging").quickPager({ pageSize: 20 });
	};

	var extractData = function (imagedata, isOnBoardingflow) {
		var dictDPI = { dpi: parseInt(ProcessorModule.creditCardProcessorOptions.dpi) };
		capturedImage = imagedata;
		isOnBoardingFlow = isOnBoardingflow;

		var uint8ImageArray = [];

		var dataURL;

		dataURL = Utils.convertImageDataToDataURL(capturedImage);
		var binary = Utils.dataUrlToUint8Array(dataURL);
		uint8ImageArray.push(binary);

		var rttiOptions = Utils.defaultStructureForRTTIOptions();
		rttiOptions.url = serverSettingsOptions.serverURLForRTTI;
		rttiOptions.images = uint8ImageArray;

		// Credit Card doesn't support "processimage" and "ipProfile" request parameters . As HTML5 cannot process everything on device , we need to
		// take support of server . So for credit card module we are not checking if it is at server side or device device processing as of now .

		rttiOptions.serverParameters = {
			xImagePerfection: "true",
			xExtractMethod: serverSettingsOptions.extractMethodType,
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
					$.mobile.navigate("./paymentsubmit.html", { transition: "none" });
				}
			} else {
				var ErrorDescription = parsedResults[0].errorDescription;
				Utils.hideLoadingIndicator();
				handleExtractionResultError(ErrorDescription);
			}
		}
	}

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
		$("#KTADETAILS").hide();
		$("#ServerTypeDiv").hide();
		$("#serverUrlText").text("RTTI Server Url");
		$("#serverurl").val(serverSettingsOptions.serverURLForRTTI);
		$("input[type='radio']")
			.filter(".extractMethodType")
			.each(function () {
				if (serverSettingsOptions.extractMethodType == $(this).val()) {
					$(this).prop("checked", true).checkboxradio("refresh");
				} else {
					$(this).prop("checked", false).checkboxradio("refresh");
				}
			});
	};

	//Save the server settings
	var saveServerSettings = function () {
		serverSettingsOptions.serverURLForRTTI = $("#serverurl").val();
		serverSettingsOptions.extractMethodType = $("input[name=radio-mode]:checked", "#type").val();
	};

	//Here return the global functions
	return {
		initializeExtractionResultsDisplayScreenEvents: initializeExtractionResultsDisplayScreenEvents,
		initializeExtractionResultsDisplayScreenEventsforStandalone: initializeExtractionResultsDisplayScreenEventsforStandalone,
		cancelExtraction: cancelExtraction,
		initializeServerSettingsScreenEvents: initializeServerSettingsScreenEvents,
		saveServerSettings: saveServerSettings,
		extractData: extractData,
		handleExtractionError: handleExtractionError,
		handleExtractionResultError: handleExtractionResultError,
		updateValues: updateValues,
	};
})();
