/**
 * Reads a pasted YouTube link (or a bare video id) and returns the video id and
 * the start time in seconds. Handles youtube.com/watch, youtu.be, /shorts/,
 * /embed/ and /live/ links, and times like t=74, t=74s, t=1m14s or start=74.
 * Returns null when nothing usable is found.
 */
export function parseYouTubeLink(input: string): { id: string; start: number } | null {
  const text = input.trim();
  if (!text) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return { id: text, start: 0 };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v');
    if (!id) {
      const m = /^\/(shorts|embed|live|v)\/([^/?#]+)/.exec(url.pathname);
      id = m ? m[2] : null;
    }
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;

  const raw = url.searchParams.get('t') ?? url.searchParams.get('start') ?? /(?:^|&)t=([^&]+)/.exec(url.hash.slice(1))?.[1] ?? '';
  return { id, start: parseTime(raw) };
}

/** "74", "74s", "1m14s", "1h2m3s" -> seconds. Anything else -> 0. */
export function parseTime(raw: string): number {
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!m || !raw) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** 74 -> "1:14", 3723 -> "1:02:03". */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
