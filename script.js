// Include the provided JavaScript code here
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

// Event listeners for buttons
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("standardCaptureBtn").addEventListener("click", function () {

        var cameraOptions = { 
            containerId : "cameraContainer", 
            preference : "camera", 
            useVideoStream : true,
            preview : true,
        }; 

        performStandardCapture(cameraOptions, function (imageData) {
            console.log("Image captured:", imageData);
        }, function (error) {
            console.error("Error capturing image:", error);
        });
    });

    // document.getElementById("advancedCaptureBtn").addEventListener("click", function () {
    //     var cameraOptions = {}; // Define your camera options here
    //     var captureOptions = {}; // Define your capture options here
    //     performAdvancedCapture(cameraOptions, captureOptions, function (imageData, flashCaptureData) {
    //         console.log("Image captured:", imageData, flashCaptureData);
    //     }, function (error) {
    //         console.error("Error capturing image:", error);
    //     });
    // });

    // document.getElementById("stopCaptureBtn").addEventListener("click", function () {
    //     stopCapture(function (success) {
    //         console.log("Capture stopped:", success);
    //     }, function (error) {
    //         console.error("Error stopping capture:", error);
    //     });
    // });

    // document.getElementById("destroyBtn").addEventListener("click", function () {
    //     destroy();
    // });
});