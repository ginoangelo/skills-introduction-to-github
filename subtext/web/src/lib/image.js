// Client-side image prep: downscale the screenshot so uploads stay small, and make a thumbnail
// for the recent decodes list. Nothing here leaves the browser except the downscaled JPEG.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be opened as an image."));
    };
    img.src = url;
  });
}

function draw(img, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Returns { full, thumb } as JPEG data URLs. */
export async function prepareScreenshot(file) {
  const img = await loadImage(file);
  return {
    full: draw(img, 1600, 0.85),
    thumb: draw(img, 240, 0.7),
  };
}

export function splitDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new Error("Bad image data.");
  return { mediaType: match[1], base64: match[2] };
}
