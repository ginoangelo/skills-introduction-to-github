import { StyleSheet, View } from 'react-native';

import type { Clip, Story } from '@/data/types';
import { AudioClip } from './audio-clip';
import { VideoPlaceholder } from './video-placeholder';
import { youtubeEmbedUrl } from './youtube';

/** Website version: a plain YouTube iframe. */
export function ClipPlayer({ clip, story, layer, playing }: { clip: Clip; story: Story; layer: number; playing: boolean }) {
  if (!clip.youtubeId) {
    if (clip.audio?.url) return <AudioClip key={`${clip.audio.url}#${clip.audio.startSeconds ?? 0}`} clip={clip} story={story} playing={playing} />;
    return <VideoPlaceholder story={story} layer={layer} />;
  }
  const src = youtubeEmbedUrl(clip.youtubeId, clip.startSeconds, clip.seconds);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      <iframe
        key={src}
        src={src}
        title={clip.title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
      />
    </View>
  );
}
