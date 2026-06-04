import { SAMPLE_NOTES } from "../prompts.js";

export default function StepNotes({ notes, setNotes, onGenerate, loading }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 600, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Notes brutes du message
        </label>
        <button
          onClick={() => setNotes(SAMPLE_NOTES)}
          style={{ fontSize: 12, color: "var(--navy)", background: "none", border: "1px solid var(--navy)", borderRadius: 4, padding: "3px 12px", fontFamily: "Arial, sans-serif", opacity: 0.7 }}
        >
          Exemple
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={"Colle tes notes ici :\n— Titre du message\n— Date et prédicateur\n— Points clés (I, II, III...)\n— Citations de Dr Wafo\n— Versets bibliques\n— Lien YouTube"}
        style={{
          width: "100%", minHeight: 320, padding: "14px", fontSize: 14,
          lineHeight: 1.65, borderRadius: 8, border: "1.5px solid var(--border)",
          fontFamily: "Arial, sans-serif", resize: "vertical", background: "var(--surface)",
          color: "var(--text)", outline: "none", transition: "border-color .2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--navy)"}
        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
      />

      <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Arial, sans-serif" }}>
          {notes.length > 0 ? `${notes.length} caractères` : "Plus tes notes sont détaillées, meilleur sera l'article"}
        </span>
        <button
          onClick={onGenerate}
          disabled={!notes.trim() || loading}
          style={{
            background: !notes.trim() || loading ? "#ccc" : "var(--navy)",
            color: "white", border: "none", borderRadius: 8,
            padding: "12px 32px", fontSize: 15, fontFamily: "Arial, sans-serif",
            fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8,
            transition: "background .2s",
          }}
        >
          {loading ? <><span className="spinner" /> Génération...</> : "Générer l'article FR →"}
        </button>
      </div>
    </div>
  );
}
