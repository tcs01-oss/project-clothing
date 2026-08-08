/**
 * General utility functions for the Tirupati Merchandise storefront and admin dashboard.
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
      
      // Pattern 2: ?id={id} or &id={id} or uc?id={id}
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

      // Pattern 4: any standalone 25+ char drive ID in the link
      const standaloneMatch = cleanedUrl.match(/([a-zA-Z0-9_-]{25,})/);
      if (standaloneMatch && standaloneMatch[1]) {
        const id = standaloneMatch[1].trim();
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
      const fileDMatch = cleanedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        const id = fileDMatch[1].trim();
        return `/api/video-proxy?id=${id}`;
      }
      
      const idMatch = cleanedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        const id = idMatch[1].trim();
        return `/api/video-proxy?id=${id}`;
      }

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

export interface ColorSwatchDetail {
  hex: string;
  label: string;
}

/**
 * Extract color variant swatch details (hex and label) for accessible tooltips
 */
export function getProductColorDetails(p: any): ColorSwatchDetail[] {
  if (!p) return [
    { hex: "#18181B", label: "Onyx Black" },
    { hex: "#D4C5B9", label: "Desert Sand" },
    { hex: "#3F4E3A", label: "Forest Moss" }
  ];

  if (p.colors && Array.isArray(p.colors) && p.colors.length > 0) {
    const colorMap: Record<string, string> = {
      black: "#18181B",
      white: "#FFFFFF",
      offwhite: "#F4F4F5",
      olive: "#4A5568",
      sand: "#D4C5B9",
      beige: "#E5E0D8",
      navy: "#1E293B",
      terracotta: "#B5652F",
      brown: "#573A2E",
      gray: "#71717A",
      grey: "#71717A",
      moss: "#3F4E3A",
    };
    return p.colors.map((c: any) => {
      const name = typeof c === 'string' ? c : (c.name || c.color || "Color Option");
      const lower = name.toLowerCase();
      let hex = "#18181B";
      for (const [k, v] of Object.entries(colorMap)) {
        if (lower.includes(k)) {
          hex = v;
          break;
        }
      }
      return { hex: c.hex || hex, label: name };
    });
  }

  if (p.colorHex) {
    return [
      { hex: p.colorHex, label: p.colorName || p.Colour || "Primary Option" },
      { hex: "#18181B", label: "Onyx Black" },
      { hex: "#E5E0D8", label: "Warm Linen" }
    ].slice(0, 3);
  }

  const cat = (p.category || "").toLowerCase();
  if (cat.includes("footwear") || cat.includes("sneaker")) {
    return [
      { hex: "#18181B", label: "Stealth Black" },
      { hex: "#FFFFFF", label: "Chalk White" },
      { hex: "#B5652F", label: "Terracotta" }
    ];
  }
  if (cat.includes("accessory")) {
    return [
      { hex: "#18181B", label: "Matte Black" },
      { hex: "#573A2E", label: "Mocha Brown" },
      { hex: "#71717A", label: "Slate Gray" }
    ];
  }

  return [
    { hex: "#18181B", label: "Obsidian Black" },
    { hex: "#D4C5B9", label: "Sand Beige" },
    { hex: "#3F4E3A", label: "Olive Moss" }
  ];
}

/**
 * Extract minimal color variant swatches for a given product
 */
export function getProductColorSwatches(p: any): string[] {
  return getProductColorDetails(p).map(s => s.hex);
}
