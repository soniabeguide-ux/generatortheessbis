import { useState } from "react";
import { callClaude } from "./api.js";
import { SYSTEM_FR, SYSTEM_EN } from "./prompts.js";
import AuthScreen from "./components/AuthScreen.jsx";
import StepNotes from "./components/StepNotes.jsx";
import StepArticleFR from "./components/StepArticleFR.jsx";
import StepBilingual from "./components/StepBilingual.jsx";
import StepExport from "./components/StepExport.jsx";

const STEPS = [
  { n: 1, label: "Notes" },
  { n: 2, label: "Article FR" },
  { n: 3, label: "Traduction EN" },
  { n: 4, label: "Export" },
];

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [step, setStep] = useState(1);
  const [articleFR, setArticleFR] = useState("");
  const [articleEN, setArticleEN] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateFR(notes, formData) {
    setLoading(true); setError("");
    try {
      const text = await callClaude(SYSTEM_FR, `Voici mes notes brutes :\n\n${notes}`);
      setArticleFR(text);
      // Build meta from form directly — no extra API call needed
      // Fix timezone: parse date parts directly to avoid UTC offset shifting the day
      const [y, mo, da] = formData.date.split("-").map(Number);
      const d = new Date(y, mo - 1, da);
      const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const dateEN = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      setMeta({
        date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
        date_en: dateEN,
        article_number: String(formData.articleNum || "XXX").padStart(3, "0"),
        category_fr: formData.category,
        category_en: formData.category,
        preacher: formData.preacher,
        youtube_url: formData.youtube1 || null,
        youtube_url2: formData.youtube2 || null,
        prayer_topics: formData.prayerTopics || null,
        title_fr: "",
        title_en: "",
      });
      setStep(2);
    } catch (e) { setError("Erreur génération FR : " + e.message); }
    setLoading(false);
  }

  async function handleTranslateEN() {
    setLoading(true); setError("");
    try {
      const text = await callClaude(SYSTEM_EN, `Article français à traduire :\n\n${articleFR}`);
      setArticleEN(text);
      // Extract titles
      const frTitle = articleFR.match(/\*\*([^*\n]{10,})\*\*/)?.[1] || "Article";
      const enTitle = text.match(/\*\*([^*\n]{10,})\*\*/)?.[1] || "Article";
      setMeta(m => ({ ...m, title_fr: frTitle, title_en: enTitle }));
      setStep(3);
    } catch (e) { setError("Erreur traduction EN : " + e.message); }
    setLoading(false);
  }

  function handleValidate() {
    setStep(4);
  }

  function handleReset() {
    setStep(1); setArticleFR(""); setArticleEN(""); setMeta(null); setError("");
  }

  if (!authed) return <AuthScreen onAuth={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <header style={{ textAlign: "center", padding: "28px 0 20px", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          <img src="/logo.png" alt="The Essentials" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 12, marginBottom: 10 }} />
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, color: "var(--navy)", letterSpacing: "-0.5px", margin: "0 0 4px" }}>
            The <span style={{ color: "#C8A951" }}>Essentials.</span> — Générateur d'Articles
          </h1>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", margin: 0 }}>
            Notes → Article FR + EN → Word · PDF Journal · WordPress
          </p>
        </header>

        {/* Stepper */}
        <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} onClick={() => done && setStep(s.n)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 4px", cursor: done ? "pointer" : "default",
                  background: active ? "var(--navy)" : done ? "#EEF1F8" : "var(--surface)",
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  transition: "background .15s",
                }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "Arial, sans-serif", flexShrink: 0,
                  background: active ? "white" : done ? "var(--red)" : "var(--border)",
                  color: active ? "var(--navy)" : done ? "white" : "var(--text-muted)",
                }}>
                  {done ? "✓" : s.n}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "Arial, sans-serif", color: active ? "white" : done ? "var(--navy)" : "var(--text-muted)" }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#991B1B", fontSize: 14, fontFamily: "Arial, sans-serif" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "24px 28px" }}>
          {step === 1 && <StepNotes onGenerate={handleGenerateFR} loading={loading} />}
          {step === 2 && <StepArticleFR article={articleFR} setArticle={setArticleFR} onBack={() => setStep(1)} onTranslate={handleTranslateEN} loading={loading} />}
          {step === 3 && <StepBilingual articleFR={articleFR} setArticleFR={setArticleFR} articleEN={articleEN} setArticleEN={setArticleEN} onBack={() => setStep(2)} onValidate={handleValidate} loading={loading} />}
          {step === 4 && meta && <StepExport articleFR={articleFR} articleEN={articleEN} meta={meta} onBack={() => setStep(3)} onReset={handleReset} />}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "var(--text-muted)", fontFamily: "Arial, sans-serif" }}>
          theessentialsfr.wordpress.com · theessentialsen.wordpress.com
        </p>
      </div>
    </div>
  );
}
