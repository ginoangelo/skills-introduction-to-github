// Shared timing helpers for Subtext videos. Each scene defines window.render(t).
const $ = (id) => document.getElementById(id);
const clamp = (x) => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (x) => { const c = 1.70158; const y = clamp(x) - 1; return 1 + (c + 1) * y * y * y + c * y * y; };

/** Show one caption at a time from a list of [start, end, text]. */
function captions(t, list) {
  let text = "", alpha = 0, lift = 0;
  for (const [a, b, c] of list) {
    if (t >= a && t < b) {
      text = c;
      alpha = Math.min(seg(t, a, a + 0.25), 1 - seg(t, b - 0.2, b));
      lift = (1 - ease(seg(t, a, a + 0.3))) * 24;
    }
  }
  $("captionText").textContent = text;
  $("caption").style.opacity = text ? alpha : 0;
  $("caption").style.transform = `translateY(${lift}px)`;
}

/** Fade in the brand end card starting at time `from`. */
function endCard(t, from) {
  const e = ease(seg(t, from, from + 0.6));
  $("end").style.opacity = e;
  $("end").style.transform = `scale(${1.04 - 0.04 * e})`;
  $("note").style.opacity = e;
}

const END_CARD = `<div id="end"><div class="mark"></div><div class="name">Subtext</div><div class="tag">Read between the lines.</div><div class="cta">Try it free</div></div>`;
