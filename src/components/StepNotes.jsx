import { useState } from "react";

const CATEGORIES = [
  "FAMILLE & SAGESSE", "FOI & SURNATUREL", "PRIÈRE & INTERCESSION",
  "IDENTITÉ & DESTINÉE", "MARIAGE & COUPLE", "FINANCES & PROSPÉRITÉ",
  "LEADERSHIP & SERVICE", "ÉVANGÉLISATION", "LOUANGE & ADORATION", "AUTRE",
];

export default function StepNotes({ onGenerate, loading }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    articleNum: "",
    category: "FAMILLE & SAGESSE",
    preacher: "Dr. Raoul Wafo",
    youtube1: "",
    youtube2: "",
    prayerTopics: "",
    notesI: "",
    notesII: "",
    notesIII: "",
    notesIV: "",
    citations: "",
    conclusion: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function buildNotes() {
    const d = new Date(form.date);
    const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return `Date : ${dateStr}
Numéro d'article : ${form.articleNum || "XXX"}
Catégorie : ${form.category}
Prédicateur : ${form.preacher}
${form.youtube1 ? `Lien YouTube principal : ${form.youtube1}` : ""}
${form.youtube2 ? `Lien YouTube 2ème message : ${form.youtube2}` : ""}
${form.prayerTopics ? `Sujets de prière : ${form.prayerTopics}` : ""}

I — Notes :
${form.notesI}

II — Notes :
${form.notesII}

III — Notes :
${form.notesIII}

${form.notesIV ? `IV — Notes :\n${form.notesIV}\n` : ""}
Citations importantes :
${form.citations}

Conclusion :
${form.conclusion}`;
  }

  const canSubmit = form.notesI.trim() && form.notesII.trim() && form.notesIII.trim() && form.citations.trim();

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8,
    border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)",
    fontFamily: "Arial, sans-serif", outline: "none", boxSizing: "border-box",
    transition: "border-color .2s",
  };
  const labelStyle = {
    display: "block", fontFamily: "Arial, sans-serif", fontSize: 11,
    fontWeight: 700, color: "var(--navy)", textTransform: "uppercase",
    letterSpacing: "0.7px", marginBottom: 6,
  };
  const sectionStyle = {
    background: "var(--surface)", border: "1.5px solid var(--border)",
    borderRadius: 10, padding: "20px 22px", marginBottom: 16,
  };
  const sectionTitle = {
    fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 700,
    color: "var(--navy)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
  };

  return (
    <div>
      {/* Section 1 — Infos */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>📅 Informations du dimanche</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Date du culte</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
              style={inputStyle} onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Numéro d'article</label>
            <input type="number" value={form.articleNum} onChange={e => set("articleNum", e.target.value)}
              placeholder="075" min="1" style={inputStyle}
              onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Prédicateur principal</label>
            <input type="text" value={form.preacher} onChange={e => set("preacher", e.target.value)}
              style={inputStyle} onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Lien YouTube — Message principal</label>
            <input type="url" value={form.youtube1} onChange={e => set("youtube1", e.target.value)}
              placeholder="https://youtube.com/watch?v=..." style={inputStyle}
              onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div>
            <label style={labelStyle}>Lien YouTube — 2ème message (optionnel)</label>
            <input type="url" value={form.youtube2} onChange={e => set("youtube2", e.target.value)}
              placeholder="https://youtube.com/watch?v=..." style={inputStyle}
              onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Sujets de prière (optionnel — séparés par des virgules)</label>
            <input type="text" value={form.prayerTopics} onChange={e => set("prayerTopics", e.target.value)}
              placeholder="Ex : Les familles de l'église, Les malades, Les nations..."
              style={inputStyle} onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
        </div>
      </div>

      {/* Section 2 — Notes par partie */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>✍️ Notes du message</div>
        {[
          { key: "notesI", label: "Partie I — Points clés, versets, idées", required: true },
          { key: "notesII", label: "Partie II — Points clés, versets, idées", required: true },
          { key: "notesIII", label: "Partie III — Points clés, versets, idées", required: true },
          { key: "notesIV", label: "Partie IV (optionnel)", required: false },
        ].map(({ key, label, required }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label} {required && <span style={{ color: "var(--red)" }}>*</span>}</label>
            <textarea value={form[key]} onChange={e => set(key, e.target.value)}
              placeholder="Notes, versets bibliques, points clés..."
              rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor="var(--navy)"}
              onBlur={e => e.target.style.borderColor="var(--border)"} />
          </div>
        ))}
      </div>

      {/* Section 3 — Citations & Conclusion */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>💬 Citations & Conclusion</div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Citations importantes du prédicateur <span style={{ color: "var(--red)" }}>*</span></label>
          <textarea value={form.citations} onChange={e => set("citations", e.target.value)}
            placeholder={"Ex : «Le bonheur ne vient pas d'autrui mais de la conception qu'on a de soi-même»\n«La soumission c'est se placer volontairement sous l'autorité de quelqu'un»"}
            rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor="var(--navy)"}
            onBlur={e => e.target.style.borderColor="var(--border)"} />
        </div>
        <div>
          <label style={labelStyle}>Idées pour la conclusion</label>
          <textarea value={form.conclusion} onChange={e => set("conclusion", e.target.value)}
            placeholder="Message final, appel à l'action, verset de clôture..."
            rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor="var(--navy)"}
            onBlur={e => e.target.style.borderColor="var(--border)"} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => onGenerate(buildNotes(), form)} disabled={!canSubmit || loading}
          style={{
            background: !canSubmit || loading ? "#ccc" : "var(--navy)",
            color: "white", border: "none", borderRadius: 8, padding: "13px 36px",
            fontSize: 15, fontFamily: "Arial, sans-serif", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 8, cursor: !canSubmit || loading ? "not-allowed" : "pointer",
          }}>
          {loading ? <><span className="spinner" /> Génération en cours...</> : "Générer l'article FR →"}
        </button>
      </div>
    </div>
  );
}
