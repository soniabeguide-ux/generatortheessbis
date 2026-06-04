import { useState } from "react";

export default function StepBilingual({ articleFR, setArticleFR, articleEN, setArticleEN, onBack, onValidate, loading }) {
  const [tab, setTab] = useState("fr");

  return (
    <div>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid var(--border)", marginBottom: 12 }}>
        {[
          { id: "fr", label: "🇫🇷 Français" },
          { id: "en", label: "🇬🇧 English" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "10px 0", border: "none",
              background: tab === t.id ? "var(--navy)" : "var(--bg)",
              color: tab === t.id ? "white" : "var(--text-muted)",
              fontSize: 14, fontFamily: "Arial, sans-serif", fontWeight: 600,
              transition: "background .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "fr" && (
        <textarea
          value={articleFR}
          onChange={(e) => setArticleFR(e.target.value)}
          style={{
            width: "100%", minHeight: 420, padding: "14px", fontSize: 13.5,
            lineHeight: 1.7, borderRadius: 8, border: "1.5px solid #C8A951",
            fontFamily: "'Source Serif 4', Georgia, serif", resize: "vertical",
            background: "var(--surface)", color: "var(--text)", outline: "none",
          }}
        />
      )}
      {tab === "en" && (
        <textarea
          value={articleEN}
          onChange={(e) => setArticleEN(e.target.value)}
          style={{
            width: "100%", minHeight: 420, padding: "14px", fontSize: 13.5,
            lineHeight: 1.7, borderRadius: 8, border: "1.5px solid var(--border)",
            fontFamily: "'Source Serif 4', Georgia, serif", resize: "vertical",
            background: "var(--surface)", color: "var(--text)", outline: "none",
          }}
        />
      )}

      <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Arial, sans-serif", marginTop: 6 }}>
        Modifie librement les deux versions avant de valider.
      </p>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontFamily: "Arial, sans-serif", color: "var(--text-muted)" }}
        >
          ← Retour
        </button>
        <button
          onClick={onValidate}
          disabled={loading}
          style={{
            background: loading ? "#ccc" : "#C8A951", color: "white", border: "none",
            borderRadius: 8, padding: "12px 32px", fontSize: 15, fontFamily: "Arial, sans-serif",
            fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          {loading ? <><span className="spinner" /> Extraction des métadonnées...</> : "✓ Valider et exporter"}
        </button>
      </div>
    </div>
  );
}
