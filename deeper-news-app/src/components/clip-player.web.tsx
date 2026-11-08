import { StyleSheet, View } from 'react-native';

import type { Clip } from '@/data/types';
import { VideoPlaceholder } from './video-placeholder';
import { youtubeEmbedUrl } from './youtube';

/** Website version: a plain YouTube iframe. */
export function ClipPlayer({ clip, hue, layer }: { clip: Clip; hue: number; layer: number }) {
  if (!clip.youtubeId) return <VideoPlaceholder hue={hue} layer={layer} />;
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
