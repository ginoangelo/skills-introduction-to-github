import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { PreparedImage } from "./types";

const FULL_EDGE = 1600;
const THUMB_EDGE = 240;

function fit(width: number | undefined, height: number | undefined, edge: number) {
  if (!width || !height) return { width: edge };
  if (Math.max(width, height) <= edge) return { width };
  return width >= height ? { width: edge } : { height: edge };
}

/**
 * Downscale a screenshot for upload and make a thumbnail for history.
 * Nothing leaves the phone except the downscaled JPEG sent to the decode API.
 */
export async function prepareScreenshot(uri: string, width?: number, height?: number): Promise<PreparedImage> {
  const full = await (await ImageManipulator.manipulate(uri).resize(fit(width, height, FULL_EDGE)).renderAsync()).saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.82,
    base64: true,
  });
  const thumb = await (await ImageManipulator.manipulate(uri).resize(fit(width, height, THUMB_EDGE)).renderAsync()).saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  if (!full.base64 || !thumb.base64) throw new Error("That screenshot couldn't be read. Try a different one.");
  return { uri: full.uri, base64: full.base64, thumb: `data:image/jpeg;base64,${thumb.base64}` };
}
