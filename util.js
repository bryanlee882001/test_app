/**
 * A helper function to convert image data into a base64 format for downloading
 * 
 * @param imageData - a JSON array containing information of captured image
 * @returns a base 64 image
 */
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

};

/**
 * A helper function to create a link for users to download image
 * 
 * @param imageData - a JSON array containing image information
 */
function downloadImage(base64Image, filename) {

    var link = document.createElement('a');
    link.href = 'data:image/jpeg;base64,' + base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

};

/**
 * A helper function that creates the filename for downloaded images
 * 
 * @returns a filename in a string format
 */
function getFileName() {

    var currentDate = new Date(); 
    var dateTime =   currentDate.getDate() + "-"
                    + (currentDate.getMonth()+1)  + "-" 
                    + currentDate.getFullYear() + "_"  
                    + currentDate.getHours() + "-"  
                    + currentDate.getMinutes() + "-" 
                    + currentDate.getSeconds();

    var documentSelect = document.getElementById('document_select');
    var documentType = documentSelect.options[documentSelect.selectedIndex].text.replace(" ", "-");

    return documentType + '_' + dateTime + '.jpg';

};

/**
 * A helper function that creates the filename for downloaded images
 * 
 * @returns a filename in a string format
 */
function validateOptions(options) {
    if (typeof options.frameAspectRatio !== 'number' || options.frameAspectRatio <= 0) {
        throw new Error(`Invalid aspect ratio: ${options.frameAspectRatio}`);
    }
    if (typeof options.framePadding !== 'number' || options.framePadding < 0) {
        throw new Error(`Invalid padding: ${options.framePadding}`);
    }
}