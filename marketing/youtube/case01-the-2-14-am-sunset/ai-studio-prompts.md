# Case 01: Google AI Studio prompts

Everything left to generate for "The 2:14 a.m. sunset," as copy-and-paste prompts for [Google AI Studio](https://aistudio.google.com/). Maya is option B, and the sunset is the story layout.

## Before you start

You'll upload two reference images from [`assets/`](assets/):

| File | What it is | Use it for |
| --- | --- | --- |
| `ref_maya.png` | Maya (option B) | Every Maya image, so she keeps the same face |
| `ref_sunset.png` | Leo's sunset photo | The June photo, so the umbrella matches |

**Which model:**
- **Images:** the Gemini image model (Nano Banana). Attach the reference image with the **+** or image button, then paste the prompt.
- **Video:** Veo. Set **9:16** and **8 seconds**, and attach the start image where it asks for an image or first frame.

Make 2 to 4 versions of each and keep the best. Save each one with the file name shown, so the shot plan finds it.

## Order

1. Image 1, the June photo
2. Image 2, Maya sitting up (the start frame for 2 of the videos)
3. Videos 1, 2, and 3

When the June photo is done, send it back to me. I'll make the "Same umbrella." side-by-side and the camera-roll card from it.

## Image 1: Maya's June beach photo

**Save as:** `ref_june.png` · **Attach:** `ref_sunset.png` · **Shape:** square (1:1)

```
Create a new photo using the yellow and white striped beach umbrella from the attached image. Keep the umbrella's stripes, colors, and shape exactly the same. Make it bright daytime at the beach in June, around noon: the umbrella stands open in the sand, a pink and white striped towel beside it, a pair of flip-flops and a canvas tote bag on the towel, calm sea, a soft hazy peach sky. The long shadows of two people taking the photo fall across the sand in the foreground. Candid vacation photo taken on a phone, slightly imperfect framing, natural light, photorealistic. No people visible, no text, no logos, no watermark. Square 1:1.
```

## Image 2: Maya sitting up in bed

**Save as:** `ref_maya_sitting.png` · **Attach:** `ref_maya.png` · **Shape:** vertical (9:16)

```
Using the woman in the attached image, keep her face, curly dark hair, small gold hoop earrings, and lavender hoodie exactly the same. Create a new photo: late at night she sits up in bed against the headboard, knees pulled to her chest, holding her phone close with both hands, biting her lip, unsure. Her face is lit by the phone's glow. The phone screen faces away from the camera and is not visible. Same bedroom: fairy lights across the wall, photos taped up, warm violet and peach tones. Photorealistic, candid, natural skin texture, slight film grain. She is a fictional person. No text, no logos, no watermark. Vertical 9:16.
```

## Video 1: The pillow (SHOT 05)

**Save as:** `case01_clip_maya_pillow.mp4` · **Start image:** `ref_maya.png`

```
Vertical 9:16, 8 seconds, photorealistic. Start from the attached image and keep the woman exactly the same. She lies in bed at night and taps her phone with her thumb to replay something, her eyes scanning, then exhales through her nose and taps again. The phone's glow flickers softly on her face. Fairy lights stay softly out of focus. Static camera, shallow depth of field. Audio: quiet room tone, two soft taps. Do not show the phone screen. No text, no logos, no captions.
```

## Video 2: Sitting up, unsure (SHOT 09)

**Save as:** `case01_clip_maya_sits_up.mp4` · **Start image:** `ref_maya_sitting.png`

```
Vertical 9:16, 8 seconds, photorealistic. Start from the attached image and keep the woman exactly the same. She sits up in bed holding her phone close, pulls her knees in tighter, glances away toward the window as if thinking, then looks back down at the phone and bites her lip. The phone glow lights her face in violet and peach. Very slow push in. Audio: a blanket rustle, a small breath. Do not show the phone screen. No text, no logos, no captions.
```

## Video 3: Phone face down (SHOT 18)

**Save as:** `case01_clip_maya_phone_down.mp4` · **Start image:** `ref_maya_sitting.png`

```
Vertical 9:16, 8 seconds, photorealistic. Start from the attached image and keep the woman exactly the same. She lets out a long breath, turns her phone face down onto the nightstand so its glow disappears, lies back on the pillow, and closes her eyes with a small, calm smile. Only the fairy lights remain, warm and soft. Static camera. Audio: the phone set down on wood, a long exhale. Do not show the phone screen. No text, no logos, no captions.
```

## If a result looks off

- **Her face changed:** add "Her face must match the attached image exactly" to the start of the prompt and generate again.
- **The phone screen shows:** add "The back of the phone faces the camera" and generate again.
- **The umbrella doesn't match:** add "Copy the umbrella from the attached image; do not invent a new one."
- **Text appears in the image:** add "Absolutely no text or letters anywhere."

When posting, turn on the AI label on each platform, since these are AI-generated people and scenes.
