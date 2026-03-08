// ─── OCR / Barcode Utilities ─────────────────────────────────────────────────
//
// Tesseract.js is loaded via CDN in index.html (window.Tesseract).
//
// TODO (iOS): When migrating to React Native, replace Tesseract with
// the native Vision framework via expo-camera or react-native-vision-camera.
// The extractSerial logic below stays the same — only the image capture changes.

/**
 * Extracts all 4–10 digit numbers found in raw OCR text.
 * Used to identify Globus instrument serial numbers.
 */
export const extractSerial = (text) =>
  [...text.replace(/[^0-9\n ]/g, " ").matchAll(/\b(\d{4,10})\b/g)].map((m) => m[1]);

/**
 * Runs Tesseract OCR on an image File and returns all candidate serial numbers.
 * @param {File} file - Image file from a camera input or file picker.
 * @returns {Promise<string[]>} Array of extracted number strings.
 */
export const runOCR = async (file) => {
  if (!file) return [];
  if (!window.Tesseract) throw new Error("OCR not loaded — enter manually.");

  const url    = URL.createObjectURL(file);
  const img    = new Image();
  img.src      = url;
  await new Promise((r) => { img.onload = r; });

  const canvas = document.createElement("canvas");
  canvas.width  = img.width;
  canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  const worker = await window.Tesseract.createWorker("eng");
  await worker.setParameters({ tessedit_pageseg_mode: "11" });
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  return extractSerial(text);
};

/**
 * Extracts FedEx / shipping tracking numbers (10–22 digit sequences).
 */
export const extractTracking = (raw) => {
  const clean = raw.replace(/\D/g, "");
  const m = clean.match(/(?:96|94|92|93)\d{18,20}|(\d{12}|\d{15}|\d{20})/);
  return m ? m[0] : null;
};
