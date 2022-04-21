export const GetImageData = (base64: string): HTMLImageElement => {
  var image = new Image();
  image.src = base64;

  return image;
};
