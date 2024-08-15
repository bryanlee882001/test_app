

document.addEventListener("DOMContentLoaded", function () {

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);
        document.getElementById('error_message').innerHTML = 'Default options retrieved successfully';
        
        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;

        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
            console.info('Capture control created successfully:', createSuccess);
            document.getElementById('error_message').innerHTML = 'Capture control created successfully';

            // Set additional capture options if needed
            var captureOptions = {
                useTargetFrameCrop: false,
                frameAspectRatio: 0.628,
                framePadding: 5,
                frameCornerHeight: 15,
                frameCornerWidth: 70,
                frameCornerColor: '#277EB7',
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
                    showTapToDismissMessage: true,
                    forceCapture: 10,
                    gallery: true
                }
            };
            
            KfxWebSDK.Capture.setOptions(captureOptions, function() {

                console.info('Capture options set successfully.', captureOptions);
                document.getElementById('error_message').innerHTML = 'Capture options set successfully';
                

            }, function(error) {

                console.error('Error setting capture options:', error);
                document.getElementById('error_message').innerHTML = 'Error setting capture options: ' + error.message;

                if (error.code == 0) {
                    KfxWebSDK.destroy();
                }
            });
            
        }, function(error) {
            console.error('Error creating capture control:', error);
            document.getElementById('error_message').innerHTML = 'Error creating capture control: ' + error.message;

            if (error.code == 0) {
                KfxWebSDK.destroy();
            }
        });

    }, function(error) {
        console.error('Error retrieving default options:', error);
        document.getElementById('error_message').innerHTML = 'Error retrieving default options: ' + error.message;
        
        if (error.code == 0) {
            KfxWebSDK.destroy();
        }
    });
});

// Capture image on button click
function SelectChange() {
    setTimeout(DisplayCameraUI, 1000)
};

function DisplayCameraUI() {

    document.getElementById('cameraContainer').style.display = 'block';

    KfxWebSDK.Capture.takePicture(function(imageData) {
        console.info('Image captured successfully:', imageData);
        
        document.getElementById('review_container').style.display = 'block';
        var reviewControl = new KfxWebSDK.ReviewControl('review_container');
        reviewControl.review(imageData, function() {

            console.log("I want it");
        }, function() {

            console.log("I want to retake");

            // // retakeCallback
            // KfxWebSDK.destroy();
        })

    }, function(error) {
        console.error('Error capturing image:', error);

        if (error.code == 0) {
            KfxWebSDK.destroy();
        }
    });
}
