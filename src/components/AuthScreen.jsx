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
      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(27,43,94,0.82) 0%, rgba(10,20,50,0.75) 100%)",
        backdropFilter: "blur(1px)",
      }} />

      <div style={{
        textAlign: "center", position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
      }}>
        {/* Logo — cliquable 3x */}
        <div
          onClick={handleLogoClick}
          style={{
            cursor: "pointer", marginBottom: 32,
            transform: clicks > 0 && clicks < 3 ? `scale(${1 + clicks * 0.03})` : "scale(1)",
            transition: "transform 0.2s",
          }}
          title={clicks < 3 ? `${3 - clicks} clic(s) restant(s)` : ""}
        >
          <img
            src="/logo.png"
            alt="The Essentials"
            style={{
              width: 140, height: 140, objectFit: "contain",
              borderRadius: 20, background: "white", padding: 16,
              boxShadow: clicks > 0 ? "0 0 30px rgba(200,169,81,0.4)" : "0 8px 32px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.3s",
            }}
          />
          {/* Dots indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: clicks >= n ? "#C8A951" : "rgba(255,255,255,0.2)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, color: "white", margin: "0 0 6px", letterSpacing: "-0.5px",
        }}>
          The <span style={{ color: "#C8A951" }}>Essentials.</span>
        </h1>
        <p style={{
          fontFamily: "Arial, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)",
          letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 40px",
        }}>
          Générateur d'articles — SBE
        </p>

        {!showInput && (
          <p style={{
            fontFamily: "Arial, sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.3)", letterSpacing: "1px",
          }}>
            CLIQUE 3× SUR LE LOGO
          </p>
        )}

        {showInput && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 280 }}>
            <input
              ref={inputRef}
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError(false); }}
              placeholder="Mot de passe"
              style={{
                width: "100%", padding: "14px 18px", fontSize: 15,
                borderRadius: 10, border: error ? "2px solid #C0392B" : "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)", color: "white",
                fontFamily: "Arial, sans-serif", outline: "none", textAlign: "center",
                letterSpacing: "3px",
                animation: shake ? "shake 0.5s ease" : "none",
              }}
              autoComplete="current-password"
            />
            {error && (
              <p style={{ color: "#ff6b6b", fontSize: 12, fontFamily: "Arial, sans-serif", margin: 0 }}>
                Mot de passe incorrect
              </p>
            )}
            <button type="submit" style={{
              width: "100%", padding: "13px", background: "#C8A951", color: "white",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              fontFamily: "Arial, sans-serif", cursor: "pointer", letterSpacing: "1px",
              textTransform: "uppercase",
            }}>
              Accéder →
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}
