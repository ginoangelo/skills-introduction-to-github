export const LOCATIONS = [
  { id: 'fridge', label: 'Fridge', emoji: '🧊' },
  { id: 'freezer', label: 'Freezer', emoji: '❄️' },
  { id: 'cabinet', label: 'Cabinet', emoji: '🚪' },
];

export const CATEGORY_EMOJI = {
  produce: '🥬', dairy: '🧀', meat: '🍗', seafood: '🦐', grains: '🍞', canned: '🥫',
  condiments: '🫙', spices: '🧂', baking: '🧁', snacks: '🍿', drinks: '🧃', frozen: '🧊', other: '🍽️',
};
export const CATEGORIES = Object.keys(CATEGORY_EMOJI);

const PATHS = {
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  shelf: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16M8 6v0M8 12v0M8 18v0" /></>,
  pan: <><circle cx="10" cy="13" r="6.5" /><path d="M15.5 9.5 21 5" /></>,
  cart: <><path d="M3 4h2.5l2 11h10l2-8H7" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 4-6 8-6s7 1.5 8 6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.500-7 10-7 10z" />,
  clock: <><circle cx="12" cy="12" r="8.500" /><path d="M12 7.500V12l3 2" /></>,
  upload: <path d="M12 16V5M7 9.500 12 5l5 4.500M5 19h14" />,
  spark: <path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z" />,
};

export function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ size = 40 }) {
  return <img src="/icon.svg" width={size} height={size} alt="" className="logo" />;
}

export function Empty({ emoji, title, children }) {
  return (
    <div className="empty">
      <div className="empty-emoji" aria-hidden="true">{emoji}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${dateStr}T00:00:00`) - today) / 864e5);
}

export function ExpiryChip({ expires }) {
  const d = daysUntil(expires);
  if (d === null || d > 5) return null;
  if (d < 0) return <span className="chip chip-tomato">Past date</span>;
  if (d === 0) return <span className="chip chip-tomato">Use today</span>;
  return <span className="chip chip-sun">{d}d left</span>;
}
