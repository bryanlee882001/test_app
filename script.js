// Include the provided JavaScript code here
var performStandardCapture = function (
    cameraOptions,
    successCallback,
    errorCallback
) {
    KfxWebSDK.Capture.create(
        cameraOptions,
        function (createSuccess) {
            document.getElementById('debug_message').innerHTML = 'Successfully Created Capture';
            KfxWebSDK.Capture.takePicture(
                function (imageData) {
                    sendCallback(successCallback, imageData);
                },
                function (takePictureError) {
                    console.error("Error while taking picture:", takePictureError);
                    sendCallback(errorCallback, takePictureError.message);
                }
            );
        },
        function (createError) {
            alert("Camera is unavailable");
            document.getElementById('debug_message').innerHTML = 'Error while creating capture: ' + createError.message;
            console.error("Error while creating capture:", createError);
            sendCallback(errorCallback, createError.message);
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

        // var cameraOptions = { 
        //     containerId : "cameraContainer", 
        //     preference : "camera", 
        //     useVideoStream : true,
        //     preview : true,
        // };
        
        KfxWebSDK.Capture.getDefaultOptions(
            function (cameraOptions) {

                cameraOptions.containerId = 'cameraContainer';
                cameraOptions.preference = 'camera';
                cameraOptions.useVideoStream = true;
                cameraOptions.preview = true;

                const defaultMobileIdAspectRatio = 0.629;
                const defaultPaddingPercent = 14;

                cameraOptions.frameAspectRatio = defaultMobileIdAspectRatio;
                cameraOptions.framePaddng = defaultPaddingPercent;

                performStandardCapture(cameraOptions, function (imageData) {
                    console.log("Image captured:", imageData);
                }, function (error) {
                    console.error("Error capturing image:", error);
                });
            },
            function (getOptionsError) {
                document.getElementById('debug_message').innerHTML = 'Error while getting default options: ' + getOptionsError.message;
                console.error("Error while creating capture:", getOptionsError);
            }
        )

        // performStandardCapture(cameraOptions, function (imageData) {
        //     console.log("Image captured:", imageData);
        // }, function (error) {
        //     console.error("Error capturing image:", error);
        // });

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