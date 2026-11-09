import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { Clip, Story } from '@/data/types';
import { VideoPlaceholder } from './video-placeholder';
import { youtubeEmbedUrl } from './youtube';

/**
 * Phone version: plays the clip's YouTube window in a WebView.
 * The iframe sits inside a small HTML page with a base URL, because YouTube
 * refuses embeds that arrive without a referring site.
 */
export function ClipPlayer({ clip, story, layer }: { clip: Clip; story: Story; layer: number }) {
  if (!clip.youtubeId) return <VideoPlaceholder story={story} layer={layer} />;
  const src = youtubeEmbedUrl(clip.youtubeId, clip.startSeconds, clip.seconds);
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}</style>
</head><body><iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></body></html>`;
  return (
    <View style={[StyleSheet.absoluteFill, styles.bg]}>
      <WebView
        key={src}
        source={{ html, baseUrl: 'https://deepernews.app' }}
        style={styles.bg}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({ bg: { flex: 1, backgroundColor: '#000' } });
