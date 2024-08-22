// // Global var for default options
// var globalOptions =  { 
//     useTargetFrameCrop: false, 
//     frameAspectRatio: 0.628, 
//     framePadding: 5, 
//     frameCornerHeight: 15, 
//     frameCornerWidth: 70, 
//     frameCornerColor: '#00FF00', 
//     resolution:KfxWebSDK.resolution.RES_FULL_HD,  
//     downscaleSize: 2, 
//     outOfFrameTransparency: 0.5, 
//     showEdges: false, 
//     edgesColor: '#FFFF00', 
//     edgesWidth: 4, 
//     enableFlashCapture: false, 
//     guidanceSize: 150, 
//     criteria: { 
//           captureTimeout: 1700, 
//           centerToleranceFraction: 0.15,
//           longAxisThreshold: 85, 
//           shortAxisThreshold: 60, 
//           maxFillFraction: 1.8,
//           minFillFraction: 0.65, 
//           turnSkewAngleTolerance: 10, 
//           pitchThreshold: 15, 
//           rollThreshold: 15 
//       }, 
//       lookAndFeel: { 
//         showTapToDismissMessage: true, 
//         forceCapture: 10, 
//         gallery: true 
//       } 
// };

var options = {
    containerId: "cameraContainer",
    preference: "camera",
    useVideoStream: true,
    preview: true,
    framePadding: 10,
    frameAspectRatio: 0.629,
    framePadding: 5,
    frameCornerHeight: 10,
	   resolution: KfxWebSDK.resolution.RES_FULL_HD,
	   downscaleSize: 2,
    frameCornerWidth: 60,
    frameCornerColor: '#00FF00',
    outOfFrameTransparency: 0.5,
    iconTransparency: 0.5,
    showEdges: false,
    edgesColor: '#FFFF00',
    edgesWidth: 4,
    guidanceSize: 150,
	   guidanceOrientation: KfxWebSDK.orientation.PORTRAIT,
    useTargetFrameCrop: false,
    drawInstructionsAsText: false,
	   instructionsAsTextOrientation: KfxWebSDK.orientation.PORTRAIT,
    instructionsTextColor: '#FFFFFF',
    instructionsBackgroundColor: '#000000',
    galleryButtonAccessibilityText: "Gallery",
    forceCaptureButtonAccessibilityText: "Force capture",
    tapToDismissInstruction: {
         visible: true,
         text: "Tap to Dismiss",
         accessibilityText: "Tap to Dismiss",
  		orientation: KfxWebSDK.orientation.LANDSCAPE
    },
    fitDocumentInstruction: {
         visible: true,
         text: "Fit document in the frame",
         accessibilityText: "Fit document in the frame"
    },
    zoomInInstruction: {
         visible: true,
         text: "Move closer",
         accessibilityText: "Move Closer"
    },
    zoomOutInstruction: {
         visible: true,
         text: "Move back",
         accessibilityText: "Move back"
    },
    centerDocumentInstruction: {
         visible: true,
         text: "Center the document",
         accessibilityText: "Center the document"
    },
    rotateDeviceInstruction: {
         visible: true,
         text: "Rotate device",
         accessibilityText: "Rotate device"
    },
    holdDeviceLevelInstruction: {
         visible: true,
         text: "Hold device level",
         accessibilityText: "Hold device level"
    },
    holdSteadyInstruction: {
         visible: true,
         text: "Hold steady",
         accessibilityText: "Hold steady"
    },
    doneInstruction: {
         visible: true,
         text: "Done",
         accessibilityText: "Done"
    },
    motionPermissionInstruction: {
         visible: false,
         text: "Tap to give device motion and orientation access",
         accessibilityText: "Tap to give device motion and orientation access"
    },
    capturePauseInstruction: {
         visible: true,
         text: "Capture is Paused. Tap to Continue.",
         accessibilityText: "Capture is Paused. Tap to Continue.",
    },
    targetFrameBackground: "",
    targetFrameSuccessBackground: "",
    enableAutoCapture: true,
    enableFlashCapture: false,
    criteria: {
        minFillFraction: 0.65,
        maxFillFraction: 1.8,
        longAxisThreshold: 85,
        shortAxisThreshold: 60,
        centerToleranceFraction: 0.19,
        captureTimeout: 1700,
        turnSkewAngleTolerance: 10,
        pitchThreshold: 15,
        rollThreshold: 15
    },
    lookAndFeel: {
        documentSample: 'http://example.com/images/document_sample.jpg',
		   showTapToDismissMessage: true,
        forceCapture: 10,
        documentSampleTimeout:6,
        gallery: true
    },
    acceptButton: { 
       text: "Accept" 
    },
    retakeButton: { 
       text: "Retake" 
    },
    nextButton: { 
       text: "Next" 
    }
};

/**
 * Event Listener when DOM Content is loaded
 */
document.addEventListener("DOMContentLoaded", function () {

    // Initializes Capture and its phototaking functionalities when captureButton is clicked
    document.getElementById('captureButton').addEventListener('click', function() {
        createCapture();
    });

    // Display captureButton when a document type is selected
    document.getElementById('document_select').addEventListener('change', function() {

        var selected_value = document.getElementById('document_select').value;
        if (selected_value != 0) {
            document.getElementById('captureButton').style.display = 'block';
            document.getElementById('debug_message').innerHTML = "Select 'Start Camera' to display Camera UI";
        }

    });
});

/**
 * A function that initializes capture control with default options. as 
 * well as the camera UI for users to take pictures.
 * 
 */
function createCapture() {

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);
        document.getElementById('debug_message').innerHTML = 'Default options retrieved successfully';

        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;
        defaultOptions.framePadding = 10;

        // Set Aspect Ratio Based on Selections
        const aspectRatios = {
            1: { type: 'Check', ratio: 0.46 },
            2: { type: 'MobileId', ratio: 0.629 },
            3: { type: 'Passport', ratio: 0.703 },
            4: { type: 'Credit Card', ratio: 0.623 },
            5: { type: 'Pay Bill' , ratio: 0.615 }
        };

        const select = document.getElementById('document_select');
        const selectedOption = aspectRatios[select.value];
        if (selectedOption) {
            defaultOptions.frameAspectRatio = selectedOption.ratio;

            console.info(`User selected ${selectedOption.type}!`);
            document.getElementById('debug_message').innerHTML = `User selected ${selectedOption.type}!`;
        }

        console.info('Updated options:', defaultOptions);
        
        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(options, function(createSuccess) {
            console.info('Capture control created successfully, Displaying Camera UI:');

            // Display Kofax Camera UI
            document.getElementById('cameraContainer').style.display = 'block';

            // Take Picture
            KfxWebSDK.Capture.takePicture(function(imageData) {
                console.info('Image captured successfully:', imageData);
                document.getElementById('debug_message').innerHTML = 'Image captured successfully';

                // Review Image
                reviewImage(imageData);

            }, function(error) {
                console.error('Error capturing image:', error);
                document.getElementById('debug_message').innerHTML = 'Error capturing image: ' + error.message;

            });

        }, function(error) {
            console.error('Error creating capture control:', error);
            document.getElementById('debug_message').innerHTML = 'Error creating capture control: ' + error.message;
            
        });

    }, function(error) {
        console.error('Error retrieving default options:', error);
        document.getElementById('debug_message').innerHTML = 'Error retrieving default options: ' + error.message;

    });
};

/**
 * A function to display a panel for users to review captured images. 
 * Users can decide if they want to accept the image or retake another one. 
 * 
 * @param imageData - a JSON array containing information of captured image
 */
function reviewImage(imageData) {

    // Display Review Panel
    document.getElementById('review_container').style.display = 'block';

    // Review Image
    var reviewControl = new KfxWebSDK.ReviewControl('review_container')
    reviewControl.review(imageData, 
        // Accept Callback
        function() {
            console.info('Accepted Image, Downloading Image', imageData);
            document.getElementById('debug_message').innerHTML = 'Select a document to begin';

            // Prepare Image for Download
            var base64Image = convertImageDataToBase64(imageData);
            var fileName = getFileName();
            downloadImage(base64Image, fileName);

            // Close Panel and Destroy Capture
            document.getElementById('review_container').style.display = 'none';
            KfxWebSDK.Capture.destroy(
                function() {
                    console.info('Destroyed Capture, Re-creating Capture');
                    document.getElementById('cameraContainer').style.display = 'none';

                }, function(error) {
                    console.error('Error destroying image:', error);
                    document.getElementById('debug_message').innerHTML = 'Error destroying image: ' + error.message;
        
                    // Hide panels
                    document.getElementById('cameraContainer').style.display = 'none';
                    document.getElementById('review_container').style.display = 'none';
                }
            );
            
        }, // Retake Callback
        function() {
            console.info('Retake Image', imageData);
            document.getElementById('debug_message').innerHTML = 'Retaking Image';
            
            // Take another picture
            document.getElementById('review_container').style.display = 'none';
            restartCapture();
        }
    )
};

/**
 * A function that destroys the existing capture and create a 
 * new one, used in review panels for retaking images. 
 * 
 */
function restartCapture() {

    KfxWebSDK.Capture.destroy(
        function() {
            console.info('Destroyed Capture, Re-creating Capture');

            document.getElementById('cameraContainer').style.display = 'none';
            document.getElementById('review_container').style.display = 'none';

            // Create a new capture
            createCapture()
            
        }, function(error) {
            console.error('Error destroying image:', error);
            document.getElementById('debug_message').innerHTML = 'Error destroying image: ' + error.message;

            // Hide panels
            document.getElementById('cameraContainer').style.display = 'none';
            document.getElementById('review_container').style.display = 'none';
        }
    );
};
