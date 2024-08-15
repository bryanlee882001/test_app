
// Alternative Capture Options
var captureOptions = {
    useTargetFrameCrop: false,
    frameAspectRatio: 0.628,
    framePadding: 14,
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


// Display Camera UI on change in selection
function DisplayCameraUI() {

    // User has to select a document type
    const select = document.getElementById('document_select');
    if (select.value == 0) {
        document.getElementById('error_message').innerHTML = 'Error: Select a Document Type';

        return;
    }

    setTimeout(takePic, 1000);
}


function takePic() {
    // Take Picture
    KfxWebSDK.Capture.takePicture(function(imageData) {
        console.info('Image captured successfully:', imageData);
        document.getElementById('error_message').innerHTML = 'Image captured successfully';
        
        // Review Picture
        document.getElementById('review_container').style.display = 'block';
        var reviewControl = new KfxWebSDK.ReviewControl('review_container');
        reviewControl.review(imageData, function() {
            
            console.log("I want it");
        }, function() {
    
            console.log("I want to retake");
    
        })

    }, function(error) {
        console.error('Error capturing image:', error);
        document.getElementById('error_message').innerHTML = 'Error capturing image: ' + error.message;

        if (error.code == 0) {
            console.info('Kofax Web destoyed');
            KfxWebSDK.destroy();
        }

        document.getElementById('cameraContainer').style.display = 'none';
    });
}



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
            }, function(error) {
                console.error('Error setting capture options:', error);
            });
        }, function(error) {
            console.error('Error creating capture control:', error);
        });
    }, function(error) {
        console.error('Error retrieving default options:', error);
    });
});