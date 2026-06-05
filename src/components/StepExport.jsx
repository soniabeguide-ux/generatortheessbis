import { useState, useRef } from "react";
import { downloadDocx, downloadPdfHtml, downloadText } from "../export.js";

const NAVY = "#1B2B5E";
const RED = "#C0392B";

function ThumbnailUpload({ meta }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);
  const artNum = meta?.article_number || "XXX";

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  function handleDownload() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `Miniature_${artNum}.png`;
    a.click();
  }

  return (
    <div style={{ border: "1.5px solid #C8A951", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ background: "#C8A951", padding: "10px 16px" }}>
        <p style={{ margin: 0, color: "white", fontSize: 14, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>
          🖼️ Miniature de l'article
        </p>
        <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Arial, sans-serif" }}>
          Optionnel — uploade ta miniature pour la renommer automatiquement
        </p>
      </div>
      <div style={{ padding: "14px 16px", background: "#fff" }}>
        {!preview ? (
          <>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile}
              style={{ display: "none" }} id="thumb-upload" />
            <label htmlFor="thumb-upload" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              borderRadius: 8, border: "2px dashed #C8A951", cursor: "pointer",
              background: "#FFFBEB", color: "#92400E", fontFamily: "Arial, sans-serif",
              fontSize: 13, fontWeight: 500, justifyContent: "center",
            }}>
              <span style={{ fontSize: 20 }}>📁</span>
              Choisir une image depuis mon ordinateur
            </label>
            <p style={{ margin: "8px 0 0", fontFamily: "Arial, sans-serif", fontSize: 11, color: "var(--text-muted)" }}>
              PNG, JPG acceptés — sera renommée <strong>Miniature_{artNum}.png</strong> au téléchargement
            </p>
          </>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={preview} alt="miniature"
              style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 8px", fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                {fileName}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleDownload} style={{
                  padding: "8px 16px", background: "#C8A951", color: "white", border: "none",
                  borderRadius: 6, fontSize: 13, fontWeight: 600,
                  fontFamily: "Arial, sans-serif", cursor: "pointer",
                }}>
                  ⬇️ Télécharger Miniature_{artNum}.png
                </button>
                <button onClick={() => { setPreview(null); setFileName(""); inputRef.current.value = ""; }}
                  style={{ padding: "8px 12px", background: "none", color: "var(--text-muted)",
                    border: "1px solid var(--border)", borderRadius: 6, fontSize: 12,
                    fontFamily: "Arial, sans-serif", cursor: "pointer" }}>
                  Changer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepExport({ articleFR, articleEN, meta, onBack, onReset }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  const langs = [
    { id: "fr", flag: "🇫🇷", label: "Version Française", color: NAVY, article: articleFR, title: meta.title_fr, date: meta.date },
    { id: "en", flag: "🇬🇧", label: "English Version", color: RED, article: articleEN, title: meta.title_en, date: meta.date_en },
  ];

  async function handle(key, fn) {
    setBusy(key); setStatus("");
    try {
      const res = await fn();
      if (res?.ok === false) setStatus("⚠️ Erreur : " + res.error);
      else setStatus("✓ Téléchargé !");
    } catch(e) { setStatus("⚠️ " + e.message); }
    setBusy("");
  }

  return (
    <div>
      <div style={{ background: "#F0F7F0", border: "1px solid #86EFAC", borderRadius: 10,
        padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <p style={{ fontFamily: "Arial, sans-serif", fontWeight: 600, color: "#14532D", fontSize: 14, margin: 0 }}>
            Articles générés et validés
          </p>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "#166534", margin: "2px 0 0" }}>
            {meta.date || ""} · Publication #{meta.article_number || "XXX"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {langs.map(l => (
          <div key={l.id} style={{ border: `2px solid ${l.color}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: l.color, padding: "12px 16px" }}>
              <p style={{ margin: 0, color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>
                {l.flag} {l.label}
              </p>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Arial, sans-serif" }}>
                {(l.title || "").slice(0, 50)}{(l.title||"").length > 50 ? "…" : ""}
              </p>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, background: "#fff" }}>
              <Btn icon="📄" label=".txt — Texte brut" busy={busy === l.id+"txt"}
                onClick={() => handle(l.id+"txt", () => { downloadText(l.article, l.title, l.id, meta); return {ok:true}; })}
                style={{ background: "#f5f5f5", color: "#333", border: "1px solid #ddd" }} />
              <Btn icon="📝" label=".docx — Word" busy={busy === l.id+"docx"}
                onClick={() => handle(l.id+"docx", () => downloadDocx(l.article, l.title, l.date, l.id, meta))}
                style={{ background: l.color, color: "white", border: "none" }} />
              <Btn icon="📰" label=".html → PDF journal" busy={busy === l.id+"pdf"}
                onClick={() => handle(l.id+"pdf", () => { downloadPdfHtml(l.article, l.title, l.date, l.id, meta); return {ok:true}; })}
                style={{ background: "white", color: l.color, border: `1.5px solid ${l.color}` }} />
            </div>
          </div>
        ))}
      </div>

      <ThumbnailUpload meta={meta} />

      {status && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8,
          padding: "10px 14px", marginBottom: 14, fontFamily: "Arial, sans-serif", fontSize: 13, color: "#92400E" }}>
          {status}
        </div>
      )}

      <div style={{ background: "#F8F9FC", borderRadius: 8, padding: "10px 14px", marginBottom: 16,
        fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        <strong>💡 PDF journal :</strong> Ouvre le .html dans Chrome → Ctrl+P → <em>Enregistrer en PDF</em> → désactive les en-têtes/pieds de page.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid var(--border)",
          borderRadius: 8, padding: "10px 22px", fontSize: 14, fontFamily: "Arial, sans-serif",
          color: "var(--text-muted)", cursor: "pointer" }}>
          ← Modifier
        </button>
        <button onClick={onReset} style={{ background: NAVY, color: "white", border: "none",
          borderRadius: 8, padding: "11px 26px", fontSize: 14, fontFamily: "Arial, sans-serif",
          fontWeight: 600, cursor: "pointer" }}>
          + Nouvel article
        </button>
      </div>
    </div>
  );
}

function Btn({ icon, label, onClick, style, busy }) {
  return (
    <button onClick={onClick} disabled={!!busy}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
        borderRadius: 6, cursor: busy ? "not-allowed" : "pointer",
        fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 500,
        opacity: busy ? 0.6 : 1, width: "100%", ...style }}>
      {busy ? <span className="spinner spinner-dark" /> : <span>{icon}</span>}
      {label}
    </button>
  );
}
