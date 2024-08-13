var defaultCheckAspectRatio = 0.46;
var defaultMobileIdAspectRatio = 0.629;
var defaultPassportAspectRatio = 0.703;
var defaultCreditCardAspectRatio = 0.623;
var defaultPayBillAspectRatio = 0.615;

/**** Default settings for capture experience ****/
var defaultDocumentSampleTimeout = 6;
var defaulticonTransparency = 0.5;
var defaultTapToDismissInstructionVisible = true;
var	defaultTapToDismissInstructionText = "Tap to Dismiss";
var defaultTapToDismissInstructionOrientation = "LANDSCAPE";
var	defaultFitDocumentInstructionVisible = true;
var defaultZoomInInstructionVisible = true;
var defaultZoomOutInstructionVisible = true;
var defaultCenterDocumentInstructionVisible = true;
var defaultRotateDeviceInstructionVisible = true;
var defaultHoldDeviceLevelInstructionVisible = true;
var defaultHoldSteadyInstructionVisible = true;
var defaultDoneInstructionVisible = true;
var defaultMotionPermissionInstructionVisible = false;
var defaultMotionPermissionInstructionText = "Tap to give device motion and orientation access";
var defaultTargetFrameBackground = "";
var defaultTargetFrameSuccessBackground = "";
var	defaultEnableAutoCapture = true;
var defaultCapturePauseInstructionVisible = true;
var defaultCapturePauseText = "Capture is Paused. Tap to Continue.";
var defaultFitDocumentInstructionText = "Fit document in the frame";
var defaultZoomInInstructionText = "Move closer";
var defaultZoomOutInstructionText = "Move back";
var defaultCenterDocumentInstructionText = "Center the document";
var defaultRotateDeviceInstructionText = "Rotate device";
var defaultHoldDeviceLevelInstructionText = "Hold device level";
var defaultHoldSteadyInstructionText = "Hold steady";
var defaultDoneInstructionText = "Done";
var defaultMotionPermissionInstructionText =
  "Tap to give device motion and orientation access";
var defaultCapturePauseInstruction = "Capture is Paused. Tap to Continue.";
var defaultFitDocumentInstructionAccessibilityText = "Fit document in the frame" ;
var defaultZoomInInstructionAccessibilityText = "Move closer" ;
var defaultZoomOutInstructionAccessibilityText = "Move back" ; 
 var defaultCenterDocumentInstructionAccessibilityText  = "Center the document"
var defaultRotateDeviceInstructionAccessibilityText = "Rotate device"
var defaultHoldDeviceLevelInstructionAccessibilityText =  "Hold device level"
var defaultHoldSteadyInstructionAccessibilityText = "Hold steady"
var defaultDoneInstructionAccessibilityText = "Done"
var defaultMotionPermissionInstructionAccessibilityText =  "Tap to give device motion and orientation access"
var defaultCapturePauseInstructionAccessibilityText = "Capture is Paused. Tap to Continue."
var defaultTapToDismissInstructionAccessibilityText = "Tap To Dismiss"

var defaultPaddingPercent = 14;

var CaptureModule = (function () {
	var checkDepositCameraOptions = null,
		checkDepositCaptureOptions = null;
	var mobileIdCameraOptions = null,
		mobileIdCaptureOptions = null;
	var passportCameraOptions = null,
		passportCaptureOptions = null;
	var creditCardCameraOptions = null,
		creditCardCaptureOptions = null;
	var payBillCameraOptions = null,
		payBillCaptureOptions = null;
	var isAutoCaptureSupported = false;
	var is4KResolutionSupported = false;

	var setDefaultOptions = function () {
		checkDepositCameraOptions = {
			containerId: "",
			preference: "gallery",
			useVideoStream: false,
		};
		mobileIdCameraOptions = {
			containerId: "",
			preference: "gallery",
			useVideoStream: false,
		};
		passportCameraOptions = {
			containerId: "",
			preference: "gallery",
			useVideoStream: false,
		};
		creditCardCameraOptions = {
			containerId: "",
			preference: "gallery",
			useVideoStream: false,
		};
		payBillCameraOptions = {
			containerId: "",
			preference: "gallery",
			useVideoStream: false,
		};

		KfxWebSDK.Capture.getDefaultOptions(
			function (defaultOptions) {
				checkDepositCaptureOptions = jQuery.extend(
					true,
					{},
					defaultOptions
				);
				mobileIdCaptureOptions = jQuery.extend(
					true,
					{},
					defaultOptions
				);
				passportCaptureOptions = jQuery.extend(
					true,
					{},
					defaultOptions
				);
				creditCardCaptureOptions = jQuery.extend(
					true,
					{},
					defaultOptions
				);
				payBillCaptureOptions = jQuery.extend(true, {}, defaultOptions);

				mobileIdCaptureOptions.enableDeviceMotionInstruction = true;
				passportCaptureOptions.enableDeviceMotionInstruction = true;
				creditCardCaptureOptions.enableDeviceMotionInstruction = true;
				payBillCaptureOptions.enableDeviceMotionInstruction = true;
				checkDepositCaptureOptions.enableDeviceMotionInstruction = true;

				// Set 10 to see 'Tap to Dismiss' message (check is ok with 5 value)
				mobileIdCaptureOptions.framePadding = defaultPaddingPercent;
				passportCaptureOptions.framePadding = defaultPaddingPercent;
				creditCardCaptureOptions.framePadding = defaultPaddingPercent;
				payBillCaptureOptions.framePadding = defaultPaddingPercent;
				payBillCaptureOptions.criteria.longAxisThreshold = 70;
				payBillCaptureOptions.criteria.maxFillFraction = 2.0;
				// Modify the default settings according to the module selected #756148
				checkDepositCaptureOptions.frameAspectRatio =
					defaultCheckAspectRatio; //aspect ratio as like native KMD
				mobileIdCaptureOptions.frameAspectRatio =
					defaultMobileIdAspectRatio;
				passportCaptureOptions.frameAspectRatio =
					defaultPassportAspectRatio;
				payBillCaptureOptions.frameAspectRatio =
					defaultPayBillAspectRatio;
				// Modify the default settings for creditcard
				creditCardCaptureOptions.frameAspectRatio =
					defaultCreditCardAspectRatio;

				//Modify SkewAngleTolerance to 90 because of rotate device message is showing when user trying to capture in portrait
				mobileIdCaptureOptions.criteria.turnSkewAngleTolerance = 90;
				checkDepositCaptureOptions.lookAndFeel.documentSample =
					"../images/demo_check_front.svg";
				passportCaptureOptions.lookAndFeel.documentSample =
					"../images/demo_passport.svg";
				creditCardCaptureOptions.lookAndFeel.documentSample =
					"../images/demo_credit_card.svg";
				payBillCaptureOptions.lookAndFeel.documentSample =
					"../images/demo_bill.svg";
					
				mobileIdCaptureOptions.lookAndFeel.documentSampleTimeout = defaultDocumentSampleTimeout;
				checkDepositCaptureOptions.lookAndFeel.documentSampleTimeout = defaultDocumentSampleTimeout;
				passportCaptureOptions.lookAndFeel.documentSampleTimeout = defaultDocumentSampleTimeout;
				creditCardCaptureOptions.lookAndFeel.documentSampleTimeout = defaultDocumentSampleTimeout;
				payBillCaptureOptions.lookAndFeel.documentSampleTimeout = defaultDocumentSampleTimeout;
				
				
				//Below are default settings updated for mobileid, Please modify other module settings using below examples
				
				mobileIdCaptureOptions.iconTransparency = defaulticonTransparency;
				mobileIdCaptureOptions.tapToDismissInstruction.visible = defaultTapToDismissInstructionVisible;
				mobileIdCaptureOptions.tapToDismissInstruction.text   =  defaultTapToDismissInstructionText;
				mobileIdCaptureOptions.tapToDismissInstruction.orientation = defaultTapToDismissInstructionOrientation;
				mobileIdCaptureOptions.fitDocumentInstruction.visible = defaultFitDocumentInstructionVisible;
				mobileIdCaptureOptions.zoomInInstruction.visible = defaultZoomInInstructionVisible;
				mobileIdCaptureOptions.zoomOutInstruction.visible = defaultZoomOutInstructionVisible;
				mobileIdCaptureOptions.centerDocumentInstruction.visible = defaultCenterDocumentInstructionVisible;
				mobileIdCaptureOptions.rotateDeviceInstruction.visible = defaultRotateDeviceInstructionVisible;
				mobileIdCaptureOptions.holdDeviceLevelInstruction.visible = defaultHoldDeviceLevelInstructionVisible;
				mobileIdCaptureOptions.holdSteadyInstruction.visible = defaultHoldSteadyInstructionVisible;
				mobileIdCaptureOptions.doneInstruction.visible = defaultDoneInstructionVisible;
				mobileIdCaptureOptions.motionPermissionInstruction.visible = defaultMotionPermissionInstructionVisible;
				mobileIdCaptureOptions.motionPermissionInstruction.text = defaultMotionPermissionInstructionText;
				mobileIdCaptureOptions.capturePauseInstruction.visible = defaultCapturePauseInstructionVisible;
				mobileIdCaptureOptions.capturePauseInstruction.text = defaultCapturePauseText;
				mobileIdCaptureOptions.targetFrameBackground = defaultTargetFrameBackground;
				mobileIdCaptureOptions.targetFrameSuccessBackground = defaultTargetFrameSuccessBackground;
				mobileIdCaptureOptions.enableAutoCapture = defaultEnableAutoCapture;
				mobileIdCaptureOptions.fitDocumentInstruction.text = defaultFitDocumentInstructionText;
                mobileIdCaptureOptions.zoomInInstruction.text = defaultZoomInInstructionText;
                mobileIdCaptureOptions.zoomOutInstruction.text = defaultZoomOutInstructionText;
                mobileIdCaptureOptions.centerDocumentInstruction.text = defaultCenterDocumentInstructionText;    
                mobileIdCaptureOptions.rotateDeviceInstruction.text = defaultRotateDeviceInstructionText;
                mobileIdCaptureOptions.holdDeviceLevelInstruction.text = defaultHoldDeviceLevelInstructionText;
                mobileIdCaptureOptions.holdSteadyInstruction.text = defaultHoldSteadyInstructionText;
                mobileIdCaptureOptions.doneInstruction.text = defaultDoneInstructionText;
                mobileIdCaptureOptions.motionPermissionInstruction.text = defaultMotionPermissionInstructionText;
                mobileIdCaptureOptions.tapToDismissInstruction.accessibilityText = defaultTapToDismissInstructionAccessibilityText;
                mobileIdCaptureOptions.fitDocumentInstruction.accessibilityText = defaultFitDocumentInstructionAccessibilityText;
                mobileIdCaptureOptions.zoomInInstruction.accessibilityText = defaultZoomInInstructionAccessibilityText;
                mobileIdCaptureOptions.zoomOutInstruction.accessibilityText = defaultZoomOutInstructionAccessibilityText;
                mobileIdCaptureOptions.centerDocumentInstruction.accessibilityText = defaultCenterDocumentInstructionAccessibilityText;
                mobileIdCaptureOptions.rotateDeviceInstruction.accessibilityText = defaultRotateDeviceInstructionAccessibilityText;
                mobileIdCaptureOptions.holdDeviceLevelInstruction.accessibilityText = defaultHoldDeviceLevelInstructionAccessibilityText;
                mobileIdCaptureOptions.holdSteadyInstruction.accessibilityText = defaultHoldSteadyInstructionAccessibilityText;
                mobileIdCaptureOptions.doneInstruction.accessibilityText = defaultDoneInstructionAccessibilityText;
                mobileIdCaptureOptions.motionPermissionInstruction.accessibilityText = defaultMotionPermissionInstructionAccessibilityText;
                mobileIdCaptureOptions.capturePauseInstruction.accessibilityText = defaultCapturePauseInstructionAccessibilityText;
				
			},
			function (error) {
				console.log("Error while getting options are " + error);
			}
		);
	};

	setDefaultOptions();

	var performStandardCapture = function (
		cameraOptions,
		successCallback,
		errorCallback
	) {
		KfxWebSDK.Capture.create(
			cameraOptions,
			function (createSuccess) {
				KfxWebSDK.Capture.takePicture(
					function (imageData) {
						sendCallback(successCallback, imageData);
					},
					function (takePictureError) {
						console.log(
							"Error while take picture is " +
								takePictureError.message
						);
						sendCallback(errorCallback, takePictureError.message);
					}
				);
			},
			function (createError) {
				alert("Camera is unavailable");
				console.log(
					"Error while creating capture is " + createError.message
				);
				sendCallback(errorCallback, createError.message);
			}
		);
	};

	var performAdvancedCapture = function (
		cameraOptions,
		captureOptions,
		successCallback,
		errorCallback
	) {
		//Set the boolean value to false when the camera is launched successfully
		cameraDisabled = false;
		KfxWebSDK.Capture.destroy(
			function () {
				KfxWebSDK.Capture.create(
					cameraOptions,
					function (createSuccess) {
						KfxWebSDK.Capture.setOptions(
							captureOptions,
							function (setOptionsSuccess) {
								KfxWebSDK.Capture.takePicture(
									function (imageData, flashCaptureData) {
										successCallback(
											imageData,
											flashCaptureData
										);
									},
									function (takePictureError) {
										console.log(
											"Error while take picture is " +
												takePictureError.message
										);
										sendCallback(
											errorCallback,
											takePictureError.message
										);
									}
								);
							},
							function (setOptionsError) {
								console.log(
									"Error while setting options is " +
										setOptionsError.message
								);
								sendCallback(
									errorCallback,
									setOptionsError.message
								);
							}
						);
					},
					function (createError) {
						//When camera is not created due to secuity reasons this error code is returned
						if (createError.code == KfxWebSDK.ERROR_CODE_MEDIA) {
							//Set the boolean value to true as camera is disabled
							cameraDisabled = true;
						}
						console.log(
							"Error while creating capture is " +
								createError.message
						);
						sendCallback(errorCallback, createError.message);
					}
				);
			},
			function (forceDestroyError) {
				console.log(
					"Error while force destroying resources is " +
						forceDestroyError.message
				);
				sendCallback(errorCallback, forceDestroyError.message);
			}
		);
	};

	var stopCapture = function (successCallback, errorCallback) {
		KfxWebSDK.Capture.stopCapture(
			function (stopCaptureSuccess) {
				sendCallback(successCallback, stopCaptureSuccess);
			},
			function (stopCaptureError) {
				console.log(
					"Error while stop capture is " + stopCaptureError.message
				);
				sendCallback(errorCallback, stopCaptureError);
			}
		);
	};

	var destroy = function () {
		KfxWebSDK.Capture.destroy(
			function () {},
			function (destroyError) {
				console.log(
					"Error while destroy capture is " + destroyError.message
				);
			}
		);
	};

	var sendCallback = function (callback, data) {
		if (typeof callback === "function") {
			callback(data);
		}
	};

	// Check if the browser and the device model support web capture or not
	var checkForAutoCaptureSupport = function (successCallback, errorCallback) {
		KfxWebSDK.Utilities.supportsAutoCapture(
			function () {
				successCallback();
			},
			function () {
				errorCallback();
			}
		);
	};

	return {
		checkDepositCameraOptions: checkDepositCameraOptions,
		checkDepositCaptureOptions: checkDepositCaptureOptions,
		mobileIdCameraOptions: mobileIdCameraOptions,
		mobileIdCaptureOptions: mobileIdCaptureOptions,
		creditCardCameraOptions: creditCardCameraOptions,
		creditCardCaptureOptions: creditCardCaptureOptions,
		payBillCameraOptions: payBillCameraOptions,
		payBillCaptureOptions: payBillCaptureOptions,
		performStandardCapture: performStandardCapture,
		performAdvancedCapture: performAdvancedCapture,
		stopCapture: stopCapture,
		isAutoCaptureSupported: isAutoCaptureSupported,
		is4KResolutionSupported: is4KResolutionSupported,
		checkForAutoCaptureSupport: checkForAutoCaptureSupport,
		passportCameraOptions: passportCameraOptions,
		passportCaptureOptions: passportCaptureOptions,
		destroy: destroy,
	};
})();
