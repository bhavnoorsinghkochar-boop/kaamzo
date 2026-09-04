/**
 * Image processing, compression, and error-resilient utility functions.
 * Prevents large file crashes, base64 heap overflows, and rendering blank screens.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: string; // image/jpeg, image/webp, image/png
}

/**
 * Resizes and compresses an image file using an offscreen canvas.
 * Reduces 10MB+ phone camera images to smooth, lightweight ~80-150KB base64 payloads.
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // Basic file type check
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image."));
    }

    // Try URL.createObjectURL first (fast & low-memory), fallback to FileReader
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // Fallback
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    const cleanUp = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          cleanUp();
          return reject(new Error("Invalid image dimensions."));
        }

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas for compression
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanUp();
          return reject(new Error("Could not initialize canvas context."));
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed data URL
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        cleanUp();
        resolve(compressedDataUrl);
      } catch (err: any) {
        cleanUp();
        // If canvas fails (e.g. security origin), fallback to basic FileReader
        readRawFileReader(file).then(resolve).catch(reject);
      }
    };

    img.onerror = () => {
      cleanUp();
      // Fallback to basic file reader
      readRawFileReader(file)
        .then(resolve)
        .catch(() => reject(new Error("Failed to load and decode image.")));
    };

    if (objectUrl) {
      img.src = objectUrl;
    } else {
      readRawFileReader(file)
        .then((dataUrl) => {
          img.src = dataUrl;
        })
        .catch(reject);
    }
  });
}

/**
 * Direct file reader fallback
 */
function readRawFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file data."));
      }
    };
    reader.onerror = () => {
      reject(new Error("File reader encountered an error reading the file."));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Worker Avatar Presets for instant photo selection
 */
export const WORKER_AVATAR_PRESETS = [
  {
    id: "avatar-1",
    label: "Mason / Builder",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-2",
    label: "Senior Plumber",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-3",
    label: "Master Electrician",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-4",
    label: "Professional Painter",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-5",
    label: "Carpenter & Artisan",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-6",
    label: "Site Supervisor",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  },
];
