
// Alternative Capture Options
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

// Display Camera UI when user selects a document type to scan
function SelectChange() {
    setTimeout(DisplayCameraUI, 1000);
};

// Display Camera UI on change in selection
function DisplayCameraUI() {

    // User has to select a document type
    const select = document.getElementById('document_select');
    if (select.value == 0) {
        alert('Select a Document Type');

        return;
    }

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);
        document.getElementById('error_message').innerHTML = 'Default options retrieved successfully';
        
        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;

        const aspectRatios = {
            1: { ratio: 0.46, message: 'User selected Check' },
            2: { ratio: 0.629, message: 'User selected MobileId' },
            3: { ratio: 0.703, message: 'User selected Passport' },
            4: { ratio: 0.623, message: 'User selected Credit Card' },
            5: { ratio: 0.615, message: 'User selected Py Bill' }
        };

        const selectedOption = aspectRatios[select.value];
        if (selectedOption) {
            defaultOptions.frameAspectRatio = selectedOption.ratio;
            console.info(selectedOption.message);
            document.getElementById('error_message').innerHTML = selectedOption.message;
        }

        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
            console.info('Capture control created successfully:', createSuccess);
            document.getElementById('error_message').innerHTML = 'Capture control created successfully';

            document.getElementById('cameraContainer').style.display = 'block';

            KfxWebSDK.Capture.takePicture(function(imageData) {
                console.info('Image captured successfully:', imageData);
                
                document.getElementById('review_container').style.display = 'block';
                var reviewControl = new KfxWebSDK.ReviewControl('review_container');
                reviewControl.review(imageData, function() {
                    
                    console.log("I want it");
                }, function() {
        
                    console.log("I want to retake");
        
                })
        
            }, function(error) {
                console.error('Error capturing image:', error);
        
                if (error.code == 0) {
                    KfxWebSDK.destroy();
                }
            });
            
            // KfxWebSDK.Capture.setOptions(captureOptions, function() {

            //     console.info('Capture options set successfully.', captureOptions);
            //     document.getElementById('error_message').innerHTML = 'Capture options set successfully';
                
            // }, function(error) {

            //     console.error('Error setting capture options:', error);
            //     document.getElementById('error_message').innerHTML = 'Error setting capture options: ' + error.message;

            //     if (error.code == 0) {
            //         KfxWebSDK.destroy();
            //     }
            // });
            
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
}


