var CAPTURESIDE = {
	CAPTURE_FRONT: 0,
	CAPTURE_BACK: 1,
	CAPTURE_SELFIE: 2,
};

var APP_VERSION = 3.8;

var Module = {
	MOBILEID: 0,
	BILLPAY: 1,
	PASSPORT: 2,
	CREDITCARD: 3,
	CHECK: 4,
	SELFIE: 5,
};

var showcaptureinstruction = true;
var isSelfieResult = false;
var cameraOptions = {
	isUseAdvcanceCapture: false,
	isUseSelfieCapture: false,
	isHiddenCapture: true,
	downscaleSize: 2,
	showTapToDismissMessage: true,
	enableFlashCapture: "OFF",
	orientation: "LANDSCAPE",
	drawInstructionsAsText: true,
};

var currentCameraOptions = null;
var currentCaptureOptions = null;

var amountEntered;
var frontCapturedImage;
var backCapturedImage;
var selfieCapturedImage;
var idorpassport;
var isOnBoardingFlow;
var flashImage;

var isRetakeCalled = false;
var isSubmitAlertDisplay = false;
var extractionInformation;
var currentModule = null;

var KTALimitedSessionID = "C640521793431F4486D4EF1586672385";

var AppModule = (function () {
	var selfieBackPressed = null;
	var extractionErrorMessage;
	var capturedSide = 0;
	var currentpage;

	window.onload = function () {
		cameraOptions.resolution = KfxWebSDK.resolution.RES_FULL_HD;
		CaptureModule.checkForAutoCaptureSupport(
			function () {
				CaptureModule.isAutoCaptureSupported = true;
			},
			function () {
				CaptureModule.isAutoCaptureSupported = false;
			}
		);
	};

	$(document).ready(function () {
		if (typeof Storage !== "undefined") {
			// Check if the refresh of the browser has been clicked , If so navigate it to Home Page
			if (sessionStorage.isFirstTimeVisit == "true") {
				sessionStorage.isFirstTimeVisit = "false";
			} else {
				sessionStorage.isFirstTimeVisit = "true";
				window.location.href = "./Home.html";
			}
		}

		initializeHomeScreenEvents();
		$("#new_customer").click(function () {
			isOnBoardingFlow = true;
			$.mobile.navigate("./UserAgreement.html", { transition: "none" });
		});
	});

	$(document).on("pagebeforehide", function (e, data) {
		Utils.hideLoadingIndicator();
		var currentpage = data.prevPage.attr("id");
		if (currentpage == "capturescreen" && cameraDisabled == false) {
			stopCapture();
		} else if (currentpage == "globalsettingsScreen") {
			saveGlobalSettings();
		} else if (currentpage == "extractionsettingsscreen") {
			saveServerSettings();
		} else if (currentpage == "entryform1" || currentpage == "entryform2") {
			saveExtractionResults();
		} else if (currentpage == "entryform3") {
			saveContactInformation();
		} else if (currentpage == "communicationaddress") {
			currentModule = Module.BILLPAY;
			saveCommunicationAddress();
		} else if (currentpage == "fundtransfer") {
			extractionInformation.FundTransfer.amount = $("#amount").val();
		} else if (
			currentpage == "selfiecapturescreen" &&
			cameraDisabled == false
		) {
			stopSelfieCapture();
		} else if (
			currentpage == "selfieResultScreen" ||
			currentpage == "frontAndBackResultScreen"
		) {
			var nextPage = data.nextPage.attr("id");
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture &&
				nextPage == "previewscreen"
			) {
				HiddenSelfieModule.stopCamera();
			}
			return;
		}
	});

	$(document).on("pageshow", function (e, data) {
		currentpage = $(".ui-page-active").attr("id");
		if (currentpage == "home") {
			appStatsResume();
		} else if (currentpage == "info1") {
			onInfo1Screen();
		} else if (currentpage == "info2") {
			onInfo2Screen();
		} else if (currentpage == "swipe") {
			capturedSide = CAPTURESIDE.CAPTURE_FRONT;
			carousel.onSwipeScreen();
		} else if (currentpage == "capturescreen") {
			$("#ID_CAMERA_DIV").css({
				width: parseInt($(window).width()) + "px",
				height: parseInt($(window).height()) + "px",
			});
			onCaptureScreen();
		} else if (currentpage == "selfiecapturescreen") {
			$("#ID_SELFIE_CAMERA_DIV").css({
				width: parseInt($(window).width()) + "px",
				height: parseInt($(window).height()) + "px",
			});
			onSelfieCaptureScreen();
		} else if (currentpage == "previewscreen") {
			var prevPage = data.prevPage.attr("id");
			if (prevPage == "selfieResultScreen") {
				isSubmitAlertDisplay = true;
				window.history.forward();
				return;
			}
			initializePreviewScreenEvents();
		} else if (currentpage == "paymentsubmit") {
			paymentSubmit();
		} else if (currentpage == "entryform1") {
			ExtractionResultScreenModule.onEntryForm1Screen(currentModule);
		} else if (currentpage == "entryform2") {
			ExtractionResultScreenModule.onEntryForm2Screen(currentModule);
		} else if (currentpage == "entryform3") {
			currentModule = Module.BILLPAY;
			ExtractionResultScreenModule.onEntryForm3Screen(currentModule);
		} else if (currentpage == "fundtransfer") {
			fundTransfer();
		} else if (currentpage == "resultscreen") {
			ExtractionResultScreenModule.showResults(currentModule);
		} else if (currentpage == "regionselectionscreen") {
			capturedSide = CAPTURESIDE.CAPTURE_FRONT;
			selectedCountry = "";
			selelctedIdType = "";
			regionSelectionScreen();
		} else if (currentpage == "cdregionselectionscreen") {
			capturedSide = CAPTURESIDE.CAPTURE_FRONT;
			$("#mypopupalert").css({
				width: (parseInt($(window).width()) * 2.5) / 3 + "px",
			});
			selectedCountry = "";
			selelctedIdType = "";
			cdRegionSelectionScreen();
		} else if (currentpage == "residency") {
			$("#billpay").css({
				width: parseInt($(window).width()) / 2 + "px",
				marginTop: parseInt($(window).height()) / 4 + "px",
				marginLeft: parseInt($(window).width()) / 4 + "px",
			});
			onResidencyScreen();
		} else if (currentpage == "communicationaddress") {
			currentModule = Module.BILLPAY;
			ExtractionResultScreenModule.verifyCommunicationAddress(
				currentModule
			);
		} else if (currentpage == "documentAlertsPage") {
			MobileIDModule.initializeDocumentAlertsScreen();
		} else if (currentpage == "documentTestsPage") {
			MobileIDModule.initializeDocumentTestsScreen(isSelfieResult);
		} else if (currentpage == "frontAndBackResultScreen") {
			isSelfieResult = false;
			if (AppModule.selfieBackPressed == true) {
				currentModule = Module.MOBILEID;
			}
			ExtractionResultScreenModule.showResults(currentModule);
		} else if (currentpage == "documentImageAnalysis") {
			MobileIDModule.initializeDocumentImageAnalysisScreen(
				isSelfieResult
			);
		} else if (currentpage == "documentRiskVectorAnalysis") {
			MobileIDModule.initializeDocumentRiskVectorAnalysisScreen(
				isSelfieResult
			);
		} else if (currentpage == "documentClassification") {
			MobileIDModule.initializeDocumentClassificationScreen();
		} else if (currentpage == "selfieResultScreen") {
			isSelfieResult = true;
			SelfieModule.initializeSelfieResults();
			if (isSubmitAlertDisplay) {
				isSubmitAlertDisplay = false;
				$("#result_back").trigger("click");
			}
		} else if (currentpage == "selfieInstructionScreen") {
			Utils.showLoadingIndicator();
			if (
				SelfieCaptureModule.selfieCaptureOptions.enableAutoCapture ===
				true
			) {
				$("#selfie_autocapture_instructions").show();
				$("#selfie_taptocapture_instructions").hide();
			} else {
				$("#selfie_taptocapture_instructions").show();
				$("#selfie_autocapture_instructions").hide();
			}
			KfxWebSDK.SelfieCapture.loadModels(
				function () {
					console.log("Models loaded");
					MobileIDModule.onSelfieInstructionScreen();
					Utils.hideLoadingIndicator();
				},
				function (error) {
					alert(JSON.stringify(error));
					Utils.hideLoadingIndicator();
				}
			);
		} else if (currentpage == "hiddenSelfieResultScreen") {
			SelfieModule.intializeLivelinessSelfieResults();
		}
	});

	$(document).on("pagebeforeshow", function (e, data) {
		var currentpage = data.toPage.attr("id");

		if (currentpage == "home") {
			onHomeScreen();
		} else if (currentpage == "extractionsettingsscreen") {
			if (currentModule === Module.MOBILEID) {
				SelfieCaptureModule.checkForSelfieCaptureSupport(
					function () {},
					function () {}
				);
			}
			initializeServerSettingsScreenEvents();
		} else if (currentpage == "thumbnailscreen") {
			thumbnailScreen();
		} else if (currentpage == "globalsettingsScreen") {
			globalSettingsScreen();
			var iOSVersion = Utils.iOSVersion();
			if (
				(iOSVersion !== undefined &&
					iOSVersion.length > 0 &&
					iOSVersion[0] < 11) ||
				!CaptureModule.isAutoCaptureSupported
			) {
				hideAdvanceCapture(true);
			} else {
				hideAdvanceCapture(false);
			}
		}
	});

	var paymentSubmit = function () {
		$("#paymentamount").val(amountEntered).removeAttr("placeholder");
		if (currentModule == Module.CHECK) {
			CheckDepositModule.initializeExtractionResultsDisplayScreenEvents();
			CheckResultFields();
		} else if (currentModule == Module.CREDITCARD) {
			CreditCardModule.initializeExtractionResultsDisplayScreenEvents();
			creditCardResultFields();
		}

		$("#positionWindow").click(function () {
			if (
				(currentModule == Module.CREDITCARD &&
					(document.getElementById("name_on_credit_card").value
						.length == 0 ||
						document.getElementById("expirydate").value.length ==
							0 ||
						document.getElementById("security_code").value.length ==
							0)) ||
				document.getElementById("paymentamount").value.length == 0
			) {
				bootbox.alert(
					"One or more required fields are empty or invalid"
				);
			} else {
				$("#mypopupalert").popup("open");
			}
		});

		$("#yes").click(function () {
			$("#mypopupalert").hide();
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});
	};

	var fundTransfer = function () {
		$("#amount").val(extractionInformation.FundTransfer.amount);

		$("#credit_card").on("click", function () {
			if (document.getElementById("amount").value.length == 0) {
				bootbox.alert(
					"One or more required fields are empty or invalid"
				);
			} else {
				Utils.hideKeyboard();
				setTimeout(function () {
					currentModule = Module.CREDITCARD;
					amountEntered = document.getElementById("amount").value;
					if (
						CaptureModule.isAutoCaptureSupported &&
						cameraOptions.isUseAdvcanceCapture
					) {
						$.mobile.navigate("./Capture.html", {
							transition: "none",
						});
					} else {
						doStandardCapture("frontscreen_front_show");
					}
				}, 200);
			}
		});

		$("#check").on("click", function () {
			if (document.getElementById("amount").value.length == 0) {
				bootbox.alert(
					"One or more required fields are empty or invalid"
				);
			} else {
				Utils.hideKeyboard();
				setTimeout(function () {
					currentModule = Module.CHECK;
					amountEntered = document.getElementById("amount").value;
					if (
						CaptureModule.isAutoCaptureSupported &&
						cameraOptions.isUseAdvcanceCapture
					) {
						$.mobile.navigate("./Capture.html", {
							transition: "none",
						});
					} else {
						doStandardCapture("frontscreen_front_show");
					}
				}, 200);
			}
		});
	};

	var thumbnailScreen = function () {
		initializeAppStats();
		$("#thumbnail").css({
			marginTop: parseInt($(window).height() / 4) + "px",
			marginLeft: parseInt($(window).width() / 4) + "px",
			width: parseInt($(window).width()) / 2 + "px",
		});
		var thumbnail_image = document.getElementById("thumbnail_img");

		if (currentModule == Module.CREDITCARD) {
			$("#capture_title").text("Please capture Credit Card");
			thumbnail_image.src = "../images/creditcard_capture.svg";
		} else if (currentModule == Module.PASSPORT) {
			$("#capture_title").text("Please capture Passport");
			thumbnail_image.src = "../images/billpay_capture.svg";
		} else if (currentModule == Module.BILLPAY) {
			$("#capture_title").text("Please capture Bill");
			thumbnail_image.src = "../images/billpay_capture.svg";
		}

		$("#thumbnail").click(function () {
			isRetakeCalled = false;
			doCapture();
		});

		$("#extracton_settings_button").click(function () {
			$.mobile.navigate("./ExtractionSettings.html", {
				transition: "none",
			});
		});

		if (carousel.repeat) {
			$(".thumbnailscreenbody").hide();
			$.mobile.navigate("./Swipe.html", { transition: "none" });
			carousel.repeat = false;
		} else {
			$(".thumbnailscreenbody").show();
		}
	};

	var initializePreviewScreenEvents = function () {
		var imgFrontElement = document.getElementById("ID_IMAGE_DIV");
		imgFrontElement.style.width = parseInt($(window).width()) + "px";
		imgFrontElement.style.height = parseInt($(window).height()) + "px";

		imgFrontElement.style.backgroundColor = "white";

		$("#ID_MORE").click(function (e) {
			handleMoreClickOnExtractionError();
		});

		$("#cancel").click(function () {
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				HiddenSelfieModule.stopCamera();
			}
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});

		if (frontCapturedImage || backCapturedImage || selfieCapturedImage) {
			var image = null;
			if (
				selfieCapturedImage &&
				capturedSide === CAPTURESIDE.CAPTURE_SELFIE
			) {
				image = selfieCapturedImage;
			} else if (
				frontCapturedImage &&
				!backCapturedImage &&
				capturedSide == CAPTURESIDE.CAPTURE_BACK
			) {
				//Select captureBack and clicks on Back button
				image = frontCapturedImage;
				capturedSide = CAPTURESIDE.CAPTURE_FRONT;
			} else {
				//Normal Flow
				image =
					capturedSide == CAPTURESIDE.CAPTURE_FRONT
						? frontCapturedImage
						: backCapturedImage;
			}
			if (
				(CaptureModule.isAutoCaptureSupported &&
					cameraOptions.isUseAdvcanceCapture &&
					capturedSide !== CAPTURESIDE.CAPTURE_SELFIE) ||
				(SelfieCaptureModule.isSelfieCaptureSupported &&
					SelfieCaptureModule.selfieCameraOptions.videoStream &&
					capturedSide === CAPTURESIDE.CAPTURE_SELFIE)
			) {
				ReviewModule.showReviewControl(
					"ID_IMAGE_DIV",
					image,
					ReviewModule.reviewOptions,
					function () {
						CheckForCaptureBackOrExtractData();
						// Accept call back
					},
					function () {
						// Retake call back
						isRetakeCalled = true;
						window.history.go(-1);
						if (capturedSide === CAPTURESIDE.CAPTURE_FRONT) {
							frontCapturedImage = null;
						} else if (capturedSide === CAPTURESIDE.CAPTURE_BACK) {
							backCapturedImage = null;
						} else if (
							capturedSide === CAPTURESIDE.CAPTURE_SELFIE
						) {
							selfieCapturedImage = null;
						}
					}
				);
			} else {
				CheckForCaptureBackOrExtractData();
			}
		} else {
			if (capturedSide === CAPTURESIDE.CAPTURE_BACK) {
				capturedSide = CAPTURESIDE.CAPTURE_FRONT;
			}
			window.history.go(-1);
		}
	};

	var initializeSelfiePreviewScreenEvents = function () {
		var imgFrontElement = document.getElementById("ID_IMAGE_DIV");
		imgFrontElement.style.width = parseInt($(window).width()) + "px";
		imgFrontElement.style.height = parseInt($(window).height()) + "px";

		imgFrontElement.style.backgroundColor = "white";
		if (selfieCapturedImage) {
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			SelfieModule.currentRequest = SelfieRequest.ORIGINAL;
			SelfieModule.performSelfieExtraction(selfieCapturedImage);
			$("#ID_MORE").click(function (e) {
				handleMoreClickOnExtractionError();
			});
		} else {
			window.history.go(-1);
		}

		$("#cancel").click(function () {
			currentModule = Module.MOBILEID;
			if (
				SelfieCaptureModule.selfieCameraOptions.videoStream &&
				SelfieCaptureModule.hiddenCapture
			) {
				HiddenSelfieModule.startCamera();
			}
			window.history.go(-($.mobile.navigate.history.stack.length - 1));
		});
	};

	var CheckForCaptureBackOrExtractData = function () {
		var imgFrontElement = document.getElementById("ID_IMAGE_DIV");
		if (capturedSide === CAPTURESIDE.CAPTURE_SELFIE) {
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			SelfieModule.currentRequest = SelfieRequest.ORIGINAL;
			SelfieModule.performSelfieExtraction(selfieCapturedImage);
			selfieCapturedImage = null;
		} else if (currentModule == Module.MOBILEID) {
			if (!backCapturedImage && !isOnBoardingFlow) {
				popupCaptureOptions();
			} else {
				imgFrontElement.style.backgroundColor = "white";
				Utils.showLoadingIndicator();
				MobileIDModule.extractData(
					frontCapturedImage,
					backCapturedImage,
					isOnBoardingFlow,
					region
				);
				frontCapturedImage = null;
				backCapturedImage = null;
			}
		} else if (currentModule == Module.CHECK) {
			if (!backCapturedImage && !isOnBoardingFlow) {
				popupCaptureOptions();
			} else {
				imgFrontElement.style.backgroundColor = "white";
				Utils.showLoadingIndicator();
				CheckDepositModule.extractData(
					frontCapturedImage,
					backCapturedImage,
					isOnBoardingFlow,
					region
				);
				frontCapturedImage = null;
				backCapturedImage = null;
			}
		} else if (currentModule == Module.CREDITCARD) {
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			CreditCardModule.extractData(frontCapturedImage, isOnBoardingFlow);
			frontCapturedImage = null;
			backCapturedImage = null;
		} else if (currentModule == Module.PASSPORT) {
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			PassportModule.extractData(frontCapturedImage, isOnBoardingFlow);
			frontCapturedImage = null;
			backCapturedImage = null;
		} else if (currentModule == Module.BILLPAY) {
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			BillPayModule.extractData(frontCapturedImage, isOnBoardingFlow);
			frontCapturedImage = null;
			backCapturedImage = null;
		}
	};

	var popupCaptureOptions = function () {
		var imgFrontElement = document.getElementById("ID_IMAGE_DIV");
		$("#capture_popupalert").popup("open");

		$("#back_capture").click(function () {
			capturedSide = CAPTURESIDE.CAPTURE_BACK;
			doCapture();
		});

		$("#skip").click(function () {
			$("#capture_popupalert").hide();
			imgFrontElement.style.backgroundColor = "white";
			Utils.showLoadingIndicator();
			if (currentModule == Module.MOBILEID) {
				MobileIDModule.extractData(
					frontCapturedImage,
					backCapturedImage,
					isOnBoardingFlow,
					region
				);
			} else if (currentModule == Module.CHECK) {
				CheckDepositModule.extractData(
					frontCapturedImage,
					backCapturedImage,
					isOnBoardingFlow,
					region
				);
			}
			frontCapturedImage = null;
		});
	};

	var handleMoreClickOnExtractionError = function () {
		var errorMsg = "";
		try {
			var parsedObject = JSON.parse(AppModule.extractionErrorMessage);
			if (parsedObject.Message != undefined) {
				errorMsg = parsedObject.Message;
			} else {
				errorMsg = parsedObject.message;
			}
		} catch (e) {
			errorMsg = AppModule.extractionErrorMessage;
		}
		var moreTextElement = document.getElementById("ID_MORETEXT");
		moreTextElement.innerHTML = errorMsg;
		var h = $("#ID_MORETEXT")[0].scrollHeight;

		var h1 = parseInt(
			document.getElementById("ID_EXTRACTIONERRORPOPUP").clientHeight
		);
		var marginTop = (parseInt($(window).height()) - h1) / 2;

		var height = parseInt($(window).height()) - marginTop;

		if (parseInt(h) > height) {
			h = height;
		}

		if (parseInt(h) < 60) {
			h = 60;
		}
		$("#ID_MORETEXT").animate({
			height: h,
		});

		$("#ID_EXTRACTIONERRORPOPUP").popup("reposition", {
			positionTo: "window",
		});

		var w1 = parseInt(
			document.getElementById("ID_EXTRACTIONERRORPOPUP").clientWidth
		);
		var marginLeft = (parseInt($(window).width()) - w1) / 2;
		document.getElementById("ID_EXTRACTIONERRORPOPUP-popup").style.left =
			marginLeft + "px";
		document.getElementById("ID_EXTRACTIONERRORPOPUP-popup").style.width =
			w1 + "px";

		if (h == height) {
			document.getElementById("ID_EXTRACTIONERRORPOPUP-popup").style.top =
				(parseInt($(window).height()) -
					parseInt(
						document.getElementById("ID_EXTRACTIONERRORPOPUP")
							.clientHeight
					)) /
					2 +
				"px";
		}

		$("#ID_MORE").hide();
	};

	var doAdvancedCapture = function () {
		if (currentModule == Module.MOBILEID) {
			currentCameraOptions = CaptureModule.mobileIdCameraOptions;
			currentCaptureOptions = CaptureModule.mobileIdCaptureOptions;

			currentCaptureOptions.framePadding = defaultPaddingPercent;
			currentCaptureOptions.frameAspectRatio = defaultMobileIdAspectRatio;
			if (capturedSide != CAPTURESIDE.CAPTURE_FRONT) {
				currentCaptureOptions.lookAndFeel.documentSample =
					"../images/demo_dl_back.svg";
				currentCaptureOptions.enableFlashCapture = false;
			} else {
				currentCaptureOptions.lookAndFeel.documentSample = true;
				currentCaptureOptions.enableFlashCapture =
					cameraOptions.enableFlashCapture === "ON" &&
					MobileIDModule.serverSettingsOptions.idAuthentication ===
						"ON"
						? true
						: false;
			}
		} else if (currentModule == Module.CHECK) {
			currentCameraOptions = CaptureModule.checkDepositCameraOptions;
			currentCaptureOptions = CaptureModule.checkDepositCaptureOptions;
			currentCaptureOptions.lookAndFeel.documentSample =
				capturedSide == CAPTURESIDE.CAPTURE_FRONT
					? "../images/demo_check_front.svg"
					: "../images/demo_check_back.svg";
		} else if (currentModule == Module.CREDITCARD) {
			currentCameraOptions = CaptureModule.creditCardCameraOptions;
			currentCaptureOptions = CaptureModule.creditCardCaptureOptions;
		} else if (currentModule == Module.PASSPORT) {
			currentCameraOptions = CaptureModule.passportCameraOptions;
			currentCaptureOptions = CaptureModule.passportCaptureOptions;
		} else if (currentModule == Module.BILLPAY) {
			currentCameraOptions = CaptureModule.payBillCameraOptions;
			currentCaptureOptions = CaptureModule.payBillCaptureOptions;
		}
		currentCameraOptions.containerId = "ID_CAMERA_DIV";
		currentCameraOptions.useVideoStream =
			cameraOptions.isUseAdvcanceCapture;
		currentCameraOptions.preference = cameraOptions.isUseAdvcanceCapture
			? "camera"
			: "gallery";
		currentCameraOptions.resolution = cameraOptions.resolution;
		currentCameraOptions.downscaleSize = cameraOptions.downscaleSize;
		currentCaptureOptions.useVideoStream =
			cameraOptions.isUseAdvcanceCapture;
		currentCaptureOptions.preference = cameraOptions.isUseAdvcanceCapture
			? "camera"
			: "gallery";
		currentCaptureOptions.resolution = cameraOptions.resolution;
		currentCaptureOptions.downscaleSize = cameraOptions.downscaleSize;
		currentCaptureOptions.lookAndFeel.showTapToDismissMessage =
			cameraOptions.showTapToDismissMessage;
		currentCaptureOptions.drawInstructionsAsText = cameraOptions.drawInstructionsAsText;
		currentCaptureOptions.tapToDismissInstruction.orientation = cameraOptions.orientation;
		currentCaptureOptions.instructionsAsTextOrientation = cameraOptions.orientation;
		currentCaptureOptions.guidanceOrientation = cameraOptions.orientation;
		
		CaptureModule.performAdvancedCapture(
			currentCameraOptions,
			currentCaptureOptions,
			function (imageData, flashImageData) {
				capturedSide == CAPTURESIDE.CAPTURE_FRONT
					? (frontCapturedImage = imageData)
					: (backCapturedImage = imageData);
				if (
					currentModule == Module.MOBILEID &&
					capturedSide == CAPTURESIDE.CAPTURE_FRONT &&
					cameraOptions.enableFlashCapture === "ON"
				) {
					flashImage = flashImageData;
				}
				$.mobile.navigate("./PreviewScreen.html", {
					transition: "none",
				});
			},
			function (doCaptureError) {
				bootbox.alert(
					"Do Advanced capture error is, " + doCaptureError
				);
			}
		);
	};

	var doStandardCapture = function (containerId) {
		if (currentModule == Module.MOBILEID) {
			currentCameraOptions = CaptureModule.mobileIdCameraOptions;
		} else if (currentModule == Module.CHECK) {
			currentCameraOptions = CaptureModule.checkDepositCameraOptions;
		} else if (currentModule == Module.CREDITCARD) {
			currentCameraOptions = CaptureModule.creditCardCameraOptions;
		} else if (currentModule == Module.PASSPORT) {
			currentCameraOptions = CaptureModule.passportCameraOptions;
		} else if (currentModule == Module.BILLPAY) {
			currentCameraOptions = CaptureModule.payBillCameraOptions;
		}
		currentCameraOptions.containerId = containerId;
		currentCameraOptions.downscaleSize = cameraOptions.downscaleSize;
		currentCameraOptions.useVideoStream = false;
		CaptureModule.performStandardCapture(
			currentCameraOptions,
			function (imageData) {
				if (capturedSide == CAPTURESIDE.CAPTURE_BACK) {
					$("#capture_popupalert").popup("close");
				}
				capturedSide == CAPTURESIDE.CAPTURE_FRONT
					? (frontCapturedImage = imageData)
					: (backCapturedImage = imageData);
				Utils.hideLoadingIndicator();
				if (currentpage == "previewscreen") {
					initializePreviewScreenEvents();
				} else {
					$.mobile.navigate("./PreviewScreen.html", {
						transition: "none",
					});
				}
			},
			function (doCaptureError) {
				if (capturedSide == CAPTURESIDE.CAPTURE_BACK) {
					$("#capture_popupalert").popup("close");
				}
				Utils.hideLoadingIndicator();
			}
		);
	};

	//Here we stop the capture before moving from capture screen
	var stopCapture = function () {
		CaptureModule.stopCapture(
			function (stopSuccess) {
				CaptureModule.destroy();
			},
			function (error) {
				if (error.code == 0) {
					// It indicates a state error  has occured , which the application developer needs to handle
					if (
						error.message ==
						"Call stopCapture is not allowed in state STATE_CREATED"
					) {
						CaptureModule.destroy();
					} else {
						//alert("Stop capture  error "+JSON.stringify(error.message));
					}
				} else {
					bootbox.alert(
						"Stop capture  error " + JSON.stringify(error.message)
					);
				}
			}
		);
	};

	//Here we stop the capture before moving from capture screen
	var stopSelfieCapture = function () {
		SelfieCaptureModule.stopCapture(
			function (stopSuccess) {
				SelfieCaptureModule.destroy();
			},
			function (error) {
				if (error.code == 0) {
					// It indicates a state error  has occured , which the application developer needs to handle
					if (
						error.message ==
						"Call selfie stopCapture is not allowed in state STATE_CREATED"
					) {
						CaptureModule.destroy();
					} else {
						//alert("Stop capture  error "+JSON.stringify(error.message));
					}
				} else {
					bootbox.alert(
						"Stop selfie capture  error " +
							JSON.stringify(error.message)
					);
				}
			}
		);
	};

	var onHomeScreen = function () {
		resetOptions();
	};

	var onInfo1Screen = function () {
		$("#checkbox-mini-0").click(function () {
			if ($("#checkbox-mini-0").is(":checked")) {
				document.getElementById("process").style.color = "#ffffff";
				document.getElementById("process").style.backgroundColor =
					"#00b3b3";
			} else {
				document.getElementById("process").style.color = "#000000";
				document.getElementById("process").style.backgroundColor =
					"#bbbbbb";
			}
		});
		$("#process").click(function () {
			if ($("#checkbox-mini-0").is(":checked")) {
				$.mobile.navigate("./UserInformation.html", {
					transition: "none",
				});
			}
		});
	};

	var onInfo2Screen = function () {
		extractionInformation =
			NewAccountModule.defaultStructureForExtractionResults();

		$("#autofill").click(function () {
			currentModule = Module.MOBILEID;
			idorpassport = Module.MOBILEID;
			doCapture();
		});
		$("#passport").click(function () {
			currentModule = Module.PASSPORT;
			idorpassport = Module.PASSPORT;
			doCapture();
		});
		$("#manualfill").click(function () {
			currentModule = null;
			$.mobile.navigate("./EntryForm1.html", { transition: "none" });
		});

		if (carousel.repeat) {
			$(".info2body").hide();
			$.mobile.navigate("./Swipe.html", { transition: "none" });
			carousel.repeat = false;
		} else {
			$(".info2body").show();
		}
	};

	var onCaptureScreen = function () {
		if (currentModule == null) {
			currentModule = idorpassport;
		}
		if (
			CaptureModule.isAutoCaptureSupported &&
			cameraOptions.isUseAdvcanceCapture
		) {
			doAdvancedCapture();
		}
	};

	var onSelfieCaptureScreen = function () {
		if (currentModule == null) {
			currentModule = Module.SELFIE;
		}
		if (
			SelfieCaptureModule.isSelfieCaptureSupported &&
			SelfieCaptureModule.selfieCameraOptions.videoStream
		) {
			doSelfieAdvancedCapture();
		}
	};

	var cdRegionSelectionScreen = function () {
		initializeAppStats();
		// locate your element and add the Click Event Listener
		document
			.getElementById("parentlist")
			.addEventListener("click", function (e) {
				// e.target is our targetted element.
				console.log(e.target.nodeName);
				if (
					(e.target && e.target.nodeName == "DIV") ||
					(e.target && e.target.nodeName == "LI")
				) {
					region = e.target.getAttribute("data-countryid");
					$("#mypopupalert").popup("open");
				}
			});

		$("#footer").click(function () {
			var amount = document.getElementById("check_amount_popup").value;

			if (amount.length == 0) {
				$("#mypopupalert").popup("close");
				bootbox.alert("Amount field should not be empty or invalid");
			} else {
				$("#mypopupalert").popup("close");
				//Added below delay to close the current popup dialog before open the camera.
				setTimeout(function () {
					doCapture();
				}, 100);
			}
		});

		$("#extracton_settings_button").click(function () {
			$.mobile.navigate("./ExtractionSettings.html", {
				transition: "none",
			});
		});

		if (carousel.repeat) {
			$(".regionscreenbody").hide();
			$.mobile.navigate("./Swipe.html", { transition: "none" });
			carousel.repeat = false;
		} else {
			$(".regionscreenbody").show();
		}
	};

	var regionSelectionScreen = function () {
		initializeAppStats();
		// locate your element and add the Click Event Listener
		document
			.getElementById("parentlist")
			.addEventListener("click", function (e) {
				if (currentModule == Module.MOBILEID) {
					region = e.target.innerText;
					RegionModule.showCountriesForRegion();
				} else {
					doCapture();
				}
			});

		RegionModule.initializeCountrySelectionEvents();

		$("#extracton_settings_button").click(function () {
			$.mobile.navigate("./ExtractionSettings.html", {
				transition: "none",
			});
		});

		if (carousel.repeat) {
			$(".regionscreenbody").hide();
			$.mobile.navigate("./Swipe.html", { transition: "none" });
			carousel.repeat = false;
		} else {
			$(".regionscreenbody").show();
		}
	};

	var onResidencyScreen = function () {
		$("#billpay").click(function () {
			currentModule = Module.BILLPAY;
			if (
				CaptureModule.isAutoCaptureSupported &&
				cameraOptions.isUseAdvcanceCapture
			) {
				$.mobile.navigate("./Capture.html", { transition: "none" });
			} else {
				doStandardCapture("frontscreen_front_show");
			}
		});

		if (carousel.repeat) {
			$(".residencyscreenbody").hide();
			$.mobile.navigate("./Swipe.html", { transition: "none" });
			carousel.repeat = false;
		} else {
			$(".residencyscreenbody").show();
		}
	};

	var CheckResultFields = function () {
		$("#head").text("Check Details");
		$("#check_details").show();
		$("#credit_card_details").hide();
	};

	var creditCardResultFields = function () {
		$("#head").text("Card Details");
		$("#check_details").hide();
		$("#credit_card_details").show();
	};

	var initializeHomeScreenEvents = function () {
		isOnBoardingFlow = true;
		currentComponent = null;
		$("#back").hide();

		//Adding the click event for Mobile ID button HomeScreen
		$("#homescreen_mobileid_div1").click(function (event) {
			event.preventDefault();
			isOnBoardingFlow = false;
			currentModule = Module.MOBILEID;
			$.mobile.navigate("./Region.html", { transition: "none" });
		});

		//Adding the click event for Check Deposit button in HomeScreen
		$("#homescreen_checkdeposit_div1").click(function (event) {
			event.preventDefault();
			isOnBoardingFlow = false;
			currentModule = Module.CHECK;
			$.mobile.navigate("./CDRegion.html", { transition: "none" });
		});

		//Adding the click event for Bill Pay button in HomeScreen
		$("#homescreen_billpay_div1").click(function (event) {
			event.preventDefault();
			isOnBoardingFlow = false;
			currentModule = Module.BILLPAY;
			$.mobile.navigate("./ThumbnailScreen.html", { transition: "none" });
		});
		//Adding the click event for Bill Pay button in HomeScreen
		$("#homescreen_creditcard_div1").click(function (event) {
			event.preventDefault();
			isOnBoardingFlow = false;
			currentModule = Module.CREDITCARD;
			$.mobile.navigate("./ThumbnailScreen.html", { transition: "none" });
		});
		$("#homescreen_passport_div1").click(function (event) {
			event.preventDefault();
			isOnBoardingFlow = false;
			currentModule = Module.PASSPORT;

			$.mobile.navigate("./ThumbnailScreen.html", { transition: "none" });
		});
	};

	// Sets the default or already set values for Camera Settings
	var initializeGlobalSettingsScreenEvents = function () {
		if (cameraOptions.isUseAdvcanceCapture === true) {
			$("#advanceCapture").val("true").selectmenu("refresh");
		}
		$("#sdkVersions").text("SDK Version:  " + KfxWebSDK.version);
		$("#appVersion").text("App Version:  " + APP_VERSION);
		$("#appstatsurl").val(AppStatsModule.appStatsOptions.AppStatsServerURL);

		$("#appstatsenabled")
			.val("" + AppStatsModule.appStatsOptions.AppStatsEnabled)
			.selectmenu("refresh");

		$("#CaptureInstruction")
			.val("" + showcaptureinstruction)
			.selectmenu("refresh");
		$("#downscalesize").val("" + cameraOptions.downscaleSize);
		$("#showtaptodismissmessage")
			.val(cameraOptions.showTapToDismissMessage ? "true" : "false")
			.selectmenu("refresh");
		$("#orientation")
			.val(
				cameraOptions.orientation == KfxWebSDK.orientation.LANDSCAPE
					? "LANDSCAPE"
					: "PORTRAIT")
					.selectmenu("refresh");
		$("#advanceCapture").change(function () {
			if ($("#advanceCapture").val() === "true") {
				$("[id=resolutionLi]").show();
				$("[id=showtaptodismissmessageLi]").show();
				$("[id=orientationLi]").show();
				$("[id=drawInstAsTextli]").show();
			} else {
				$("[id=resolutionLi]").hide();
				$("[id=showtaptodismissmessageLi]").hide();
				$("[id=orientationLi]").hide();
			    $("[id=drawInstAsTextli]").hide();

			}
		});
	};

	var hideAdvanceCapture = function (lessThaniOS11) {
		if (lessThaniOS11) {
			//Hide advance capture switch in iOS11 below as advance capture is not supported
			$("[id=advancecaptureLi]").hide();
			$("[id=resolutionLi]").hide();
			$("[id=showtaptodismissmessageLi]").hide();
			$("[id=orientationLi]").hide();
			$("[id=drawInstAsTextli]").hide();
		} else {
			$("#advanceCapture")
				.val("" + cameraOptions.isUseAdvcanceCapture)
				.selectmenu("refresh");
			$("#resolution")
				.val(
					cameraOptions.resolution == KfxWebSDK.resolution.RES_FULL_HD
						? "Full HD"
						: "4K"
				)
				.selectmenu("refresh");
			if (cameraOptions.isUseAdvcanceCapture === false) {
				$("[id=resolutionLi]").hide();
				$("[id=showtaptodismissmessageLi]").hide();
				$("[id=orientationLi]").hide();
				$("[id=drawInstAsTextli]").hide();
			}
		}
	};

	// Saves the changes made for Camera Settings
	var saveGlobalSettings = function () {
		cameraOptions.downscaleSize = parseInt($("#downscalesize").val());
		cameraOptions.isUseAdvcanceCapture =
			$("#advanceCapture").val() == "true" ? true : false;
		cameraOptions.showTapToDismissMessage =
			$("#showtaptodismissmessage").val() == "true" ? true : false;
			cameraOptions.drawInstructionsAsText =  $("#drawInstAsText").val() == "true" ? true : false;
		cameraOptions.resolution =
			$("#resolution").val() == "Full HD"
				? KfxWebSDK.resolution.RES_FULL_HD
				: KfxWebSDK.resolution.RES_4K;
		cameraOptions.orientation =
			$("#orientation").val() == "LANDSCAPE" 
			? KfxWebSDK.orientation.LANDSCAPE 
			: KfxWebSDK.orientation.PORTRAIT;
		cameraOptions.isUseSelfieCapture = $("#selfieAdvanceCapture").val();
		cameraOptions.isHiddenCapture = $("#hiddenCapture").val();
		showcaptureinstruction =
			$("#CaptureInstruction").val() == "true" ? true : false;
		AppStatsModule.appStatsOptions.AppStatsEnabled =
			$("#appstatsenabled").val() == "true" ? true : false;
		AppStatsModule.appStatsOptions.AppStatsServerURL =
			$("#appstatsurl").val();
		initAppStats();
	};

	var globalSettingsScreen = function () {
		initializeGlobalSettingsScreenEvents();
	};

	var doCapture = function () {
		if (
			showcaptureinstruction &&
			!isRetakeCalled &&
			capturedSide == CAPTURESIDE.CAPTURE_FRONT
		) {
			$.mobile.navigate("./Swipe.html", { transition: "none" });
		} else {
			isRetakeCalled = false;
			if (
				CaptureModule.isAutoCaptureSupported &&
				cameraOptions.isUseAdvcanceCapture
			) {
				if (capturedSide == CAPTURESIDE.CAPTURE_BACK) {
					$("#capture_popupalert").hide();
				}
				$.mobile.navigate("./Capture.html", { transition: "none" });
			} else {
				doStandardCapture("frontscreen_front_show");
			}
		}
	};

	var doSelfieCapture = function () {
		capturedSide = CAPTURESIDE.CAPTURE_SELFIE;
		if (
			SelfieCaptureModule.isSelfieCaptureSupported &&
			SelfieCaptureModule.selfieCameraOptions.videoStream
		) {
			$.mobile.navigate("./SelfieCapture.html", { transition: "none" });
		} else {
			doSelfieStandardCapture("extractionresultsdisplayscreen_submit");
		}
	};

	var doSelfieAdvancedCapture = function () {
		SelfieCaptureModule.selfieCameraOptions.containerId =
			"ID_SELFIE_CAMERA_DIV";
		currentCaptureOptions = SelfieCaptureModule.selfieCaptureOptions;
		currentCameraOptions = SelfieCaptureModule.selfieCameraOptions;
		SelfieCaptureModule.performAdvancedCapture(
			currentCameraOptions,
			currentCaptureOptions,
			function (closeSelfieImageData, farSelfieImageData) {
				selfieCapturedImage = closeSelfieImageData;
				if (
					SelfieCaptureModule.selfieCaptureOptions
						.enableAutoCapture === false &&
					SelfieCaptureModule.hiddenCapture
				) {
					SelfieModule.snap1 =
						Utils.convertImageDataToBase64(farSelfieImageData);
				}
				$.mobile.navigate("./PreviewScreen.html", {
					transition: "none",
				});
			},
			function (doCaptureError) {
				bootbox.alert(
					"Do Selfie Advanced capture error is, " + doCaptureError
				);
			}
		);
	};

	var doSelfieStandardCapture = function (containerId) {
		SelfieCaptureModule.selfieCameraOptions.containerId = containerId;
		currentCameraOptions = SelfieCaptureModule.selfieCameraOptions;
		currentCameraOptions.useVideoStream = false;
		SelfieCaptureModule.performStandardCapture(
			currentCameraOptions,
			function (imageData) {
				if (capturedSide == CAPTURESIDE.CAPTURE_BACK) {
					$("#capture_popupalert").popup("close");
				}
				selfieCapturedImage = imageData;
				Utils.hideLoadingIndicator();
				if (currentpage == "previewscreen") {
					initializePreviewScreenEvents();
				} else {
					$.mobile.navigate("./PreviewScreen.html", {
						transition: "none",
					});
				}
			},
			function (doCaptureError) {
				if (capturedSide == CAPTURESIDE.CAPTURE_BACK) {
					$("#capture_popupalert").popup("close");
				}
				Utils.hideLoadingIndicator();
			}
		);
	};

	var initializeServerSettingsScreenEvents = function () {
		if (currentModule == Module.BILLPAY) {
			BillPayModule.initializeServerSettingsScreenEvents();
		} else if (currentModule == Module.PASSPORT) {
			PassportModule.initializeServerSettingsScreenEvents();
		} else if (currentModule == Module.CHECK) {
			CheckDepositModule.initializeServerSettingsScreenEvents();
		} else if (currentModule == Module.MOBILEID) {
			MobileIDModule.initializeServerSettingsScreenEvents();
		} else if (currentModule == Module.CREDITCARD) {
			CreditCardModule.initializeServerSettingsScreenEvents();
		}
	};

	var saveServerSettings = function () {
		if (currentModule == Module.BILLPAY) {
			BillPayModule.saveServerSettings();
		} else if (currentModule == Module.PASSPORT) {
			PassportModule.saveServerSettings();
		} else if (currentModule == Module.CHECK) {
			CheckDepositModule.saveServerSettings();
		} else if (currentModule == Module.MOBILEID) {
			MobileIDModule.saveServerSettings();
		} else if (currentModule == Module.CREDITCARD) {
			CreditCardModule.saveServerSettings();
		}
	};

	var saveExtractionResults = function () {
		NewAccountModule.saveExtractionResults();
	};
	var saveCommunicationAddress = function () {
		NewAccountModule.saveCommunicationAddress();
	};

	var saveContactInformation = function () {
		NewAccountModule.saveContactInformation();
	};

	var resetOptions = function () {
		frontCapturedImage = null;
		flashImage = null;
		backCapturedImage = null;
		currentModule = null;
		capturedSide = 0;
		isRetakeCalled = false;
		extractionInformation =
			NewAccountModule.defaultStructureForExtractionResults();
	};

	/*************************** Start APPSTATS Code***************************/
	var initAppStats = function () {
		if (AppStatsModule.appStatsOptions.AppStatsEnabled) {
			AppStatsModule.initAppStats();
		}
	};

	var initializeAppStats = function () {
		if (AppStatsModule.appStatsOptions.AppStatsEnabled) {
			AppStatsModule.startAppStats(
				function (startAppStatsSuccess) {
					console.log(startAppStatsSuccess);
				},
				function (startAppStatsError) {
					console.log(startAppStatsError);
				}
			);
			if (rttiSessionKey == null || !rttiSessionKey) {
				rttiSessionKey = Utils.guid();
			}

			AppStatsModule.beginAppStatsSession(
				rttiSessionKey,
				Utils.getCurrentModuleName(),
				function (success) {
					console.log("beginAppStatsSession " + success);
				},
				function (error) {
					console.log("beginAppStatsSession " + error);
				}
			);
		}
	};

	var appStatsResume = function () {
		rttiSessionKey = null;
		if (
			AppStatsModule.appStatsOptions.AppStatsEnabled &&
			AppStatsModule.isAppstatsRecording()
		) {
			AppStatsModule.endAppStatsSession(
				true,
				"",
				function (dataSuccess) {
					AppStatsModule.stopAppStats(
						function (stopSuccess) {
							console.log(stopSuccess);
							AppStatsModule.exportAppstats(
								function (exportSuccess) {
									console.log(exportSuccess);
								},
								function (exportError) {
									console.log(exportError);
								}
							);
						},
						function (stopError) {
							console.log(stopError);
						}
					);
				},
				function (dataError) {
					console.log(dataError);
				}
			);
		}
	};

	/*************************** End APPSTATS Code***************************/

	return {
		extractionErrorMessage: extractionErrorMessage,
		doStandardCapture: doStandardCapture,
		capturedSide: capturedSide,
		doCapture: doCapture,
		doSelfieCapture: doSelfieCapture,
		selfieBackPressed: selfieBackPressed,
	};
})();
