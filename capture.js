

// Include the provided JavaScript code here
var performStandardCapture = function (
    successCallback,
    errorCallback
) {
    KfxWebSDK.Capture.takePicture(
        function (imageData) {
            console.log('Taken picture');
        },
        function (takePictureError) {
            console.log(
                "Error while take picture is " +
                    takePictureError.message
            );
        }
    );
};

