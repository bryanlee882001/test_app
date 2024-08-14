var ParserModule = (function () {
	var FIELD_ERROR_DETAILS = "ErrorDetails";
	var VERIFICATION_ERROR_INFO = "VerificationErrorInfo";
	var parseKTAExtractionResponse = function (serverResponse, successCallBack, errorCallBack) {
		if (!verifyDocumentID(serverResponse)) {
			var error = createError("Document Id is not defined", KfxWebSDK.ERROR_CODE_RUNTIME);
			errorCallBack(error);
			return;
		}

		if (checkForKTAError(serverResponse, errorCallBack, true)) {
			return;
		}

		var dict = serverResponse.d;

		var arrFields = dict.ReturnedDocumentFields[0].ReturnedDocumentFields;

		var dictResponse = {
			sessionKey: "",
			words: [],
			"classificationResult ": [],
			documentId: dict.DocumentId,
			extractionClass: " ", //inputParameters.serverParameters.documentName,
			JobId: dict.JobIdentity.Id,
			fields: [],
		};

		var data = [];

		for (var i = 0; i < arrFields.length; i++) {
			var dictFields = arrFields[i];

			var dictObj = {
				id: dictFields.Id === null ? "" : dictFields.Id,
				text: dictFields.Value === null ? "" : dictFields.Value,
				name: dictFields.Name === null ? "" : dictFields.Name,
				confidence: dictFields.Confidence === null ? "" : dictFields.Confidence,
				errorDescription: dictFields.ErrorDescription === null ? "" : dictFields.ErrorDescription,
				valid: dictFields.Valid === null ? "" : dictFields.Valid,
			};

			data.push(dictObj);
		}

		dictResponse.fields = data;

		successCallBack(dictResponse);
		return;
	};

	var verifyDocumentID = function (serverResponse) {
		var documentId = fetchTheDocumentID(serverResponse);

		if (documentId === null || typeof documentId === "undefined") {
			return false;
		}

		return true;
	};

	// Fetch the document id.
	function fetchTheDocumentID(serverResponse) {
		var dict = serverResponse.d;
		if (dict === null || dict === "undefined") {
			return null;
		}
		return dict.DocumentId;
	}

	var checkForKTAError = function (serverResponse, errorCallBack, isCheckForExtractionError) {
		var returnedDocumentFieldsArray = getProperArrayFromKTAResponse(serverResponse);

		if (returnedDocumentFieldsArray == null) {
			return true;
		}

		for (var i = 0; i < returnedDocumentFieldsArray.length; i++) {
			if (
				(returnedDocumentFieldsArray[i].Name == FIELD_ERROR_DETAILS && isCheckForExtractionError) ||
				returnedDocumentFieldsArray[i].Name == VERIFICATION_ERROR_INFO
			) {
				var obj = returnedDocumentFieldsArray[i].Value;
				if (obj != null) {
					var errorObject;
					if (typeof obj === "string") {
						if (obj.length !== 0) {
							errorObject = JSON.parse(obj);
						} else {
							return false;
						}
					} else {
						errorObject = obj;
					}
					var error = createError(
						isCheckForExtractionError ? errorObject.errordescription : errorObject.ErrorMessage,
						KfxWebSDK.ERROR_CODE_RUNTIME
					);
					errorCallBack(error);
					return true;
				} else {
					return false;
				}
			}
		}
		return false;
	};

	// Get the results from server response.
	var getProperArrayFromKTAResponse = function (serverResponse) {
		var dict = serverResponse.d;
		if (dict === null || dict === "undefined") {
			return null;
		}
		return dict.ReturnedDocumentFields[0].ReturnedDocumentFields;
	};

	var parseRTTIExtractionResponse = function (serverResponse, successCallBack, errorCallBack) {
		var parsedResponse = null;
		try {
			parsedResponse = JSON.parse(serverResponse);
		} catch (exception) {
			parsedResponse = null;
		}

		if (parsedResponse == null) {
			var error = createError("We did not receive a valid server response", KfxWebSDK.ERROR_CODE_RUNTIME);
			errorCallBack(error);
			return;
		} else if (parsedResponse.exceptionMessage || (parsedResponse.Message && parsedResponse.Message.length > 0)) {
			var error = createError(parsedResponse.Message, KfxWebSDK.ERROR_CODE_RUNTIME);
			errorCallBack(error);
			return;
		} else {
			successCallBack(parsedResponse);
		}
	};

	var parseKTAAuthenticationResponse = function (serverResponse, successCallBack, errorCallBack) {
		if (checkForKTAError(serverResponse, errorCallBack, false)) {
			return;
		}
		var authenticationAndExtractionResults = parseTheAuthenticationAndExtractionResults(serverResponse);
		if (authenticationAndExtractionResults == null) {
			var error = createError(
				"Authentication Results not found in Server response",
				KfxWebSDK.ERROR_CODE_RUNTIME
			);
			errorCallBack(error);
			return;
		}
		successCallBack(authenticationAndExtractionResults, null);
	};

	var parseTheAuthenticationAndExtractionResults = function (serverResponse) {
		var returnedDocumentFieldsArray = getProperArrayFromKTAResponse(serverResponse);
		var authenticationResponse = parseAuthenticationResponse(returnedDocumentFieldsArray);

		if (authenticationResponse == null) {
			return null;
		}

		var extractionResponse = parseExtractionResponseFromAuthentication(serverResponse);

		//Form a response dictionary with authentication and extraction results
		var dictResponse = {
			authenticationResponse: authenticationResponse,
			extractionResponse: extractionResponse,
		};

		//authenticationAndExtractionResults = dictResponse;
		return dictResponse;
	};

	function parseAuthenticationResponse(returnedDocumentFieldsArray) {
		if (returnedDocumentFieldsArray == null) {
			return null;
		}
		var authenticationResults = null;

		//Form authentication JSON from server response
		var authenticationResponse = {
			authenticationResult: null,
			VerificationPhoto64: null,
			transactionId: null,
			documentAlerts: null,
			documentTests: null,
			documentImageAnalysis: null,
			documentRiskVectorAnalysis: null,
			documentClassification: null,
		};

		for (var i = 0; i < returnedDocumentFieldsArray.length; i++) {
			if (returnedDocumentFieldsArray[i].Name == "VerificationReserved") {
				authenticationResults = returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "VerificationResult") {
				authenticationResponse.authenticationResult = returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "VerificationPhoto64") {
				authenticationResponse.VerificationPhoto64 = returnedDocumentFieldsArray[i].Value;
			}
			if (returnedDocumentFieldsArray[i].Name == "VerificationTransactionID") {
				authenticationResponse.transactionId = returnedDocumentFieldsArray[i].Value;
			}
		}

		if (
			authenticationResults != null &&
			authenticationResults !== "undefined" &&
			Utils.isJSONValid(authenticationResults) != false
		) {
			authenticationResults = JSON.parse(authenticationResults);
			if (authenticationResults.DocumentInfo != null && authenticationResults.DocumentInfo != undefined) {
				var documentInfo = authenticationResults.DocumentInfo;
				if (documentInfo.DocumentAlerts == null || documentInfo.DocumentAlerts.length <= 0) {
					documentInfo.DocumentAlerts = "";
				}

				if (documentInfo.DocumentTests == null || documentInfo.DocumentTests.length <= 0) {
					documentInfo.DocumentTests = "";
				}

				if (documentInfo.DocumentImageAnalysis == null || documentInfo.DocumentImageAnalysis.length <= 0) {
					documentInfo.DocumentImageAnalysis = "";
				}

				if (
					documentInfo.DocumentRiskVectorAnalysis == null ||
					documentInfo.DocumentRiskVectorAnalysis.length <= 0
				) {
					documentInfo.DocumentRiskVectorAnalysis = "";
				}

				if (documentInfo.DocumentClassification == null || documentInfo.DocumentClassification.length <= 0) {
					documentInfo.DocumentClassification = "";
				}

				authenticationResponse.documentAlerts = documentInfo.DocumentAlerts;
				authenticationResponse.documentTests = documentInfo.DocumentTests;
				authenticationResponse.documentImageAnalysis = documentInfo.DocumentImageAnalysis;
				authenticationResponse.documentRiskVectorAnalysis = documentInfo.DocumentRiskVectorAnalysis;
				authenticationResponse.documentClassification = documentInfo.DocumentClassification;
			} else {
				if (authenticationResults.DocumentAlerts == null || authenticationResults.DocumentAlerts.length <= 0) {
					authenticationResults.DocumentAlerts = "";
				}

				if (
					authenticationResults.DocumentImageIntegrityAnalysis == null ||
					authenticationResults.DocumentImageIntegrityAnalysis.length <= 0
				) {
					authenticationResults.DocumentImageIntegrityAnalysis = "";
				}

				if (
					authenticationResults.DocumentImageAnalysis == null ||
					authenticationResults.DocumentImageAnalysis.length <= 0
				) {
					authenticationResults.DocumentImageAnalysis = "";
				}

				if (
					authenticationResults.DocumentRiskVectorData == null ||
					authenticationResults.DocumentRiskVectorData.length <= 0
				) {
					authenticationResults.DocumentRiskVectorAnalysis = "";
				}

				if (
					authenticationResults.DocumentClassification == null ||
					authenticationResults.DocumentClassification.length <= 0
				) {
					authenticationResults.DocumentClassification = "";
				}

				authenticationResponse.documentAlerts = authenticationResults.DocumentAlerts;
				authenticationResponse.documentTests = authenticationResults.DocumentImageIntegrityAnalysis;
				authenticationResponse.documentImageAnalysis = authenticationResults.DocumentImageAnalysis;
				authenticationResponse.documentRiskVectorAnalysis = authenticationResults.DocumentRiskVectorData;
				authenticationResponse.documentClassification = authenticationResults.DocumentClassification;
			}
		}

		return authenticationResponse;
	}

	function parseExtractionResponseFromAuthentication(serverResponse) {
		//Form extraction JSON from server response
		var extractionResponse = {
			sessionKey: "",
			words: [],
			"classificationResult ": [],
			documentId: serverResponse.d.DocumentId,
			extractionClass: "",
			JobId: serverResponse.d.JobIdentity.Id,
			fields: [],
		};

		var returnedDocumentFieldsArray = getProperArrayFromKTAResponse(serverResponse);

		extractionResponse.fields = getFieldsArrayFromExtractionResults(returnedDocumentFieldsArray);

		return extractionResponse;
	}

	//Method to get extracted fields from authentication server response
	function getFieldsArrayFromExtractionResults(returnedDocumentFieldsArray) {
		var data = [];
		var arrFields = returnedDocumentFieldsArray;

		for (var i = 0; i < arrFields.length; i++) {
			var dictFields = arrFields[i];

			var dictObj = {
				id: dictFields.Id === null ? "" : dictFields.Id,
				text: dictFields.Value === null ? "" : dictFields.Value,
				name: dictFields.Name === null ? "" : dictFields.Name,
				confidence: dictFields.Confidence === null ? "" : dictFields.Confidence,
				errorDescription: dictFields.ErrorDescription === null ? "" : dictFields.ErrorDescription,
				valid: dictFields.Valid === null ? "" : dictFields.Valid,
			};

			data.push(dictObj);
		}

		return data;
	}

	function createError(message, code) {
		var error = {
			message: "",
			code: code,
		};
		error.message = message;
		error.code = code;
		return error;
	}

	return {
		parseKTAExtractionResponse: parseKTAExtractionResponse,
		parseRTTIExtractionResponse: parseRTTIExtractionResponse,
		parseKTAAuthenticationResponse: parseKTAAuthenticationResponse,
	};
})();
