import * as pdfjsLib from 'pdfjs-dist';

// Configure worker to use the local one provided by pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Loads a PDF file and returns the PDFDocumentProxy.
 */
export const loadPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
};

/**
 * Extracts embedded images from the first page of a PDF.
 * Returns an array of image data URLs.
 */
export const extractImagesFromPdf = async (pdfDoc) => {
  const images = [];
  try {
    const page = await pdfDoc.getPage(1);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        try {
          const imgObj = await new Promise((resolve) => {
            page.objs.get(objId, (img) => resolve(img));
          });
          
          if (imgObj && imgObj.width > 50 && imgObj.height > 50) { // Ignore tiny icons
            const canvas = document.createElement('canvas');
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            const ctx = canvas.getContext('2d');
            
            // Depending on the image format, imgObj data might be ImageData or an ImageBitmap
            if (imgObj instanceof ImageBitmap || imgObj instanceof HTMLImageElement || imgObj instanceof HTMLCanvasElement) {
               ctx.drawImage(imgObj, 0, 0);
            } else if (imgObj.data && imgObj.data.length) {
               // Handle raw pixel data
               let imgData;
               if (imgObj.kind === 1) { // RGB
                 imgData = new ImageData(new Uint8ClampedArray(imgObj.data), imgObj.width, imgObj.height);
               } else if (imgObj.kind === 2) { // RGBA
                 imgData = new ImageData(new Uint8ClampedArray(imgObj.data), imgObj.width, imgObj.height);
               } else if (imgObj.kind === 3) { // Gray
                 const rgba = new Uint8ClampedArray(imgObj.width * imgObj.height * 4);
                 for (let j = 0; j < imgObj.data.length; j++) {
                   const val = imgObj.data[j];
                   rgba[j*4] = val; rgba[j*4+1] = val; rgba[j*4+2] = val; rgba[j*4+3] = 255;
                 }
                 imgData = new ImageData(rgba, imgObj.width, imgObj.height);
               }
               
               if (imgData) {
                 ctx.putImageData(imgData, 0, 0);
               }
            }
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            images.push({
               url: dataUrl,
               width: imgObj.width,
               height: imgObj.height,
               aspectRatio: imgObj.width / imgObj.height
            });
          }
        } catch(e) {
          console.warn("Failed to extract embedded image:", e);
        }
      }
    }
  } catch (err) {
    console.error("Error extracting images from PDF:", err);
  }
  return images;
};

/**
 * Renders the first page of a PDF to a high-resolution data URL.
 */
export const renderPdfToImage = async (pdfDoc, scale = 3.0) => {
  try {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const ctx = canvas.getContext('2d');
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error("Error rendering PDF to image:", err);
    return null;
  }
};
