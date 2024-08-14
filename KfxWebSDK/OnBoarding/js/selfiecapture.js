var SelfieCaptureModule = (function () {
	var selfieCaptureOptions = null,
		selfieCameraOptions = null;
	var defaultAspectRatio = 0;
	var defaultPaddingPercent = 10;
	var isSelfieCaptureSupported = false;
	var hiddenCapture = true;
	var setDefaultOptions = function () {
		selfieCameraOptions = { containerId: "", videoStream: false };
		KfxWebSDK.SelfieCapture.getDefaultOptions(
			function (defaultOptions) {
				selfieCaptureOptions = jQuery.extend(true, {}, defaultOptions);
				selfieCaptureOptions.framePadding = defaultPaddingPercent;
				selfieCaptureOptions.frameAspectRatio = defaultAspectRatio;
			},
			function (error) {
				console.log("Error while getting options are " + error);
			}
		);
	};

	setDefaultOptions();

	var performStandardCapture = function (cameraOptions, successCallback, errorCallback) {
		KfxWebSDK.SelfieCapture.create(
			cameraOptions,
			function (createSuccess) {
				KfxWebSDK.SelfieCapture.takeSelfie(
					function (imageData) {
						sendCallback(successCallback, imageData);
					},
					function (takePictureError) {
						console.log("Error while take selfie is " + takePictureError.message);
						sendCallback(errorCallback, takePictureError.message);
					}
				);
			},
			function (createError) {
				alert("Camera is unavailable");
				console.log("Error while creating selfie capture is " + createError.message);
				sendCallback(errorCallback, createError.message);
			}
		);
	};

	var performAdvancedCapture = function (cameraOptions, captureOptions, successCallback, errorCallback) {
		//Set the boolean value to false when the camera is launched successfully
		cameraDisabled = false;
		KfxWebSDK.SelfieCapture.destroy(
			function () {
				KfxWebSDK.SelfieCapture.create(
					cameraOptions,
					function (createSuccess) {
						KfxWebSDK.SelfieCapture.setOptions(
							captureOptions,
							function (setOptionsSuccess) {
								KfxWebSDK.SelfieCapture.takeSelfie(
									function (closeSelfieImageData, farSelfieImageData) {
										successCallback(closeSelfieImageData, farSelfieImageData);
									},
									function (takePictureError) {
										console.log("Error while take selfie is " + takePictureError.message);
										sendCallback(errorCallback, takePictureError.message);
									}
								);
							},
							function (setOptionsError) {
								console.log("Error while setting options is " + setOptionsError.message);
								sendCallback(errorCallback, setOptionsError.message);
							}
						);
					},
					function (createError) {
						//When camera is not created due to secuity reasons this error code is returned
						if (createError.code == KfxWebSDK.ERROR_CODE_MEDIA) {
							//Set the boolean value to true as camera is disabled
							cameraDisabled = true;
						}
						console.log("Error while creating capture is " + createError.message);
						sendCallback(errorCallback, createError.message);
					}
				);
			},
			function (forceDestoryError) {
				console.log("Error while force destroying resources is " + forceDestoryError.message);
				sendCallback(errorCallback, forceDestoryError.message);
			}
		);
	};

	var stopCapture = function (successCallback, errorCallback) {
		KfxWebSDK.SelfieCapture.stopCapture(
			function (stopCaptureSuccess) {
				sendCallback(successCallback, stopCaptureSuccess);
			},
			function (stopCaptureError) {
				console.log("Error while stop capture is " + stopCaptureError.message);
				sendCallback(errorCallback, stopCaptureError);
			}
		);
	};

	var destroy = function () {
		KfxWebSDK.SelfieCapture.destroy(
			function () {},
			function (destroyError) {
				console.log("Error while destroy sefie capture is " + destroyError.message);
			}
		);
	};

	var sendCallback = function (callback, data) {
		if (typeof callback === "function") {
			callback(data);
		}
	};

	// Check if the browser and the device model support web capture or not
	var checkForSelfieCaptureSupport = function (successCallback, errorCallback) {
		KfxWebSDK.Utilities.supportsSelfieCapture(
			function () {
				SelfieCaptureModule.isSelfieCaptureSupported = true;
				successCallback();
			},
			function () {
				SelfieCaptureModule.isSelfieCaptureSupported = false;
				errorCallback();
			}
		);
	};

	return {
		performStandardCapture: performStandardCapture,
		performAdvancedCapture: performAdvancedCapture,
		stopCapture: stopCapture,
		isSelfieCaptureSupported: isSelfieCaptureSupported,
		checkForSelfieCaptureSupport: checkForSelfieCaptureSupport,
		selfieCaptureOptions: selfieCaptureOptions,
		selfieCameraOptions: selfieCameraOptions,
		destroy: destroy,
		hiddenCapture: hiddenCapture,
	};
})();
