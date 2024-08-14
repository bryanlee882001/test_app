
export const convertImageDataToBase64 = (imageData) => {
  let canvas    =  document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  let context =   canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  let dataUrl = canvas.toDataURL('image/jpeg');
  const base64 = dataUrl.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");
  context = null;
  canvas = null;
  dataUrl = null;
  return base64;
}
