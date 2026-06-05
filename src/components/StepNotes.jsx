import { useState } from "react";

const CATEGORIES = [
  "FAMILLE & SAGESSE", "FOI & SURNATUREL", "PRIÈRE & INTERCESSION",
  "IDENTITÉ & DESTINÉE", "MARIAGE & COUPLE", "FINANCES & PROSPÉRITÉ",
  "LEADERSHIP & SERVICE", "ÉVANGÉLISATION", "LOUANGE & ADORATION", "AUTRE",
];

export default function StepNotes({ onGenerate, loading }) {
  const today = new Date().toISOString().split("T")[0];
  const [inputMode, setInputMode] = useState("structured"); // "structured" | "free"
  const [form, setForm] = useState({
    date: today, articleNum: "", category: "FAMILLE & SAGESSE", preacher: "Dr. Raoul Wafo",
    youtube1: "", youtube2: "", prayerTopics: "",
    intro: "", notesI: "", notesII: "", notesIII: "", notesIV: "",
    citations: "", conclusion: "",
  });
  const [freeText, setFreeText] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function buildNotes() {
    const d = new Date(form.date);
    const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (inputMode === "free") return freeText;
    return `Date : ${dateStr}
Numéro d'article : ${form.articleNum || "XXX"}
Catégorie : ${form.category}
Prédicateur : ${form.preacher}
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

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
    border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)",
    fontFamily: "Arial, sans-serif", outline: "none", boxSizing: "border-box",
    transition: "border-color .2s",
  };
  const label = (txt, req) => (
    <label style={{ display: "block", fontFamily: "Arial, sans-serif", fontSize: 11,
      fontWeight: 700, color: "var(--navy)", textTransform: "uppercase",
      letterSpacing: "0.7px", marginBottom: 6 }}>
      {txt} {req && <span style={{ color: "var(--red)" }}>*</span>}
    </label>
  );
  const section = (icon, title, children) => (
    <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)",
      borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 700,
        color: "var(--navy)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
  const fo = (k, placeholder, rows=1) => (
    <textarea value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
      rows={rows} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
      onFocus={e => e.target.style.borderColor="var(--navy)"}
      onBlur={e => e.target.style.borderColor="var(--border)"} />
  );
  const fi = (k, placeholder, type="text") => (
    <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
      placeholder={placeholder} style={inputStyle}
      onFocus={e => e.target.style.borderColor="var(--navy)"}
      onBlur={e => e.target.style.borderColor="var(--border)"} />
  );

  return (
    <div>
      {/* Info section — always shown */}
      {section("📅", "Informations du dimanche",
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>{label("Date du culte")}<input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor="var(--navy)"} onBlur={e => e.target.style.borderColor="var(--border)"} /></div>
          <div>{label("Numéro d'article")}<input type="number" value={form.articleNum} onChange={e => set("articleNum", e.target.value)} placeholder="075" min="1" style={inputStyle} onFocus={e => e.target.style.borderColor="var(--navy)"} onBlur={e => e.target.style.borderColor="var(--border)"} /></div>
          <div>{label("Catégorie")}<select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div>{label("Prédicateur")}{fi("preacher", "Dr. Raoul Wafo")}</div>
          <div>{label("YouTube — Message principal")}{fi("youtube1", "https://youtube.com/watch?v=...", "url")}</div>
          <div>{label("YouTube — 2ème message (opt.)")}{fi("youtube2", "https://youtube.com/watch?v=...", "url")}</div>
          <div style={{ gridColumn: "1 / -1" }}>{label("Sujets de prière (optionnel)")}{fi("prayerTopics", "Ex : Les familles, Les malades, Les nations...")}</div>
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid var(--border)", marginBottom: 16 }}>
        {[
          { id: "structured", label: "✍️ Par rubriques" },
          { id: "free", label: "📋 Bloc libre" },
        ].map(m => (
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
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Titre, points clés, citations, versets, conclusion… tout d'un coup, Claude structurera.
          </p>
          <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
            placeholder={"Exemple :\nTitre : La puissance de la louange\nI — Louer avant de voir le miracle\n- Josaphat en 2 Chron 20...\nCitation Wafo : «Quand tu loues tu proclames...»\n..."}
            rows={14} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
            onFocus={e => e.target.style.borderColor="var(--navy)"}
            onBlur={e => e.target.style.borderColor="var(--border)"} />
        </div>
      ) : (
        <>
          {section("📝", "Notes du message",
            <>
              <div style={{ marginBottom: 14 }}>{label("Introduction (optionnel)")}{fo("intro", "Contexte du message, occasion, accroche...", 2)}</div>
              {[
                { key: "notesI", label: "Partie I — Points clés, versets", req: true },
                { key: "notesII", label: "Partie II — Points clés, versets", req: true },
                { key: "notesIII", label: "Partie III — Points clés, versets", req: true },
                { key: "notesIV", label: "Partie IV (optionnel)", req: false },
              ].map(({ key, label: lbl, req }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  {label(lbl, req)}{fo(key, "Notes, versets, points clés...", 3)}
                </div>
              ))}
            </>
          )}
          {section("💬", "Citations & Conclusion",
            <>
              <div style={{ marginBottom: 14 }}>{label("Citations importantes", true)}{fo("citations", "«Le bonheur ne vient pas d'autrui...»\n«La soumission c'est se placer volontairement...»", 4)}</div>
              <div>{label("Idées pour la conclusion")}{fo("conclusion", "Message final, appel à l'action, verset de clôture...", 3)}</div>
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
