
// Global Variable
var globalOptions; 

document.addEventListener("DOMContentLoaded", function () {

    // Get default options
    KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
        console.info('Default options retrieved successfully:', defaultOptions);
        
        // Modify default options if needed
        defaultOptions.containerId = "cameraContainer";
        defaultOptions.preference = "camera";
        defaultOptions.useVideoStream = true;
        defaultOptions.preview = true;

        globalOptions = defaultOptions;

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
        document.getElementById('cameraContainer').style.display = 'block';
        
        KfxWebSDK.Capture.takePicture(function(imageData) {
            console.info('Image captured successfully:', imageData);

            // Review Image
            ReviewImage(imageData);

        }, function(error) {
            console.error('Error capturing image:', error);

            document.getElementById('cameraContainer').style.display = 'none';
        });
    });

    // Select Button
    // document.getElementById('document_select').addEventListener('change', function() {
        
    //     var selected_value = document.getElementById('document_select').value;
    //     if (selected_value != 0) {
    //         document.getElementById('captureButton').style.display = 'block';
    //     }

    // });
});

// A function for users to review images
function ReviewImage(imageData) {

    // Get Container Panel
    document.getElementById('review_container').style.display = 'block';

    // Review Image
    var reviewControl = new KfxWebSDK.ReviewControl('review_container')
    reviewControl.review(imageData, 
        // Accept Callback
        function() {
            console.info('Accepted Image, Downloading Image', imageData);

            // Prepare Image for Download
            var base64Image = convertImageDataToBase64(imageData);
            downloadImage(base64Image, 'captured_image.jpg');

            // Take another picture
            document.getElementById('review_container').style.display = 'none';
            // RestartCapture();
            
        }, // Retake Callback
        function() {
            console.info('Retake Image', imageData);
            
            // Take another picture
            document.getElementById('review_container').style.display = 'none';
            // RestartCapture();
        }
    )
}

// // A function that destroys Kofax Capture and re-creates a new one
// function RestartCapture() {

//     KfxWebSDK.Capture.destroy(
//         function() {
//             console.info('Destroyed Capture, Re-creating Capture');

//             document.getElementById('cameraContainer').style.display = 'none';

//             // Get default options
//             KfxWebSDK.Capture.getDefaultOptions(function(defaultOptions) {
//                 console.info('Default options retrieved successfully:', defaultOptions);
                
//                 // Modify default options if needed
//                 defaultOptions.containerId = "cameraContainer";
//                 defaultOptions.preference = "camera";
//                 defaultOptions.useVideoStream = true;
//                 defaultOptions.preview = true;

//                 // Initialize the capture control with default options
//                 KfxWebSDK.Capture.create(defaultOptions, function(createSuccess) {
//                     console.info('Capture control created successfully.');

//                 }, function(error) {
//                     console.error('Error creating capture control:', error);

//                 });
                
//             }, function(error) {
//                 console.error('Error retrieving default options:', error);

//                 document.getElementById('cameraContainer').style.display = 'none';
//             });
            
//         }, function(error) {
//             console.error('Error destroying image:', error);

//             document.getElementById('cameraContainer').style.display = 'none';
//             document.getElementById('review_container').style.display = 'none';
//         }
//     );
// }

// A function to convert image data to a downloadable format 
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

// A function to create a link for user to download the image
function downloadImage(base64Image, filename) {

    var link = document.createElement('a');
    link.href = 'data:image/jpeg;base64,' + base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}