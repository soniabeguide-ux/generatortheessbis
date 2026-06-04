import { useState } from "react";
import { downloadDocx, downloadPdfHtml, downloadText } from "../export.js";

const NAVY = "#1B2B5E";
const RED = "#C0392B";

export default function StepExport({ articleFR, articleEN, meta, onBack, onReset }) {
  const [status, setStatus] = useState("");

  const langs = [
    { id: "fr", flag: "🇫🇷", label: "Version Française", color: NAVY, article: articleFR, title: meta.title_fr, date: meta.date },
    { id: "en", flag: "🇬🇧", label: "English Version", color: RED, article: articleEN, title: meta.title_en, date: meta.date_en },
  ];

  function handleDocx(lang) {
    const l = langs.find((x) => x.id === lang);
    downloadDocx(l.article, l.title, l.date, lang, meta);
    setStatus("✓ Document Word (.rtf) téléchargé — ouvrir avec Word ou LibreOffice.");
  }

  function handlePdf(lang) {
    const l = langs.find((x) => x.id === lang);
    downloadPdfHtml(l.article, l.title, l.date, lang, meta);
    setStatus("✓ Fichier HTML téléchargé. Ouvre-le dans Chrome/Edge → Ctrl+P → « Enregistrer en PDF ».");
  }

  function handleTxt(lang) {
    const l = langs.find((x) => x.id === lang);
    downloadText(l.article, l.title, lang, meta);
    setStatus("✓ Texte téléchargé.");
  }

  return (
    <div>
      <div style={{ background: "#F0F7F0", border: "1px solid #86EFAC", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <p style={{ fontFamily: "Arial, sans-serif", fontWeight: 600, color: "#14532D", fontSize: 14, margin: 0 }}>Articles générés et validés</p>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "#166534", margin: "2px 0 0" }}>
            {meta.date || ""} · Publication #{meta.article_number || "XXX"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {langs.map((l) => (
          <div key={l.id} style={{ border: `2px solid ${l.color}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: l.color, padding: "12px 16px" }}>
              <p style={{ margin: 0, color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>{l.flag} {l.label}</p>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Arial, sans-serif" }}>
                {(l.title || "").slice(0, 48)}{(l.title || "").length > 48 ? "…" : ""}
              </p>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, background: "#fff" }}>
              <ExportBtn icon="📄" label=".txt — Texte brut" onClick={() => handleTxt(l.id)} style={{ background: "#f5f5f5", color: "#333", border: "1px solid #ddd" }} />
              <ExportBtn icon="📝" label=".rtf — Word / LibreOffice" onClick={() => handleDocx(l.id)} style={{ background: l.color, color: "white", border: "none" }} />
              <ExportBtn icon="📰" label=".html → PDF journal" onClick={() => handlePdf(l.id)} style={{ background: "white", color: l.color, border: `1.5px solid ${l.color}` }} />
            </div>
          </div>
        ))}
      </div>

      {status && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontFamily: "Arial, sans-serif", fontSize: 13, color: "#92400E" }}>
          {status}
        </div>
      )}

      <div style={{ background: "#F8F9FC", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        <strong>💡 Pour le PDF journal :</strong> télécharge le fichier .html → ouvre-le dans Chrome → Ctrl+P → Destination : <em>Enregistrer en PDF</em> → désactive les en-têtes/pieds de page → Imprimer.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontFamily: "Arial, sans-serif", color: "var(--text-muted)" }}>
          ← Modifier les articles
        </button>
        <button onClick={onReset} style={{ background: NAVY, color: "white", border: "none", borderRadius: 8, padding: "11px 26px", fontSize: 14, fontFamily: "Arial, sans-serif", fontWeight: 600 }}>
          + Nouvel article
        </button>
      </div>
    </div>
  );
}

function ExportBtn({ icon, label, onClick, style }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 500, ...style }}>
      <span>{icon}</span>{label}
    </button>
  );
}
