import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { detectDocumentFormat, getSearchRegionPrior, DOCUMENT_TYPES } from './documentClassifier.js';

let model = null;

const loadModel = async () => {
  if (!model) {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      model = await blazeface.load();
    } catch (err) {
      console.warn("[FaceExtraction] WebGL failed, falling back to CPU...");
      await tf.setBackend('cpu');
      await tf.ready();
      model = await blazeface.load();
    }
  }
  return model;
};

const fileToImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

const dataUrlToImage = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};

/**
 * Creates a cropped image from a prior region and returns the image + offsets
 */
const createPriorRegionImage = (img, prior) => {
  const cropX = prior[0] * img.width;
  const cropY = prior[1] * img.height;
  const cropW = prior[2] * img.width;
  const cropH = prior[3] * img.height;
  
  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  
  return new Promise((resolve) => {
    const newImg = new Image();
    newImg.onload = () => resolve({ priorImg: newImg, offsetX: cropX, offsetY: cropY });
    newImg.src = canvas.toDataURL('image/jpeg', 1.0);
  });
};

/**
 * Validates a candidate image by running face detection.
 */
const validateCandidate = async (net, img, originalMethod) => {
  let predictions = await net.estimateFaces(img, false);
  let usedMethod = originalMethod;
  let scaleFactor = 1.0;

  // MULTI-PASS FALLBACK PIPELINE
  if (!predictions || predictions.length === 0) {
    console.warn(`[FaceExtraction] Pass 1 failed for ${originalMethod}. Attempting fallback processing...`);
    
    const fallbackPasses = [
      { name: 'INCREASED_CONTRAST', filter: 'contrast(150%)', scale: 1.0 },
      { name: 'GRAYSCALE_BRIGHT', filter: 'grayscale(100%) brightness(120%)', scale: 1.0 },
      { name: 'ENLARGED', filter: 'none', scale: 2.0 },
      { name: 'CONTRAST_ENLARGED', filter: 'contrast(130%)', scale: 2.0 }
    ];

    for (const pass of fallbackPasses) {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * pass.scale;
      canvas.height = img.height * pass.scale;
      const ctx = canvas.getContext('2d');
      ctx.filter = pass.filter;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const passImg = new Image();
      passImg.src = canvas.toDataURL('image/jpeg', 0.95);
      await new Promise(r => passImg.onload = r);

      const passPredictions = await net.estimateFaces(passImg, false);
      if (passPredictions && passPredictions.length > 0) {
        predictions = passPredictions;
        usedMethod = `${originalMethod}_FALLBACK_${pass.name}`;
        scaleFactor = pass.scale;
        console.log(`[FaceExtraction] Fallback ${pass.name} SUCCESS.`);
        break;
      }
    }
  }

  if (!predictions || predictions.length === 0) return null;

  const primaryFace = predictions[0];
  
  // Adjust bounding box if a scaled fallback was used
  if (scaleFactor !== 1.0) {
    primaryFace.topLeft = [primaryFace.topLeft[0] / scaleFactor, primaryFace.topLeft[1] / scaleFactor];
    primaryFace.bottomRight = [primaryFace.bottomRight[0] / scaleFactor, primaryFace.bottomRight[1] / scaleFactor];
  }

  const score = primaryFace.probability[0];

  const start = primaryFace.topLeft;
  const end = primaryFace.bottomRight;
  const faceWidth = end[0] - start[0];
  
  const faceRatio = faceWidth / img.width;
  
  let finalMethod = usedMethod;
  if (usedMethod.includes('PDF_EMBEDDED_IMAGE') && faceRatio < 0.35) {
    finalMethod = usedMethod.replace('PDF_EMBEDDED_IMAGE', 'PDF_EMBEDDED_SCAN_CROP');
  }

  let confidenceLevel = 'HIGH';
  if (score < 0.85) confidenceLevel = 'MEDIUM';
  if (score < 0.60) confidenceLevel = 'LOW';

  return {
    score: score,
    confidence: confidenceLevel,
    face: primaryFace,
    method: finalMethod,
    img: img, // Always use the original unmodified image for final crop!
    faceRatio: faceRatio
  };
};

/**
 * Simple variance-based text overlap detector.
 * Scans rows and columns to find high frequency edge density (text) and trims the bounding box.
 */
const refineCropWithTextDetection = (img, bounds, face) => {
  const canvas = document.createElement('canvas');
  canvas.width = bounds.w;
  canvas.height = bounds.h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
  
  const imageData = ctx.getImageData(0, 0, bounds.w, bounds.h);
  const data = imageData.data;
  
  const getRowVariance = (y) => {
    let diffs = 0;
    for (let x = 1; x < bounds.w; x++) {
      const i1 = (y * bounds.w + x) * 4;
      const i2 = (y * bounds.w + (x - 1)) * 4;
      const g1 = (data[i1] + data[i1+1] + data[i1+2]) / 3;
      const g2 = (data[i2] + data[i2+1] + data[i2+2]) / 3;
      if (Math.abs(g1 - g2) > 35) diffs++;
    }
    return diffs / bounds.w;
  };

  const getColVariance = (x) => {
    let diffs = 0;
    for (let y = 1; y < bounds.h; y++) {
      const i1 = (y * bounds.w + x) * 4;
      const i2 = ((y - 1) * bounds.w + x) * 4;
      const g1 = (data[i1] + data[i1+1] + data[i1+2]) / 3;
      const g2 = (data[i2] + data[i2+1] + data[i2+2]) / 3;
      if (Math.abs(g1 - g2) > 35) diffs++;
    }
    return diffs / bounds.h;
  };

  let topTrim = 0;
  let bottomTrim = 0;
  let leftTrim = 0;
  let rightTrim = 0;

  // We only scan the outer margins to avoid trimming the actual face features (eyes/mouth)
  const maxScanY = Math.floor(bounds.h * 0.35); // 35% top/bottom
  const maxScanX = Math.floor(bounds.w * 0.30); // 30% sides
  
  const TEXT_DENSITY_THRESHOLD = 0.12; 

  // Scan bottom (often hits MRZ or name)
  for (let y = bounds.h - 1; y > bounds.h - maxScanY; y--) {
    if (getRowVariance(y) > TEXT_DENSITY_THRESHOLD) {
      bottomTrim = bounds.h - y;
    }
  }

  // Scan top (often hits document headers)
  for (let y = 0; y < maxScanY; y++) {
    if (getRowVariance(y) > TEXT_DENSITY_THRESHOLD) {
      topTrim = y;
    }
  }

  // Scan left side
  for (let x = 0; x < maxScanX; x++) {
    if (getColVariance(x) > TEXT_DENSITY_THRESHOLD) {
      leftTrim = x;
    }
  }

  // Scan right side
  for (let x = bounds.w - 1; x > bounds.w - maxScanX; x--) {
    if (getColVariance(x) > TEXT_DENSITY_THRESHOLD) {
      rightTrim = bounds.w - x;
    }
  }

  console.log(`[FaceExtraction] Text overlap trims applied: Top=${topTrim}, Bottom=${bottomTrim}, Left=${leftTrim}, Right=${rightTrim}`);

  return {
    x: bounds.x + leftTrim,
    y: bounds.y + topTrim,
    w: bounds.w - leftTrim - rightTrim,
    h: bounds.h - topTrim - bottomTrim
  };
};

/**
 * Extracts a mathematically sound and text-free portrait crop from a larger image.
 */
const extractCropFromImage = (img, face) => {
  const start = face.topLeft;
  const end = face.bottomRight;
  const faceWidth = end[0] - start[0];
  const faceHeight = end[1] - start[1];

  const centerX = start[0] + faceWidth / 2;
  const centerY = start[1] + faceHeight / 2;

  // ICAO Passport Standard approximation: 
  // Face should fill ~70% of the image.
  // Using a tight 1.5 multiplier (instead of 2.0) prevents capturing surrounding document text.
  const cropWidth = faceWidth * 1.5; 
  const cropHeight = cropWidth * (4/3); // 3:4 aspect ratio

  let cropX = centerX - (cropWidth / 2);
  let cropY = centerY - (cropHeight * 0.45);

  // Clamp coordinates
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  let finalWidth = cropWidth;
  let finalHeight = cropHeight;

  if (cropX + finalWidth > img.width) finalWidth = img.width - cropX;
  if (cropY + finalHeight > img.height) finalHeight = img.height - cropY;
  
  let initialBounds = { x: cropX, y: cropY, w: finalWidth, h: finalHeight };

  // Refine bounds to exclude text/MRZ
  const refinedBounds = refineCropWithTextDetection(img, initialBounds, face);

  const canvas = document.createElement('canvas');
  canvas.width = refinedBounds.w;
  canvas.height = refinedBounds.h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, refinedBounds.x, refinedBounds.y, refinedBounds.w, refinedBounds.h, 0, 0, refinedBounds.w, refinedBounds.h);

  return canvas.toDataURL('image/jpeg', 0.95);
};

export const extractFacePortrait = async (file) => {
  try {
    const net = await loadModel();
    let candidates = [];
    let isPdf = file.type === 'application/pdf';
    let globalFormat = DOCUMENT_TYPES.UNKNOWN;

    console.log(`[FaceExtraction] Starting pipeline for ${isPdf ? 'PDF' : 'Image'}...`);

    if (isPdf) {
      // Dynamic import to avoid breaking non-PDF paths if pdfjs fails
      const { loadPdf, extractImagesFromPdf, renderPdfToImage } = await import('./pdfProcessor.js');
      
      const pdfDoc = await loadPdf(file);
      console.log("[FaceExtraction] PDF loaded successfully.");

      // STEP 1: Extract Embedded Images (Best for e-Visas / digital IDs)
      const embeddedImages = await extractImagesFromPdf(pdfDoc);
      console.log(`[FaceExtraction] Found ${embeddedImages.length} embedded images.`);

      for (const embedded of embeddedImages) {
        const img = await dataUrlToImage(embedded.url);
        const validated = await validateCandidate(net, img, 'PDF_EMBEDDED_IMAGE');
        if (validated) {
          candidates.push(validated);
        }
      }

      const renderedPdfUrl = await renderPdfToImage(pdfDoc, 3.0); // High res
      if (renderedPdfUrl) {
        const renderedImg = await dataUrlToImage(renderedPdfUrl);
        const format = detectDocumentFormat(renderedImg, file.name);
        globalFormat = format;
        const prior = getSearchRegionPrior(format, renderedImg);
        
        console.log(`[FaceExtraction] PDF Scan Classified as: ${format}`);
        
        let foundWithPrior = false;
        if (prior) {
          const { priorImg, offsetX, offsetY } = await createPriorRegionImage(renderedImg, prior);
          const priorValidated = await validateCandidate(net, priorImg, 'PDF_RENDERED_SCAN_LAYOUT_AWARE');
          if (priorValidated) {
            // Map coordinates back to original full image
            priorValidated.face.topLeft[0] += offsetX;
            priorValidated.face.topLeft[1] += offsetY;
            priorValidated.face.bottomRight[0] += offsetX;
            priorValidated.face.bottomRight[1] += offsetY;
            priorValidated.img = renderedImg; // Restore full image reference for final generous crop
            candidates.push(priorValidated);
            foundWithPrior = true;
          }
        }
        
        // Fallback if prior detection fails or no prior available
        if (!foundWithPrior) {
          const validated = await validateCandidate(net, renderedImg, 'PDF_RENDERED_SCAN_FULL');
          if (validated) {
            candidates.push(validated);
          }
        }
      }
    } else {
      // It's a standard image file
      const img = await fileToImage(file);
      const format = detectDocumentFormat(img, file.name);
      globalFormat = format;
      const prior = getSearchRegionPrior(format, img);
      
      console.log(`[FaceExtraction] Image Classified as: ${format}`);
      
      let foundWithPrior = false;
      if (prior) {
        const { priorImg, offsetX, offsetY } = await createPriorRegionImage(img, prior);
        const priorValidated = await validateCandidate(net, priorImg, 'IMAGE_SCAN_LAYOUT_AWARE');
        if (priorValidated) {
          // Map coordinates back to original full image
          priorValidated.face.topLeft[0] += offsetX;
          priorValidated.face.topLeft[1] += offsetY;
          priorValidated.face.bottomRight[0] += offsetX;
          priorValidated.face.bottomRight[1] += offsetY;
          priorValidated.img = img;
          candidates.push(priorValidated);
          foundWithPrior = true;
        }
      }
      
      if (!foundWithPrior) {
        const validated = await validateCandidate(net, img, 'IMAGE_SCAN_FULL');
        if (validated) {
          candidates.push(validated);
        }
      }
    }

    // SCORING AND SELECTION
    if (candidates.length > 0) {
      if (globalFormat === 'CANADA_PR_CARD') {
        console.log(`\n====================================================`);
        console.log(`CANADA PR CARD PORTRAIT LOGIC:`);
        candidates.forEach((c, i) => {
          const xCenter = (c.face.topLeft[0] + c.face.bottomRight[0]) / 2;
          const normalizedX = xCenter / c.img.width;
          c.location = normalizedX > 0.65 ? 'RIGHT' : 'LEFT';
          if (normalizedX > 0.65) {
             c.type = 'SECONDARY_SECURITY_PORTRAIT';
             c.status = 'REJECTED';
             c.score -= 10.0; // massive penalty to ensure exclusion
          } else {
             c.type = 'PRIMARY_IDENTITY_PORTRAIT';
             c.status = 'SELECTED';
          }
          console.log(`Candidate ${i+1}:`);
          console.log(`Location: ${c.location}`);
          console.log(`Type: ${c.type}`);
          console.log(`Area: ${c.faceRatio > 0.15 ? 'LARGE' : 'SMALL'}`);
          console.log(`Status: ${c.status}`);
        });
      }

      // Sort candidates:
      // 1. PDF Embedded images are best because they are the EXACT original photo bytes
      // 2. High confidence face scores
      candidates.sort((a, b) => {
        if (a.method === 'PDF_EMBEDDED_IMAGE' && b.method !== 'PDF_EMBEDDED_IMAGE') return -1;
        if (b.method === 'PDF_EMBEDDED_IMAGE' && a.method !== 'PDF_EMBEDDED_IMAGE') return 1;
        return b.score - a.score;
      });

      const bestCandidate = candidates[0];
      
      console.log(`\n====================================================`);
      console.log(`DOCUMENT RESOLUTION: ${bestCandidate.img.width}x${bestCandidate.img.height}`);
      console.log(`PHOTO REGIONS FOUND: ${candidates.filter(c => c.method.includes('EMBEDDED')).length}`);
      console.log(`FACE DETECTION ON FULL DOCUMENT: ${candidates.filter(c => c.method.includes('SCAN')).length} faces`);
      console.log(`PORTRAIT CANDIDATES: ${candidates.length}`);
      console.log(`\nSELECTED CANDIDATE:`);
      console.log(`- coordinates: [${Math.round(bestCandidate.face.topLeft[0])}, ${Math.round(bestCandidate.face.topLeft[1])}] to [${Math.round(bestCandidate.face.bottomRight[0])}, ${Math.round(bestCandidate.face.bottomRight[1])}]`);
      console.log(`- confidence: ${Math.round(bestCandidate.score * 100)}%`);
      console.log(`- extraction method: ${bestCandidate.method}`);
      console.log(`FINAL PORTRAIT SAVED: YES`);
      console.log(`====================================================\n`);

      // If it's an embedded image, it IS the portrait. We don't need to crop it.
      if (bestCandidate.method === 'PDF_EMBEDDED_IMAGE') {
        // Just return the exact embedded image!
        const canvas = document.createElement('canvas');
        canvas.width = bestCandidate.img.width;
        canvas.height = bestCandidate.img.height;
        canvas.getContext('2d').drawImage(bestCandidate.img, 0, 0);
        return {
          imageData: canvas.toDataURL('image/jpeg', 0.95),
          confidence: bestCandidate.confidence,
          score: Math.round(bestCandidate.score * 100),
          method: bestCandidate.method,
          source: 'uploaded_document',
          debugCandidates: candidates
        };
      } else {
        // It's a full document scan, we must mathematically crop the face region
        const cropUrl = extractCropFromImage(bestCandidate.img, bestCandidate.face);
        return {
          imageData: cropUrl,
          confidence: bestCandidate.confidence,
          score: Math.round(bestCandidate.score * 100),
          method: bestCandidate.method,
          source: 'uploaded_document',
          debugCandidates: candidates
        };
      }
    }

    // FALLBACK
    console.warn("[FaceExtraction] No faces detected in any candidate. Using fallback.");
    const fallbackCanvas = document.createElement('canvas');
    const fallbackImg = isPdf ? null : await fileToImage(file); // If PDF failed completely, we might not have an image
    
    if (fallbackImg) {
      let cropWidth, cropHeight, cropX, cropY;
      
      if (globalFormat === 'CANADA_PR_CARD') {
        // Strict fallback for Canada PR card: Left 45%, full height
        cropWidth = fallbackImg.width * 0.45;
        cropHeight = fallbackImg.height * 0.90;
        cropX = 0;
        cropY = fallbackImg.height * 0.05;
      } else if (fallbackImg.width > fallbackImg.height) {
        cropHeight = fallbackImg.height * 0.7;
        cropWidth = cropHeight * (3/4);
        cropX = fallbackImg.width * 0.05;
        cropY = fallbackImg.height * 0.15;
      } else {
        cropWidth = fallbackImg.width;
        cropHeight = fallbackImg.height;
        cropX = 0;
        cropY = 0;
      }
      if (cropX + cropWidth > fallbackImg.width) cropWidth = fallbackImg.width - cropX;
      if (cropY + cropHeight > fallbackImg.height) cropHeight = fallbackImg.height - cropY;

      fallbackCanvas.width = cropWidth;
      fallbackCanvas.height = cropHeight;
      fallbackCanvas.getContext('2d').drawImage(fallbackImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
      return {
        imageData: fallbackCanvas.toDataURL('image/jpeg', 0.95),
        confidence: 'LOW',
        score: 0,
        method: 'DOCUMENT_REGION_CANDIDATE',
        source: 'uploaded_document'
      };
    }

    return null;

  } catch (err) {
    console.error("[FaceExtraction] Error during face extraction pipeline:", err);
    return null;
  }
};

