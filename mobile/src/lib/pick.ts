import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { prepareScreenshot } from "./image";
import type { PreparedImage } from "./types";

/** Open the photo library, prepare the chosen screenshot, and go to the context step. */
export async function pickAndStart(setPending: (img: PreparedImage) => void): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1, allowsEditing: false });
  if (res.canceled || !res.assets?.[0]) return null;
  return startFromUri(res.assets[0].uri, setPending, res.assets[0].width, res.assets[0].height);
}

export async function startFromUri(
  uri: string,
  setPending: (img: PreparedImage) => void,
  width?: number,
  height?: number,
): Promise<string | null> {
  try {
    setPending(await prepareScreenshot(uri, width, height));
    router.push("/decode");
    return null;
  } catch (e) {
    return (e as Error).message || "That file couldn't be opened as an image.";
  }
}
