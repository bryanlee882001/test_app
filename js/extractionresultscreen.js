var ExtractionResultScreenModule = (function () {
	var onEntryForm1Screen = function (currentModule) {
		$("input[type=radio][name=radio-choice-h-2]").on("change", function () {
			Utils.hideKeyboard();
		});

		$("#entryform1next").click(function () {
			if (
				document.getElementById("first").value.length == 0 ||
				document.getElementById("last").value.length == 0 ||
				document.getElementById("dob").value.length == 0
			) {
				bootbox.alert("One or more required fields are empty or invalid");
			} else {
				$.mobile.navigate("./EntryForm2.html", { transition: "none" });
			}
		});
		if (currentModule != null && currentModule == Module.PASSPORT) {
			NewAccountModule.initializePassportExtractionResults();
		} else if (currentModule != null && currentModule == Module.MOBILEID) {
			NewAccountModule.initializeDLExtractionResults();
		} else {
			NewAccountModule.initializeManualDataInformation();
		}
	};

	var onEntryForm2Screen = function (currentModule) {
		mobileIDResultFields();
		$("#entryform2next").click(function () {
			if (
				(currentModule == Module.MOBILEID || currentModule != Module.PASSPORT) &&
				(document.getElementById("address1").value.length == 0 ||
					document.getElementById("state").value.length == 0 ||
					document.getElementById("zip").value.length == 0)
			) {
				bootbox.alert("One or more required fields are empty or invalid");
			} else {
				$.mobile.navigate("./Residency.html", { transition: "none" });
			}
		});

		if (currentModule != null && currentModule != Module.PASSPORT && currentModule != Module.MOBILEID) {
			currentModule = extractionInformation.PersonalDetails.IDType;
		} else {
			extractionInformation.PersonalDetails.IDType = currentModule;
		}

		if (currentModule != null && currentModule == Module.PASSPORT) {
			NewAccountModule.initializePassportExtractionResults();
			passportResultFields();
		} else if (currentModule != null && currentModule == Module.MOBILEID) {
			NewAccountModule.initializeDLExtractionResults();
		} else {
			NewAccountModule.initializeManualDataInformation();
		}
	};

	var onEntryForm3Screen = function (currentModule) {
		$("#entryform3next").click(function () {
			if (
				document.getElementById("citizenship").value.length == 0 ||
				document.getElementById("ssn").value.length == 0
			) {
				bootbox.alert("One or more required fields are empty or invalid");
			} else {
				$.mobile.navigate("./FundTransfer.html", { transition: "none" });
			}
		});

		if (currentModule != null && currentModule == Module.BILLPAY) {
			NewAccountModule.initializeBillPayExtractionResults();
		}
	};

	var verifyCommunicationAddress = function (currentModule) {
		$("#communicationaddressnext").click(function () {
			if (
				document.getElementById("address1").value.length == 0 ||
				document.getElementById("state").value.length == 0 ||
				document.getElementById("zip").value.length == 0
			) {
				bootbox.alert("One or more required fields are empty or invalid");
			} else {
				$.mobile.navigate("./EntryForm3.html", { transition: "none" });
			}
		});
		if (currentModule != null && currentModule == Module.BILLPAY) {
			NewAccountModule.initializeBillPayExtractionResults();
		}
	};

	var mobileIDResultFields = function () {
		$("#communication_details").show();
		$("#dl_details").show();
		$("#passport_details").hide();
	};

	var passportResultFields = function () {
		$("#communication_details").hide();
		$("#dl_details").hide();
		$("#passport_details").show();
	};

	var showResults = function (currentModule) {
		if (currentModule == Module.CREDITCARD) {
			CreditCardModule.initializeExtractionResultsDisplayScreenEventsforStandalone();
		} else if (currentModule == Module.CHECK) {
			CheckDepositModule.initializeExtractionResultsforStandalone();
		} else if (currentModule == Module.BILLPAY) {
			BillPayModule.initializeExtractionResultsforStandalone();
		} else if (currentModule == Module.PASSPORT) {
			PassportModule.initializeExtractionResultsforStandalone();
		} else if (currentModule == Module.MOBILEID) {
			MobileIDModule.initializeExtractionResultsforStandalone();
		}
	};

	//Here return the global functions
	return {
		showResults: showResults,
		verifyCommunicationAddress: verifyCommunicationAddress,
		onEntryForm1Screen: onEntryForm1Screen,
		onEntryForm2Screen: onEntryForm2Screen,
		onEntryForm3Screen: onEntryForm3Screen,
	};
})();
