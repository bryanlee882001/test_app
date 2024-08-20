

// Include the provided JavaScript code here
var performStandardCapture = function (
    successCallback,
    errorCallback
) {
    KfxWebSDK.Capture.getDefaultOptions(function(cameraOptions) {

            // Modify default options if needed
            cameraOptions.containerId = "cameraContainer";
            cameraOptions.preference = "camera";
            cameraOptions.useVideoStream = true;
            cameraOptions.preview = true;

            setTimeout( function() {
                KfxWebSDK.Capture.create(
                cameraOptions,
                function (createSuccess) {
                    document.getElementById('cameraContainer').style.display = 'block';
                    
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
                },
                function (createError) {
                    alert("Camera is unavailable");
                    console.log(
                        "Error while creating capture is " + createError.message
                    );
                }
            );
        }, 2000);

    }, function(error) {
        console.error('Error retrieving default options:', error);
    });
};

