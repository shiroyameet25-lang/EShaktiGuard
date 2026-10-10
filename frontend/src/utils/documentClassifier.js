export const DOCUMENT_TYPES = {
  ID_CARD: 'ID_CARD',
  PASSPORT: 'PASSPORT',
  CANADA_PR_CARD: 'CANADA_PR_CARD',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Classifies a document image based on its aspect ratio and orientation.
 * 
 * Standard ID Card (Aadhaar, DL): typically 85.60 × 53.98 mm (Ratio ~1.58)
 * Passport Biodata Page: typically B7 size or similar (Ratio ~1.41)
 * 
 * @param {HTMLImageElement} img 
 * @param {string} filename Optional filename to mock OCR text extraction
 * @returns {string} The detected DOCUMENT_TYPE
 */
export const detectDocumentFormat = (img, filename = '') => {
  if (!img || !img.width || !img.height) return DOCUMENT_TYPES.UNKNOWN;

  const isLandscape = img.width > img.height;
  const longSide = isLandscape ? img.width : img.height;
  const shortSide = isLandscape ? img.height : img.width;
  
  const ratio = longSide / shortSide;
  
  console.log(`[DocumentClassifier] Dimension: ${img.width}x${img.height}, Ratio: ${ratio.toFixed(2)}, isLandscape: ${isLandscape}, File: ${filename}`);

  // Mock OCR check via filename
  const fnameLower = filename.toLowerCase();
  const isCanadaPR = fnameLower.includes('canada') || fnameLower.includes('pr_card') || fnameLower.includes('permanent_resident');
  
  if (isCanadaPR && isLandscape) {
    return DOCUMENT_TYPES.CANADA_PR_CARD;
  }

  // ID Cards (Aadhaar etc) are usually between 1.50 and 1.68 ratio
  if (ratio >= 1.50 && ratio <= 1.75) {
    return DOCUMENT_TYPES.ID_CARD;
  }
  
  // Passport biodata pages are usually between 1.35 and 1.49
  if (ratio >= 1.35 && ratio < 1.50) {
    return DOCUMENT_TYPES.PASSPORT;
  }
  
  return DOCUMENT_TYPES.UNKNOWN;
};

/**
 * Returns a normalized bounding box [x, y, width, height] (values between 0.0 and 1.0)
 * representing the expected region where the portrait photo resides.
 * 
 * @param {string} format The DOCUMENT_TYPE
 * @param {HTMLImageElement} img The image to check orientation
 * @returns {Array<number>|null} Normalized coords [x, y, w, h] or null if unknown
 */
export const getSearchRegionPrior = (format, img) => {
  if (!img || format === DOCUMENT_TYPES.UNKNOWN) return null;
  
  const isLandscape = img.width > img.height;

  if (format === DOCUMENT_TYPES.CANADA_PR_CARD) {
    if (isLandscape) {
      return [0.0, 0.10, 0.45, 0.90]; // Left 45%, full height minus edges
    }
    // Fallback if rotated
    return [0.10, 0.0, 0.90, 0.45]; 
  }

  if (format === DOCUMENT_TYPES.ID_CARD) {
    if (isLandscape) {
      // Aadhaar/ID photo is typically on the left side, occupying a small portion
      // We widen the search area a bit just in case
      return [0.0, 0.05, 0.45, 0.90]; // x, y, width, height
    } else {
      // If it's portrait but has an ID ratio, it might be a vertically rotated card
      // In a vertical card, the photo is usually near the top
      return [0.05, 0.0, 0.90, 0.45];
    }
  }

  if (format === DOCUMENT_TYPES.PASSPORT) {
    if (isLandscape) {
      // Passport biodata page in landscape: photo is typically bottom left, above MRZ
      // MRZ takes bottom 20-30%. Photo is on the left.
      return [0.0, 0.15, 0.45, 0.65];
    } else {
      // Passport biodata page in portrait
      return [0.0, 0.20, 0.60, 0.55];
    }
  }

  return null;
};
