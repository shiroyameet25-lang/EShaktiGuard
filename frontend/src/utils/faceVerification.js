import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const loadVerificationModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    console.log("[FaceVerification] Loading models from CDN...");
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    console.log("[FaceVerification] Models loaded successfully.");
    return true;
  } catch (error) {
    console.error("[FaceVerification] Error loading models:", error);
    return false;
  }
};

/**
 * Generate a face embedding descriptor for a given HTML image or video element
 */
export const getFaceDescriptor = async (mediaElement) => {
  try {
    if (!modelsLoaded) {
      await loadVerificationModels();
    }
    
    // We use ssdMobilenetv1 which requires clear imagery, but yields high accuracy.
    const detection = await faceapi.detectSingleFace(mediaElement)
                                   .withFaceLandmarks()
                                   .withFaceDescriptor();
                                   
    if (!detection) {
      console.warn("[FaceVerification] No face detected by face-api.");
      return null;
    }
    
    return detection.descriptor;
  } catch (error) {
    console.error("[FaceVerification] Error extracting descriptor:", error);
    return null;
  }
};

/**
 * Compares two descriptors and returns the result
 */
export const verifyIdentity = (docDescriptor, liveDescriptor) => {
  if (!docDescriptor || !liveDescriptor) {
    return {
      verified: false,
      distance: 1.0,
      similarityScore: 0,
      status: 'MISSING_DATA'
    };
  }
  
  // Lower distance means more similar. 0.6 is typical threshold for face-api.
  const distance = faceapi.euclideanDistance(docDescriptor, liveDescriptor);
  
  // Threshold can be adjusted. We'll use 0.55 for slightly stricter verification
  const THRESHOLD = 0.55;
  const verified = distance < THRESHOLD;
  
  // Convert distance to a pseudo-percentage similarity score
  // Distance 0 = 100%, Distance 0.6 = ~70%
  const similarityScore = Math.max(0, Math.round((1 - (distance / 1.5)) * 100));
  
  return {
    verified,
    distance,
    similarityScore,
    status: verified ? 'MATCH_VERIFIED' : 'IDENTITY_MISMATCH'
  };
};

export const createHtmlImageFromDataUrl = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for CDN resources if any
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};
