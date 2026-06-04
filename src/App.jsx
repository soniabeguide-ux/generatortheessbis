import { useState } from "react";
import { callClaude } from "./api.js";
import { SYSTEM_FR, SYSTEM_EN } from "./prompts.js";
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

const META_PROMPT = `Extrait ces champs depuis les deux articles fournis. Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication :
{
  "date": "Dimanche DD mois YYYY",
  "date_en": "Sunday, Month DD, YYYY",
  "article_number": "075",
  "title_fr": "titre complet en français",
  "title_en": "full title in English",
  "youtube_url": "url ou null"
}`;

export default function App() {
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState("");
  const [articleFR, setArticleFR] = useState("");
  const [articleEN, setArticleEN] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateFR() {
    setLoading(true); setError("");
    try {
      const text = await callClaude(SYSTEM_FR, `Voici mes notes brutes :\n\n${notes}`);
      setArticleFR(text);
      setStep(2);
    } catch (e) { setError("Erreur génération FR : " + e.message); }
    setLoading(false);
  }

  async function handleTranslateEN() {
    setLoading(true); setError("");
    try {
      const text = await callClaude(SYSTEM_EN, `Article français à traduire :\n\n${articleFR}`);
      setArticleEN(text);
      setStep(3);
    } catch (e) { setError("Erreur traduction EN : " + e.message); }
    setLoading(false);
  }

  async function handleValidate() {
    setLoading(true); setError("");
    try {
      const raw = await callClaude(
        null,
        `${META_PROMPT}\n\nArticle FR :\n${articleFR}\n\nArticle EN :\n${articleEN}`
      );
      let parsed = {};
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = { date: "Dimanche 2026", date_en: "Sunday 2026", article_number: "XXX", title_fr: "Article", title_en: "Article", youtube_url: null };
      }
      setMeta(parsed);
      setStep(4);
    } catch (e) { setError("Erreur extraction métadonnées : " + e.message); }
    setLoading(false);
  }

  function handleReset() {
    setStep(1); setNotes(""); setArticleFR(""); setArticleEN(""); setMeta(null); setError("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <header style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "var(--navy)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            The Essentials.
          </h1>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Générateur d'articles bilingues
          </p>
        </header>

        {/* Stepper */}
        <div style={{ display: "flex", marginBottom: 28, borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div
                key={s.n}
                onClick={() => done && setStep(s.n)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 4px", cursor: done ? "pointer" : "default",
                  background: active ? "var(--navy)" : done ? "#EEF1F8" : "var(--surface)",
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  transition: "background .15s",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "Arial, sans-serif", flexShrink: 0,
                  background: active ? "white" : done ? "var(--red)" : "var(--border)",
                  color: active ? "var(--navy)" : done ? "white" : "var(--text-muted)",
                }}>
                  {done ? "✓" : s.n}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, fontFamily: "Arial, sans-serif",
                  color: active ? "white" : done ? "var(--navy)" : "var(--text-muted)",
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#991B1B", fontSize: 14, fontFamily: "Arial, sans-serif" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Card */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "28px 28px" }}>
          {step === 1 && <StepNotes notes={notes} setNotes={setNotes} onGenerate={handleGenerateFR} loading={loading} />}
          {step === 2 && <StepArticleFR article={articleFR} setArticle={setArticleFR} onBack={() => setStep(1)} onTranslate={handleTranslateEN} loading={loading} />}
          {step === 3 && <StepBilingual articleFR={articleFR} setArticleFR={setArticleFR} articleEN={articleEN} setArticleEN={setArticleEN} onBack={() => setStep(2)} onValidate={handleValidate} loading={loading} />}
          {step === 4 && meta && <StepExport articleFR={articleFR} articleEN={articleEN} meta={meta} onBack={() => setStep(3)} onReset={handleReset} />}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--text-muted)", fontFamily: "Arial, sans-serif" }}>
          theessentialsfr.wordpress.com · theessentialsen.wordpress.com
        </p>
      </div>
    </div>
  );
}
