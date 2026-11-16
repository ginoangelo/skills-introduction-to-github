import { useState } from "react";

const VERDICT_CLASS = {
  Likely: "likely",
  Possibly: "possibly",
  Unlikely: "unlikely",
  "Not enough to tell": "unknown",
};

const LEGIBILITY_NOTE = {
  partial: "Parts of this screenshot were hard to read, so this is a weaker read.",
  poor: "This screenshot was hard to read. Treat this as a rough read and try a clearer shot.",
};

export default function ResultCard({ entry }) {
  const { result, thumb, context, mode } = entry;
  const [copied, setCopied] = useState(false);

  if (result.refused) {
    return (
      <article className="card refused">
        <header className="card-head">
          <img src={thumb} alt="" />
          <div>
            <h2>Not read</h2>
            <p className="muted">{result.refusal_reason}</p>
          </div>
        </header>
      </article>
    );
  }

  const verdict = result.aimed_at_you?.verdict || "Not enough to tell";

  async function copySummary() {
    const lines = [
      "Subtext read",
      `Aimed at you? ${verdict}. ${result.aimed_at_you?.reason || ""}`,
      "",
      `What it means: ${result.meaning}`,
      "",
      "Evidence:",
      ...result.evidence.map((e) => `- ${e.cue}: ${e.why}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; nothing else to do.
    }
  }

  return (
    <article className="card">
      {mode === "sample" && (
        <div className="banner sample">Sample result. Add an API key on the server to decode for real.</div>
      )}
      <header className="card-head">
        <img src={thumb} alt="" />
        <div>
          <span className="eyebrow">{result.platform || "Screenshot"}</span>
          <h2>
            Aimed at you? <span className={`verdict big ${VERDICT_CLASS[verdict] || "unknown"}`}>{verdict}</span>
          </h2>
          <p className="reason">{result.aimed_at_you?.reason}</p>
        </div>
      </header>

      {LEGIBILITY_NOTE[result.legibility] && <p className="legibility">{LEGIBILITY_NOTE[result.legibility]}</p>}

      <section className="part">
        <h3>What it says</h3>
        <p>{result.literal}</p>
      </section>

      <section className="part">
        <h3>What it means</h3>
        <p>{result.meaning}</p>
      </section>

      <section className="part">
        <h3>Evidence</h3>
        <ul className="evidence">
          {result.evidence.map((e, i) => (
            <li key={i}>
              <span className="cue">{e.cue}</span>
              <span className="why">{e.why}</span>
            </li>
          ))}
        </ul>
      </section>

      {result.other_readings?.length > 0 && (
        <section className="part">
          <h3>Other readings</h3>
          <ul className="readings">
            {result.other_readings.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {context && (
        <section className="part context-used">
          <h3>Your context</h3>
          <p>“{context}”</p>
        </section>
      )}

      <footer className="card-foot">
        <span className="muted">An interpretation with evidence, not a fact.</span>
        <button className="link" onClick={copySummary}>
          {copied ? "Copied" : "Copy summary"}
        </button>
      </footer>
    </article>
  );
}
