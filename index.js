
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
    
    // Capture image on button click
    document.getElementById('captureButton').addEventListener('click', function() {

        KfxWebSDK.Capture.takePicture(function(imageData) {
            console.info('Image captured successfully:', imageData);

            // Show the download button
            var downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'block';

            // Set up the download link
            downloadButton.addEventListener('click', function() {
                var link = document.createElement('a');
                link.href = 'data:image/jpeg;base64,' + convertImageDataToBase64(imageData);
                link.download = 'captured_image.jpg';
                link.click();
            });

        }, function(error) {
            console.error('Error capturing image:', error);

            // Show the download button
            var downloadButton = document.getElementById('downloadButton');
            downloadButton.style.display = 'block';

            // Set up the download link
            downloadButton.addEventListener('click', function() {
                var link = document.createElement('a');
                link.href = 'data:image/jpeg;base64,' + convertImageDataToBase64(imageData);
                link.download = 'captured_image.jpg';
                link.click();
            });
        });
    });
});



function convertImageDataToBase64(imageData) {
    var canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var context = canvas.getContext("2d");
    context.putImageData(imageData, 0, 0);
    var dataUrl = canvas.toDataURL("image/jpeg");
    var base64 = dataUrl.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
    context = null;
    canvas = null;
    dataUrl = null;
    return base64;
}