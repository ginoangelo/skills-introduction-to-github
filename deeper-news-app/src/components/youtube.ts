/** Builds a privacy-friendly YouTube embed URL that plays one clip window. */
export function youtubeEmbedUrl(videoId: string, startSeconds = 0, seconds?: number): string {
  const start = Math.max(0, Math.floor(startSeconds));
  const params = new URLSearchParams({
    start: String(start),
    autoplay: '1',
    // Browsers only allow autoplay when muted; viewers unmute with YouTube's own control.
    mute: '1',
    playsinline: '1',
    rel: '0',
  });
  if (seconds) params.set('end', String(start + Math.ceil(seconds)));
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}
