
document.addEventListener("DOMContentLoaded", function () {

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);

        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;
        
        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
            console.info('Capture control created successfully.');

        }, function(error) {
            console.error('Error creating capture control:', error);
        });

    }, function(error) {
        console.error('Error retrieving default options:', error);
    });

    // Capture image on button click
    document.getElementById('captureButton').addEventListener('click', function() {
        
        performStandardCapture(function (imageData) {
            console.log("Image captured:", imageData);
        }, function (error) {
            console.error("Error capturing image:", error);
        });
        
    });
});