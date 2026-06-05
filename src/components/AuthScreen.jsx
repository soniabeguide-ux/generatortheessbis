import { useState, useRef } from "react";

const PASSWORD = "gloire2026";

export default function AuthScreen({ onAuth }) {
  const [clicks, setClicks] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  function handleLogoClick() {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 3) {
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (pwd === PASSWORD) {
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setPwd("");
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      backgroundImage: "url('/auth-bg.jpg')",
      backgroundSize: "cover", backgroundPosition: "center",
    }}>
      {/* Subtle dark vignette only — no blue overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)",
      }} />

      <div style={{
        textAlign: "center", position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.25)",
        padding: "48px 52px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        minWidth: 320,
      }}>
        {/* Logo — cliquable 3x, discret */}
        <div onClick={handleLogoClick} style={{ cursor: "pointer", marginBottom: 24 }}>
          <img src="/logo.png" alt="The Essentials"
            style={{ width: 120, height: 120, objectFit: "contain", borderRadius: 16,
              background: "white", padding: 14,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              transition: "transform 0.15s",
              transform: clicks > 0 && clicks < 3 ? "scale(1.04)" : "scale(1)",
            }} />
          {/* Dots — visibles seulement si on a cliqué */}
          {clicks > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 10 }}>
              {[1,2,3].map(n => (
                <div key={n} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: clicks >= n ? "#C8A951" : "rgba(255,255,255,0.35)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          )}
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26,
          color: "white", margin: "0 0 4px", letterSpacing: "-0.5px",
          textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
          The <span style={{ color: "#C8A951" }}>Essentials.</span>
        </h1>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)",
          letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 32px" }}>
          Générateur d'articles — SBE
        </p>

        {showInput && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 260 }}>
            <input ref={inputRef} type="password" value={pwd}
              onChange={e => { setPwd(e.target.value); setError(false); }}
              placeholder="••••••••••"
              style={{
                width: "100%", padding: "13px 18px", fontSize: 16,
                borderRadius: 10, border: error ? "2px solid #ff6b6b" : "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.15)", color: "white",
                fontFamily: "Arial, sans-serif", outline: "none", textAlign: "center",
                letterSpacing: "4px", backdropFilter: "blur(4px)",
                animation: shake ? "shake 0.5s ease" : "none",
              }}
              autoComplete="current-password"
            />
            {error && <p style={{ color: "#ff9a9a", fontSize: 12, fontFamily: "Arial, sans-serif", margin: 0 }}>
              Mot de passe incorrect
            </p>}
            <button type="submit" style={{
              width: "100%", padding: "13px", background: "#C8A951", color: "white",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              fontFamily: "Arial, sans-serif", cursor: "pointer", letterSpacing: "1px",
              textTransform: "uppercase", boxShadow: "0 4px 14px rgba(200,169,81,0.4)",
            }}>
              Accéder →
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}
