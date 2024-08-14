document.addEventListener("DOMContentLoaded", function () {
    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);

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

        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.lookAndFeel.documentSample = "../images/demo_bill.svg";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;
        defaultOptions.downloadButton = "downloadButton";

        // Initialize the capture control with default options
        KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
            console.log('Capture control created successfully.');

            KfxWebSDK.Capture.setOptions(captureOptions, function() {
                console.log('Capture options set successfully.');
            }, function(error) {
                console.error('Error setting capture options:', error);
            });

        }, function(error) {
            console.error('Error creating capture control:', error);
        });

    }, function(error) {
        console.error('Error retrieving default options:', error);
    });

    // Capture image on button click
    document.getElementById('captureButton').addEventListener('click', function() {

        // Show CameraContainer
        document.getElementById('cameraContainer').style.display = 'block';
        document.getElementById('stopButton').style.display = 'block';
        document.getElementById('captureButton').style.display = 'none';

        KfxWebSDK.Capture.takePicture(function(imageData) {
            // successCallback
            console.info('Image captured successfully:', imageData);

            // alert('successfully taken picture' + imageData);

            // // Display the captured image
            // var capturedImageElement = document.getElementById('capturedImage');
            // capturedImageElement.src = 'data:image/jpeg;base64,' + imageData;

            // Show the download button
            var downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'block';

        }, function(error) {
            // errorCallback
            console.error('Error capturing image:', error);
        });
    });

    // Stop Capturing image on button click
    document.getElementById('stopButton').addEventListener('click', function() {
        document.getElementById('stopButton').style.display = 'none';
        document.getElementById('downloadButton').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('captureButton').style.display = 'block';

        KfxWebSDK.Capture.stopCapture(function() {
            // successCallback
            console.info('Stopped Capturing Image:');
        }, function(error) {
            // errorCallback
            console.error('Error capturing image:', error);
        });
    });
});