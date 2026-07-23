/**
 * General utility functions for the Vartman storefront and admin dashboard.
 */

/**
 * Transforms a standard Google Drive sharing/viewing URL into a direct, embeddable image URL.
 * Handles trailing slashes, spaces, query parameters, backslashes, and varying file ID formats.
 * Falls back to the original URL if not a Google Drive link.
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return "";
  
  // Check if we have a locally cached uploaded file for this structured url
  if (typeof window !== "undefined" && url.startsWith("/assets/")) {
    const cached = localStorage.getItem(`cached_img_${url}`);
    if (cached) {
      return cached;
    }
  }
  
  // Clean up any trailing backslashes, slashes, or weird spaces
  let cleanedUrl = url.trim().replace(/\\/g, "");
  
  try {
    if (cleanedUrl.includes("drive.google.com") || cleanedUrl.includes("docs.google.com")) {
      // Pattern 1: /file/d/{id} (most common link)
      const fileDMatch = cleanedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        const id = fileDMatch[1].trim();
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
      
      // Pattern 2: ?id={id} or &id={id}
      const idMatch = cleanedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        const id = idMatch[1].trim();
        return `https://lh3.googleusercontent.com/d/${id}`;
      }

      // Pattern 3: /d/{id}
      const dMatch = cleanedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch && dMatch[1]) {
        const id = dMatch[1].trim();
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
    }
  } catch (e) {
    console.error("Error in getDirectImageUrl parsing:", e);
  }
  
  return cleanedUrl;
}

/**
 * Transforms a standard Google Drive sharing/viewing URL into a direct, embeddable video streaming URL.
 * Falls back to the original URL if not a Google Drive link.
 */
export function getDirectVideoUrl(url: string): string {
  if (!url) return "";
  
  let cleanedUrl = url.trim().replace(/\\/g, "");
  
  try {
    if (cleanedUrl.includes("drive.google.com") || cleanedUrl.includes("docs.google.com")) {
      // Pattern 1: /file/d/{id} (most common link)
      const fileDMatch = cleanedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        const id = fileDMatch[1].trim();
        return `/api/video-proxy?id=${id}`;
      }
      
      // Pattern 2: ?id={id} or &id={id}
      const idMatch = cleanedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        const id = idMatch[1].trim();
        return `/api/video-proxy?id=${id}`;
      }

      // Pattern 3: /d/{id}
      const dMatch = cleanedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch && dMatch[1]) {
        const id = dMatch[1].trim();
        return `/api/video-proxy?id=${id}`;
      }
    }
  } catch (e) {
    console.error("Error in getDirectVideoUrl parsing:", e);
  }
  
  return cleanedUrl;
}

