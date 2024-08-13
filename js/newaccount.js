var NewAccountModule = (function () {
	function defaultStructureForExtractionResults() {
		var extractionInformation = {
			DocumentType: "",
			PersonalDetails: {
				IDType: Module.MOBILEID,
				FirstName: "",
				MiddleName: "",
				LastName: "",
				Gender: "",
				DateOfBirth: "",
				PassportNumber: "",
				IssueDate: "",
				ExpirationDate: "",
				Country: "",
				MRZ1: "",
				MRZ2: "",
			},
			CommunicationAddress: {
				Address: "",
				Address2: "",
				City: "",
				State: "",
				ZIP: "",
			},
			CommunicationAddressBills: {
				Address: "",
				Address2: "",
				City: "",
				State: "",
				ZIP: "",
			},
			ContactInformation: {
				ContactNumberType: "Mobile",
				PhoneNumber: "",
				EmailAddress: "",
				Citizenship: "",
				SocialSecurityNumber: "",
			},
			FundTransfer: {
				Amount: "",
				CreditCardDetails: {
					CardNumber: "",
					Name: "",
					ExpiryDate: "",
					SecurityCode: "",
				},

				CheckDetails: {
					CheckNumber: "",
					PayeeName: "",
					AccountName: "",
				},
			},
		};

		return extractionInformation;
	}

	var initializeDLExtractionResults = function () {
		//Adding the click event for Front button in FrontScreen
		$("#extractionresultsdisplayscreen_submit").click(function (event) {
			event.preventDefault();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		if (extractionInformation.PersonalDetails.FirstName.length > 0) {
			$("#first").val(extractionInformation.PersonalDetails.FirstName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.MiddleName.length > 0) {
			$("#middle").val(extractionInformation.PersonalDetails.MiddleName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.LastName.length > 0) {
			$("#last").val(extractionInformation.PersonalDetails.LastName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.DateOfBirth.length > 0) {
			inputType = "date";
			$("#dob").val(extractionInformation.PersonalDetails.DateOfBirth).removeAttr("placeholder");
		}
		if (extractionInformation.DocumentType.length > 0) {
			$("#id").val(extractionInformation.DocumentType).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.Address.length > 0) {
			$("#address1").val(extractionInformation.CommunicationAddress.Address).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.Address2.length > 0) {
			$("#address2").val(extractionInformation.CommunicationAddress.Address2).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.City.length > 0) {
			$("#city").val(extractionInformation.CommunicationAddress.City).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.State.length > 0) {
			$("#state").val(extractionInformation.CommunicationAddress.State).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.ZIP.length > 0) {
			$("#zip").val(extractionInformation.CommunicationAddress.ZIP).removeAttr("placeholder");
		}

		if (extractionInformation.ContactInformation.Citizenship.length > 0) {
			$("#country").val(extractionInformation.ContactInformation.Citizenship).removeAttr("placeholder");
		}

		if (extractionInformation.PersonalDetails.Gender == "M") {
			$("#radio-choice-h-2a").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		} else {
			$("#radio-choice-h-2b").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		}
	};

	var initializePassportExtractionResults = function () {
		//Adding the click event for Front button in FrontScreen
		$("#extractionresultsdisplayscreen_submit").click(function (event) {
			event.preventDefault();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		if (extractionInformation.PersonalDetails.FirstName.length > 0) {
			$("#first").val(extractionInformation.PersonalDetails.FirstName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.MiddleName.length > 0) {
			$("#middle").val(extractionInformation.PersonalDetails.MiddleName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.LastName.length > 0) {
			$("#last").val(extractionInformation.PersonalDetails.LastName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.DateOfBirth.length > 0) {
			$("#dob").val(extractionInformation.PersonalDetails.DateOfBirth).removeAttr("placeholder");
			inputType = "date";
		}
		if (extractionInformation.DocumentType.length > 0) {
			$("#id").val(extractionInformation.DocumentType).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.PassportNumber.length > 0) {
			$("#passport_number").val(extractionInformation.PersonalDetails.PassportNumber).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.IssueDate.length > 0) {
			$("#issue_date").val(extractionInformation.PersonalDetails.IssueDate).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.ExpirationDate.length > 0) {
			$("#expiration_date").val(extractionInformation.PersonalDetails.ExpirationDate).removeAttr("placeholder");
		}
		if (extractionInformation.ContactInformation.Citizenship.length > 0) {
			$("#country").val(extractionInformation.ContactInformation.Citizenship).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.MRZ1.length > 0) {
			$("#mrz1").val(extractionInformation.PersonalDetails.MRZ1).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.MRZ2.length > 0) {
			$("#mrz2").val(extractionInformation.PersonalDetails.MRZ1).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.Gender == "M") {
			$("#radio-choice-h-2a").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		} else {
			$("#radio-choice-h-2b").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		}
	};

	//Here we are initializing all events in extraction results display screen
	var initializeBillPayExtractionResults = function () {
		if (extractionInformation.CommunicationAddressBills.ZIP.length > 0) {
			$("#zip").val(extractionInformation.CommunicationAddressBills.ZIP).removeAttr("placeholder");
		}
		if (extractionInformation.ContactInformation.PhoneNumber.length > 0) {
			$("#phonenumber").val(extractionInformation.ContactInformation.PhoneNumber).removeAttr("placeholder");
		}
		if (extractionInformation.ContactInformation.SocialSecurityNumber.length > 0) {
			$("#ssn").val(extractionInformation.ContactInformation.SocialSecurityNumber).removeAttr("placeholder");
		}
		if (extractionInformation.ContactInformation.Citizenship.length > 0) {
			$("#email").val(extractionInformation.ContactInformation.Citizenship).removeAttr("placeholder");
		}
		if (extractionInformation.ContactInformation.EmailAddress.length > 0) {
			$("#citizenship").val(extractionInformation.ContactInformation.Citizenship).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddressBills.State.length > 0) {
			$("#state").val(extractionInformation.CommunicationAddressBills.State).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddressBills.City.length > 0) {
			$("#city").val(extractionInformation.CommunicationAddressBills.City).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddressBills.Address2.length > 0) {
			$("#address2").val(extractionInformation.CommunicationAddressBills.Address2).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddressBills.Address.length > 0) {
			$("#address1").val(extractionInformation.CommunicationAddressBills.Address).removeAttr("placeholder");
		}

		$("#PhoneType").val(extractionInformation.ContactInformation.ContactNumberType);
	};

	var initializeManualDataInformation = function () {
		if (extractionInformation.PersonalDetails.FirstName.length > 0) {
			$("#first").val(extractionInformation.PersonalDetails.FirstName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.MiddleName.length > 0) {
			$("#middle").val(extractionInformation.PersonalDetails.MiddleName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.LastName.length > 0) {
			$("#last").val(extractionInformation.PersonalDetails.LastName).removeAttr("placeholder");
		}
		if (extractionInformation.PersonalDetails.DateOfBirth.length > 0) {
			$("#dob").val(extractionInformation.PersonalDetails.DateOfBirth).removeAttr("placeholder");
		}
		if (extractionInformation.DocumentType.length > 0) {
			$("#id").val(extractionInformation.DocumentType).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.Address.length > 0) {
			$("#address1").val(extractionInformation.CommunicationAddress.Address).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.Address2.length > 0) {
			$("#address2").val(extractionInformation.CommunicationAddress.Address2).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.City.length > 0) {
			$("#city").val(extractionInformation.CommunicationAddress.City).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.State.length > 0) {
			$("#state").val(extractionInformation.CommunicationAddress.State).removeAttr("placeholder");
		}
		if (extractionInformation.CommunicationAddress.ZIP.length > 0) {
			$("#zip").val(extractionInformation.CommunicationAddress.ZIP).removeAttr("placeholder");
		}

		if (extractionInformation.ContactInformation.Citizenship.length > 0) {
			$("#country").val(extractionInformation.ContactInformation.Citizenship).removeAttr("placeholder");
		}

		if (extractionInformation.PersonalDetails.Gender == "M") {
			$("#radio-choice-h-2a").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		} else {
			$("#radio-choice-h-2b").attr("checked", true);
			$("input[type='radio']").checkboxradio("refresh");
		}
	};

	var saveExtractionResults = function () {
		var currentpage = $(".ui-page-active").attr("id");
		if (currentpage == "entryform1") {
			extractionInformation.PersonalDetails.FirstName = $("#first").val();
			extractionInformation.PersonalDetails.MiddleName = $("#middle").val();
			extractionInformation.PersonalDetails.LastName = $("#last").val();
			extractionInformation.PersonalDetails.DateOfBirth = $("#dob").val();
			extractionInformation.PersonalDetails.Gender = $("input[name=radio-choice-h-2]:checked", "#Gender").val();
		} else if (currentpage == "entryform2") {
			extractionInformation.DocumentType = $("#id").val();

			if (currentModule == Module.PASSPORT) {
				extractionInformation.PersonalDetails.PassportNumber = $("#passport_number").val();
				extractionInformation.PersonalDetails.IssueDate = $("#issue_date").val();
				extractionInformation.PersonalDetails.ExpirationDate = $("#expiration_date").val();
				extractionInformation.ContactInformation.Citizenship = $("#country").val();
				extractionInformation.PersonalDetails.MRZ1 = $("#mrz1").val();
				extractionInformation.PersonalDetails.MRZ2 = $("#mrz2").val();
			} else {
				extractionInformation.CommunicationAddress.Address = $("#address1").val();
				extractionInformation.CommunicationAddress.Address2 = $("#address2").val();
				extractionInformation.CommunicationAddress.City = $("#city").val();
				extractionInformation.CommunicationAddress.State = $("#state").val();
				extractionInformation.CommunicationAddress.ZIP = $("#zip").val();
			}
		}
	};

	var setExtractionInformationFromExtractionResults = function (extractedResults) {
		for (var i = 0; i < extractedResults.length; i++) {
			if (extractedResults[i].name == "FirstName") {
				extractionInformation.PersonalDetails.FirstName = extractedResults[i].text;
			} else if (extractedResults[i].name == "MiddleName") {
				extractionInformation.PersonalDetails.MiddleName = extractedResults[i].text;
			} else if (extractedResults[i].name == "LastName") {
				extractionInformation.PersonalDetails.LastName = extractedResults[i].text;
			} else if (extractedResults[i].name == "DateOfBirth") {
				extractionInformation.PersonalDetails.DateOfBirth = extractedResults[i].text;
			} else if (extractedResults[i].name == "DocumentType") {
				extractionInformation.DocumentType = extractedResults[i].text;
			} else if (extractedResults[i].name == "Address") {
				extractionInformation.CommunicationAddress.Address = extractedResults[i].text;
			} else if (extractedResults[i].name == "Address2") {
				extractionInformation.CommunicationAddress.Address2 = extractedResults[i].text;
			} else if (extractedResults[i].name == "City") {
				extractionInformation.CommunicationAddress.City = extractedResults[i].text;
			} else if (extractedResults[i].name == "State") {
				extractionInformation.CommunicationAddress.State = extractedResults[i].text;
			} else if (extractedResults[i].name == "ZIP") {
				extractionInformation.CommunicationAddress.ZIP = extractedResults[i].text;
			} else if (extractedResults[i].name == "Country") {
				extractionInformation.ContactInformation.Country = extractedResults[i].text;
			} else if (extractedResults[i].name == "Gender") {
				extractionInformation.PersonalDetails.Gender = extractedResults[i].text;
			} else if (extractedResults[i].name == "MRZ2") {
				extractionInformation.PersonalDetails.MRZ2 = extractedResults[i].text;
			} else if (extractedResults[i].name == "MRZ1") {
				extractionInformation.PersonalDetails.MRZ1 = extractedResults[i].text;
			} else if (extractedResults[i].name == "ExpirationDate") {
				extractionInformation.PersonalDetails.ExpirationDate = extractedResults[i].text;
			} else if (extractedResults[i].name == "IssueDate") {
				extractionInformation.PersonalDetails.IssueDate = extractedResults[i].text;
			} else if (extractedResults[i].name == "PassportNumber") {
				extractionInformation.PersonalDetails.PassportNumber = extractedResults[i].text;
			}
		}
	};

	var setBillPayCommunicationAddressFromExtractionResults = function (extractedResults) {
		for (var i = 0; i < extractedResults.length; i++) {
			if (extractedResults[i].name == "PayerAddressLine1") {
				extractionInformation.CommunicationAddressBills.Address = extractedResults[i].text;
			} else if (extractedResults[i].name == "PayerAddressLine2") {
				extractionInformation.CommunicationAddressBills.Address2 = extractedResults[i].text;
			} else if (extractedResults[i].name == "PayerCity") {
				extractionInformation.CommunicationAddressBills.City = extractedResults[i].text;
			} else if (extractedResults[i].name == "PayerState") {
				extractionInformation.CommunicationAddressBills.State = extractedResults[i].text;
			} else if (extractedResults[i].name == "PayerZip") {
				extractionInformation.CommunicationAddressBills.ZIP = extractedResults[i].text;
			}
		}
	};

	var saveCommunicationAddress = function () {
		extractionInformation.CommunicationAddressBills.Address = $("#address1").val();
		extractionInformation.CommunicationAddressBills.Address2 = $("#address2").val();
		extractionInformation.CommunicationAddressBills.City = $("#city").val();
		extractionInformation.CommunicationAddressBills.State = $("#state").val();
		extractionInformation.CommunicationAddressBills.ZIP = $("#zip").val();
	};

	var saveContactInformation = function () {
		extractionInformation.ContactInformation.PhoneNumber = $("#phonenumber").val();
		extractionInformation.ContactInformation.EmailAddress = $("#citizenship").val();
		extractionInformation.ContactInformation.Citizenship = $("#email").val();
		extractionInformation.ContactInformation.SocialSecurityNumber = $("#ssn").val();
		extractionInformation.ContactInformation.ContactNumberType = $("#PhoneType option:selected").text();
	};

	return {
		initializeDLExtractionResults: initializeDLExtractionResults,
		initializePassportExtractionResults: initializePassportExtractionResults,
		initializeBillPayExtractionResults: initializeBillPayExtractionResults,
		saveExtractionResults: saveExtractionResults,
		defaultStructureForExtractionResults: defaultStructureForExtractionResults,
		setExtractionInformationFromExtractionResults: setExtractionInformationFromExtractionResults,
		setBillPayCommunicationAddressFromExtractionResults: setBillPayCommunicationAddressFromExtractionResults,
		initializeManualDataInformation: initializeManualDataInformation,
		saveCommunicationAddress: saveCommunicationAddress,
		saveContactInformation: saveContactInformation,
	};
})();
