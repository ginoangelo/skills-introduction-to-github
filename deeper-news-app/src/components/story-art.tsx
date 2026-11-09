import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { STORY_IMAGES } from '@/data/story-images';
import type { Story } from '@/data/types';
import { storyColor } from '@/theme/tokens';

/**
 * A story's picture: its photo when it has one, otherwise its color.
 * `dim` darkens the photo so white text on top stays readable.
 */
export function StoryArt({
  story,
  style,
  dim = 0,
  children,
}: {
  story: Story;
  style?: StyleProp<ViewStyle>;
  dim?: number;
  children?: ReactNode;
}) {
  const art = STORY_IMAGES[story.id];
  return (
    <View style={[{ backgroundColor: storyColor(story.hue), overflow: 'hidden' }, style]}>
      {art && (
        <Image
          source={art.source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessibilityLabel={art.alt}
        />
      )}
      {art && dim > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />}
      {children}
    </View>
  );
}
