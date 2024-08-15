

document.addEventListener("DOMContentLoaded", function () {
    var error_message_div = document.getElementById('error_message').innerHTML;

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);
        error_message_div = 'Default options retrieved successfully';
        
        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;

        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
            console.info('Capture control created successfully.');
            error_message_div = 'Capture control created successfully';

            // Set additional capture options if needed
            var captureOptions = {
                useTargetFrameCrop: false,
                frameAspectRatio: 0.628,
                framePadding: 5,
                frameCornerHeight: 15,
                frameCornerWidth: 70,
                frameCornerColor: '#00FF00',
                resolution: KfxWebSDK.resolution.RES_FULL_HD,
                downscaleSize: 2,
                outOfFrameTransparency: 0.5,
                showEdges: false,
                edgesColor: '#FFFF00',
                edgesWidth: 4,
                enableFlashCapture: false,
                guidanceSize: 150,
                criteria: {
                    captureTimeout: 1700,
                    centerToleranceFraction: 0.15,
                    longAxisThreshold: 85,
                    shortAxisThreshold: 60,
                    maxFillFraction: 1.8,
                    minFillFraction: 0.65,
                    turnSkewAngleTolerance: 10,
                    pitchThreshold: 15,
                    rollThreshold: 15
                },
                lookAndFeel: {
                    // documentSample: 'http://example.com/images/document_sample.jpg',
                    showTapToDismissMessage: true,
                    forceCapture: 10,
                    gallery: true
                }
            };
            
            KfxWebSDK.Capture.setOptions(captureOptions, function() {
                console.info('Capture options set successfully.');
                error_message_div = 'Capture options set successfully';
            }, function(error) {
                console.error('Error setting capture options:', error);
                error_message_div = 'Error setting capture options: ' + error.message;
            });
            
        }, function(error) {
            console.error('Error creating capture control:', error);
            error_message_div = 'Error creating capture control: ' + error.message;
        });

    }, function(error) {
        console.error('Error retrieving default options:', error);
        error_message_div = 'Error retrieving default options: ' + error.message;
    });

    // Capture image on button click
    document.getElementById('captureButton').addEventListener('click', function() {

        KfxWebSDK.Capture.takePicture(function(imageData) {
            console.info('Image captured successfully:', imageData);
            error_message_div = 'Image captured successfully';

        }, function(error) {
            console.error('Error capturing image:', error);
            error_message_div= 'Error capturing image: ' + error.message;
        });
    });
});
