import { useState } from "react";
import { callClaude } from "../api.js";
import { SYSTEM_SEO } from "../prompts.js";

const CATEGORIES = [
  "FAMILLE & SAGESSE", "FOI & SURNATUREL", "PRIÈRE & INTERCESSION",
  "IDENTITÉ & DESTINÉE", "MARIAGE & COUPLE", "FINANCES & PROSPÉRITÉ",
  "LEADERSHIP & SERVICE", "ÉVANGÉLISATION", "LOUANGE & ADORATION", "AUTRE",
];

export default function StepNotes({ onGenerate, loading }) {
  const today = new Date().toISOString().split("T")[0];
  const [inputMode, setInputMode] = useState("structured");
  const [form, setForm] = useState({
    date: today, articleNum: "", category: "FAMILLE & SAGESSE", preacher: "Dr. Raoul Wafo",
    youtube1: "", youtube2: "", prayerTopics: "",
    themeFR: "", themeEN: "",
    intro: "", notesI: "", notesII: "", notesIII: "", notesIV: "",
    citations: "", conclusion: "",
  });
  const [freeText, setFreeText] = useState("");
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [loadingSEO, setLoadingSEO] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSEO() {
    if (!form.themeFR.trim() && !form.themeEN.trim()) return;
    setLoadingSEO(true);
    setSeoSuggestions(null);
    try {
      const prompt = `Thème FR : ${form.themeFR || "(non fourni)"}
Thème EN : ${form.themeEN || "(non fourni)"}
Catégorie : ${form.category}`;
      const raw = await callClaude(SYSTEM_SEO, prompt, 600);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setSeoSuggestions(parsed);
    } catch (e) {
      setSeoSuggestions({ error: "Erreur : " + e.message });
    }
    setLoadingSEO(false);
  }

  function buildNotes() {
    const d = new Date(form.date);
    const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (inputMode === "free") return `Date : ${dateStr}\n\n${freeText}`;
    return `Date : ${dateStr}
Numéro d'article : ${form.articleNum || "XXX"}
Catégorie : ${form.category}
Prédicateur : ${form.preacher}
${form.themeFR ? `Thème FR : ${form.themeFR}` : ""}
${form.themeEN ? `Thème EN : ${form.themeEN}` : ""}
${form.youtube1 ? `Lien YouTube principal : ${form.youtube1}` : ""}
${form.youtube2 ? `Lien YouTube 2ème message : ${form.youtube2}` : ""}
${form.prayerTopics ? `Sujets de prière : ${form.prayerTopics}` : ""}
${form.intro ? `\nIntroduction :\n${form.intro}` : ""}

I — Notes :
${form.notesI}

II — Notes :
${form.notesII}

III — Notes :
${form.notesIII}
${form.notesIV ? `\nIV — Notes :\n${form.notesIV}` : ""}

Citations importantes :
${form.citations}

Conclusion :
${form.conclusion}`;
  }

  const canSubmit = inputMode === "free"
    ? freeText.trim().length > 50
    : form.notesI.trim() && form.notesII.trim() && form.notesIII.trim() && form.citations.trim();

  const inp = {
    width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
    border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)",
    fontFamily: "Arial, sans-serif", outline: "none", boxSizing: "border-box",
  };
  const lbl = (txt, req) => (
    <label style={{ display: "block", fontFamily: "Arial, sans-serif", fontSize: 11,
      fontWeight: 700, color: "var(--navy)", textTransform: "uppercase",
      letterSpacing: "0.7px", marginBottom: 6 }}>
      {txt}{req && <span style={{ color: "var(--red)" }}> *</span>}
    </label>
  );
  const sec = (icon, title, children) => (
    <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)",
      borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 700,
        color: "var(--navy)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
  const ta = (k, placeholder, rows = 3) => (
    <textarea value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
      rows={rows} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
      onFocus={e => e.target.style.borderColor = "var(--navy)"}
      onBlur={e => e.target.style.borderColor = "var(--border)"} />
  );
  const ti = (k, placeholder, type = "text") => (
    <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
      placeholder={placeholder} style={inp}
      onFocus={e => e.target.style.borderColor = "var(--navy)"}
      onBlur={e => e.target.style.borderColor = "var(--border)"} />
  );

  return (
    <div>
      {/* Section infos */}
      {sec("📅", "Informations du dimanche",
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>{lbl("Date du culte")}<input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = "var(--navy)"} onBlur={e => e.target.style.borderColor = "var(--border)"} /></div>
          <div>{lbl("Numéro d'article")}<input type="number" value={form.articleNum} onChange={e => set("articleNum", e.target.value)} placeholder="076" min="1" style={inp} onFocus={e => e.target.style.borderColor = "var(--navy)"} onBlur={e => e.target.style.borderColor = "var(--border)"} /></div>
          <div>{lbl("Catégorie")}<select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inp, cursor: "pointer" }}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Prédicateur")}{ti("preacher", "Dr. Raoul Wafo")}</div>
          <div>{lbl("YouTube — Message principal")}{ti("youtube1", "https://youtube.com/watch?v=...", "url")}</div>
          <div>{lbl("YouTube — 2ème message (opt.)")}{ti("youtube2", "https://youtube.com/watch?v=...", "url")}</div>
          <div style={{ gridColumn: "1/-1" }}>{lbl("Sujets de prière (optionnel)")}{ti("prayerTopics", "Ex : Les familles, Les malades, Les nations...")}</div>
        </div>
      )}

      {/* Section thème + SEO */}
      {sec("🎯", "Thème & Suggestions de titres SEO",
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              {lbl("Thème de l'article en Français")}
              <input type="text" value={form.themeFR} onChange={e => set("themeFR", e.target.value)}
                placeholder="Ex : La puissance de la louange dans l'adversité"
                style={inp} onFocus={e => e.target.style.borderColor = "var(--navy)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
            <div>
              {lbl("Thème de l'article en Anglais")}
              <input type="text" value={form.themeEN} onChange={e => set("themeEN", e.target.value)}
                placeholder="Ex : The power of praise in adversity"
                style={inp} onFocus={e => e.target.style.borderColor = "var(--navy)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
          </div>
          <button onClick={handleSEO} disabled={loadingSEO || (!form.themeFR.trim() && !form.themeEN.trim())}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px",
              background: loadingSEO || (!form.themeFR.trim() && !form.themeEN.trim()) ? "#ccc" : "var(--navy)",
              color: "white", border: "none", borderRadius: 7, fontSize: 13,
              fontFamily: "Arial, sans-serif", fontWeight: 600, cursor: "pointer" }}>
            {loadingSEO ? <><span className="spinner" /> Génération SEO...</> : "✨ Générer 5 suggestions de titres SEO"}
          </button>

          {seoSuggestions && !seoSuggestions.error && (
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {["fr", "en"].map(lang => (
                <div key={lang}>
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700,
                    color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                    {lang === "fr" ? "🇫🇷 Titres FR" : "🇬🇧 Titres EN"}
                  </p>
                  {(seoSuggestions[lang] || []).map((t, i) => (
                    <div key={i} onClick={() => lang === "fr" ? set("themeFR", t) : set("themeEN", t)}
                      style={{ padding: "8px 12px", marginBottom: 6, borderRadius: 6,
                        border: "1px solid var(--border)", background: "var(--bg)",
                        fontSize: 13, fontFamily: "Georgia, serif", cursor: "pointer",
                        color: "var(--navy)", transition: "background .15s",
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EEF1F8"}
                      onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}>
                      <span style={{ color: "#C8A951", fontWeight: 700, marginRight: 6 }}>{i+1}.</span>
                      {t}
                    </div>
                  ))}
                </div>
              ))}
              <p style={{ gridColumn: "1/-1", fontFamily: "Arial, sans-serif", fontSize: 11,
                color: "var(--text-muted)", marginTop: 4 }}>
                💡 Clique sur un titre pour le copier dans le champ thème
              </p>
            </div>
          )}
          {seoSuggestions?.error && (
            <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "Arial, sans-serif", marginTop: 8 }}>
              {seoSuggestions.error}
            </p>
          )}
        </>
      )}

      {/* Mode toggle */}
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid var(--border)", marginBottom: 16 }}>
        {[{ id: "structured", label: "✍️ Par rubriques" }, { id: "free", label: "📋 Bloc libre" }].map(m => (
          <button key={m.id} onClick={() => setInputMode(m.id)} style={{
            flex: 1, padding: "10px 0", border: "none",
            background: inputMode === m.id ? "var(--navy)" : "var(--bg)",
            color: inputMode === m.id ? "white" : "var(--text-muted)",
            fontSize: 14, fontFamily: "Arial, sans-serif", fontWeight: 600, cursor: "pointer",
          }}>{m.label}</button>
        ))}
      </div>

      {inputMode === "free" ? (
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
            📋 Colle toutes tes notes en un seul bloc
          </div>
          <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
            placeholder={"Points clés, citations, versets, conclusion… tout d'un coup."}
            rows={14} style={{ ...inp, resize: "vertical", lineHeight: 1.65 }}
            onFocus={e => e.target.style.borderColor = "var(--navy)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
      ) : (
        <>
          {sec("📝", "Notes du message",
            <>
              <div style={{ marginBottom: 14 }}>{lbl("Introduction (optionnel)")}{ta("intro", "Contexte du message, occasion, accroche...", 2)}</div>
              {[
                { key: "notesI", label: "Partie I", req: true },
                { key: "notesII", label: "Partie II", req: true },
                { key: "notesIII", label: "Partie III", req: true },
                { key: "notesIV", label: "Partie IV (optionnel)", req: false },
              ].map(({ key, label: l, req }) => (
                <div key={key} style={{ marginBottom: 14 }}>{lbl(l, req)}{ta(key, "Notes, versets, points clés...", 3)}</div>
              ))}
            </>
          )}
          {sec("💬", "Citations & Conclusion",
            <>
              <div style={{ marginBottom: 14 }}>{lbl("Citations importantes", true)}{ta("citations", "«Le bonheur ne vient pas d'autrui...»", 4)}</div>
              <div>{lbl("Idées pour la conclusion")}{ta("conclusion", "Message final, verset de clôture...", 3)}</div>
            </>
          )}
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => onGenerate(buildNotes(), form)} disabled={!canSubmit || loading}
          style={{ background: !canSubmit || loading ? "#ccc" : "var(--navy)", color: "white",
            border: "none", borderRadius: 8, padding: "13px 36px", fontSize: 15,
            fontFamily: "Arial, sans-serif", fontWeight: 700, cursor: !canSubmit || loading ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 8 }}>
          {loading ? <><span className="spinner" /> Génération...</> : "Générer l'article FR →"}
        </button>
      </div>
    </div>
  );
}
