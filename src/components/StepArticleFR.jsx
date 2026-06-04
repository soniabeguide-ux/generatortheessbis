export default function StepArticleFR({ article, setArticle, onBack, onTranslate, loading }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Article Français — modifiable
        </label>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Arial, sans-serif" }}>
          {article.length} caractères
        </span>
      </div>

      <textarea
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        style={{
          width: "100%", minHeight: 440, padding: "14px", fontSize: 13.5,
          lineHeight: 1.7, borderRadius: 8, border: "1.5px solid #C8A951",
          fontFamily: "'Source Serif 4', Georgia, serif", resize: "vertical",
          background: "var(--surface)", color: "var(--text)", outline: "none",
        }}
      />

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontFamily: "Arial, sans-serif", color: "var(--text-muted)" }}
        >
          ← Retour
        </button>
        <button
          onClick={onTranslate}
          disabled={loading}
          style={{
            background: loading ? "#ccc" : "var(--red)", color: "white", border: "none",
            borderRadius: 8, padding: "12px 32px", fontSize: 15, fontFamily: "Arial, sans-serif",
            fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          {loading ? <><span className="spinner" /> Traduction...</> : "Traduire en anglais →"}
        </button>
      </div>
    </div>
  );
}
