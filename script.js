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
                cameraOptions.frameAspectRatio = 0.700;
                cameraOptions.framePaddng = 14;

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

    });
});