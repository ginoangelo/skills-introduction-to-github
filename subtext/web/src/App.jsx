import { useEffect, useRef, useState } from "react";
import { prepareScreenshot, splitDataUrl } from "./lib/image.js";
import { addRecent, clearRecent, loadRecent, markNoticeSeen, noticeSeen, removeRecent } from "./lib/store.js";
import ResultCard from "./components/ResultCard.jsx";

const VERDICT_CLASS = {
  Likely: "likely",
  Possibly: "possibly",
  Unlikely: "unlikely",
  "Not enough to tell": "unknown",
};

export default function App() {
  const [screen, setScreen] = useState("home"); // home | context | decoding | result
  const [image, setImage] = useState(null); // { full, thumb }
  const [context, setContext] = useState("");
  const [current, setCurrent] = useState(null); // { id, when, thumb, context, result, mode }
  const [recent, setRecent] = useState(() => loadRecent());
  const [error, setError] = useState("");
  const [showNotice, setShowNotice] = useState(() => !noticeSeen());
  const [serverMode, setServerMode] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setServerMode(j.mode))
      .catch(() => setServerMode("offline"));
  }, []);

  async function pickFile(file) {
    if (!file) return;
    setError("");
    try {
      const prepared = await prepareScreenshot(file);
      setImage(prepared);
      setContext("");
      setScreen("context");
    } catch (e) {
      setError(e.message);
    }
  }

  async function decode() {
    if (!image) return;
    setScreen("decoding");
    setError("");
    try {
      const { mediaType, base64 } = splitDataUrl(image.full);
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType, context }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Decode failed (${res.status}).`);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        when: new Date().toISOString(),
        thumb: image.thumb,
        context,
        mode: body.mode,
        result: body.result,
      };
      setCurrent(entry);
      setRecent(addRecent(entry));
      setScreen("result");
    } catch (e) {
      setError(e.message);
      setScreen("context");
    }
  }

  function openRecent(entry) {
    setCurrent(entry);
    setScreen("result");
  }

  function goHome() {
    setScreen("home");
    setImage(null);
    setContext("");
    setCurrent(null);
    setError("");
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    pickFile(file);
  }

  return (
    <div className="shell">
      <header className="top">
        <button className="brand" onClick={goHome} aria-label="Subtext home">
          <span className="mark" aria-hidden="true" />
          <span>
            <strong>Subtext</strong>
            <small>Read between the lines.</small>
          </span>
        </button>
        {serverMode === "sample" && <span className="pill sample" title="No API key configured on the server">sample mode</span>}
        {serverMode === "offline" && <span className="pill offline">server offline</span>}
      </header>

      {showNotice && (
        <div className="notice" role="note">
          <p>
            <strong>Subtext reads posts, not people.</strong> A read is an interpretation with evidence, not a fact. You decide what to do with it.
          </p>
          <button
            className="btn small"
            onClick={() => {
              markNoticeSeen();
              setShowNotice(false);
            }}
          >
            Got it
          </button>
        </div>
      )}

      {screen === "home" && (
        <main className="home">
          <section
            className={`drop ${dragging ? "over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <h1>Is this post about you?</h1>
            <p>Share a screenshot of a post, story, caption, or reply. Get the meaning, whether it is aimed at you, and the evidence.</p>
            <button className="btn primary big" onClick={() => fileInput.current?.click()}>
              Choose a screenshot
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <small className="hint">Or drop one here. Any app, any platform.</small>
            {error && <p className="error">{error}</p>}
          </section>

          <section className="recent">
            <div className="recent-head">
              <h2>Recent decodes</h2>
              {recent.length > 0 && (
                <button className="link" onClick={() => setRecent(clearRecent())}>
                  Clear all
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <p className="muted">Nothing yet. Decodes are kept on this device only.</p>
            ) : (
              <ul className="recent-list">
                {recent.map((e) => (
                  <li key={e.id}>
                    <button className="recent-item" onClick={() => openRecent(e)}>
                      <img src={e.thumb} alt="" />
                      <span className="recent-body">
                        <span className={`verdict ${VERDICT_CLASS[e.result?.aimed_at_you?.verdict] || "unknown"}`}>
                          {e.result?.refused ? "Not read" : e.result?.aimed_at_you?.verdict}
                        </span>
                        <span className="recent-meaning">{e.result?.refused ? e.result.refusal_reason : e.result?.meaning}</span>
                        <span className="recent-when">{formatWhen(e.when)}</span>
                      </span>
                    </button>
                    <button className="icon" aria-label="Delete this decode" onClick={() => setRecent(removeRecent(e.id))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}

      {screen === "context" && image && (
        <main className="context">
          <div className="preview">
            <img src={image.full} alt="Your screenshot" />
          </div>
          <label className="field">
            <span>Add one line of context <em>(optional)</em></span>
            <input
              type="text"
              maxLength={280}
              placeholder="e.g. we stopped talking last week"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") decode();
              }}
            />
            <small>Timing against your context is the strongest signal there is.</small>
          </label>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button className="btn" onClick={goHome}>
              Back
            </button>
            <button className="btn primary" onClick={decode}>
              Decode
            </button>
          </div>
        </main>
      )}

      {screen === "decoding" && (
        <main className="decoding">
          <div className="scan">
            {image && <img src={image.full} alt="" />}
            <div className="scan-line" />
          </div>
          <p>Reading between the lines…</p>
        </main>
      )}

      {screen === "result" && current && (
        <main className="result">
          <ResultCard entry={current} />
          <div className="actions">
            <button className="btn" onClick={goHome}>
              Done
            </button>
            <button className="btn primary" onClick={() => fileInput.current?.click()}>
              Decode another
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </main>
      )}

      <footer className="foot">
        <span>Nothing about the post is stored on a server.</span>
      </footer>
    </div>
  );
}

function formatWhen(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)} min ago`;
  if (diff < 60 * 24) return `${Math.round(diff / 60)} h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
