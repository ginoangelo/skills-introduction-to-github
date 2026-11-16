// Recent decodes live in this browser only. No account, no sync, nothing grouped by person.

const KEY = "subtext.recent.v1";
const MAX = 30;

export function loadRecent() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Storage can be full or blocked. The decode still shows; it just won't be remembered.
  }
}

export function addRecent(entry) {
  const list = [entry, ...loadRecent().filter((e) => e.id !== entry.id)];
  save(list);
  return list.slice(0, MAX);
}

export function removeRecent(id) {
  const list = loadRecent().filter((e) => e.id !== id);
  save(list);
  return list;
}

export function clearRecent() {
  save([]);
  return [];
}

const NOTICE_KEY = "subtext.notice.v1";
export function noticeSeen() {
  try {
    return localStorage.getItem(NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}
export function markNoticeSeen() {
  try {
    localStorage.setItem(NOTICE_KEY, "1");
  } catch {
    // ignore
  }
}
