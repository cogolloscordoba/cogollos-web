import { useState, useRef, useEffect } from "react";

const C = {
  green: "#2B7A3E",
  greenDark: "#1A5C2A",
  greenLight: "#EAF4ED",
  greenPale: "#F4FAF6",
  dark: "#111C15",
  body: "#374840",
  muted: "#6B8872",
  border: "#C8DFD0",
  white: "#FFFFFF",
  cream: "#FAFDF8",
};

const F = "'Roboto', Arial, sans-serif";

const VARIEDADES = [
  { nombre: "Edith1", tipo: "Sativa", thc: "Alto THC", momento: "Todo el día", descripcion: "Activadora y energizante. Focalizadora con sabores a chocolate frutal. Ideal para mantener el foco durante el día.", accent: "#2B7A3E", bg: "#EAF4ED" },
  { nombre: "Edith 2 INTA", tipo: "Híbrido", thc: "Alto THC", momento: "Todo el día", descripcion: "Aromas cítricos dulces y penetrantes. Equilibrada con efecto relax y feliz. Una de las más sabrosas de nuestra colección.", accent: "#8C6B1A", bg: "#FDF6E8" },
  { nombre: "Cogollos INTA THC", tipo: "Híbrido", thc: "Alto THC", momento: "Tarde", descripcion: "Tonos frutales maduros de mango y especias con notas terrosas. Producción propia en colaboración con INTA.", accent: "#2B7A3E", bg: "#EAF4ED" },
  { nombre: "Cogollos INTA CBD", tipo: "CBD", thc: "Alto CBD · <0.5% THC", momento: "Todo el día", descripcion: "Ideal para abandonar el tabaco. Relax profundo sin producir sueño. Base para la producción de aceites medicinales.", accent: "#1A5C7A", bg: "#E8F2F8" },
  { nombre: "Kordoba Kush", tipo: "Indica", thc: "Alto THC", momento: "Noche", descripcion: "Sabores penetrantes de pino, limón y especias. Relajante profunda y sillonera. La favorita para el final del día.", accent: "#5C2B7A", bg: "#F2EAF8" },
];

const PASOS = [
  { num: "01", titulo: "Alta en REPROCANN", desc: "Ingresá a reprocann.msal.gob.ar con tu cuenta de Mi Argentina. Elegí perfil Paciente, completá tus datos y seleccioná tipo de cultivo 'Otro'. Guardá tu código de vinculación.", link: "https://reprocann.msal.gob.ar/", linkText: "Ir a REPROCANN" },
  { num: "02", titulo: "Cita médica", desc: "Completá el formulario con tus datos para que el equipo te asigne un turno con nuestro director médico. La consulta es virtual y tiene un costo de $30.000.", link: "https://forms.gle/5USo1C2WcBGeG9Qz5", linkText: "Completar formulario" },
  { num: "03", titulo: "Vinculación Cannalizar", desc: "El equipo médico te guía para completar tu vinculación en la plataforma Cannalizar. Una vez completado, comenzamos a dispensarte.", link: "https://app.cannalizar.com.ar/invite-patient?&referal=1687099523011x992708761737770400", linkText: "Plataforma Cannalizar" },
];

// Hook para detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
  function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler(); // ejecutar al montar
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}
  
}

async function askClaude(messages) {
  const ultimoMensaje = messages.filter(m => m.role === "user").pop();
  const historial = messages.filter(m => m.role === "user" || m.role === "assistant").slice(0, -1);

  console.log("MENSAJE:", ultimoMensaje?.content, "HISTORIAL:", historial.length);

  const res = await fetch("https://cogollos.app.n8n.cloud/webhook/chat-web", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje: ultimoMensaje?.content || "",
      historial: historial,
    }),
  });
  const text = await res.text();
  return text || "Perdoná, hubo un error. Escribinos al WhatsApp +54 9 3518 05-7172";
}

function Chat() {
  const isMobile = useIsMobile();
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hola, soy Cogo-Bot, el asistente de Cogollos Córdoba. Podés preguntarme sobre nuestras variedades, el proceso de asociación o lo que necesites." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const history = [...msgs.filter((m, i) => i > 0), { role: "user", content: text }];
    setMsgs(history);
    setLoading(true);
    try {
      const apiMsgs = history.map(m => ({ role: m.role, content: m.content }));
      const reply = await askClaude(apiMsgs);
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Hubo un error. Escribinos directamente al WhatsApp." }]);
    }
    setLoading(false);
  };

  const suggestions = ["Como me asocio?", "Que variedades tienen?", "Ya tengo REPROCANN activo"];

  return (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
      <div style={{ background: C.greenDark, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 32, filter: "brightness(0) invert(1)" }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6FD67F" }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: F }}>Cogo-Bot en línea</span>
        </div>
      </div>

      <div style={{ height: isMobile ? 260 : 300, overflowY: "auto", padding: "16px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              background: m.role === "user" ? C.green : C.greenLight,
              color: m.role === "user" ? "#fff" : C.dark,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: isMobile ? 13 : 14, lineHeight: 1.6, fontFamily: F,
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ padding: "10px 16px", background: C.greenLight, borderRadius: "18px 18px 18px 4px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `bounce 1s ${j*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            background: "transparent", border: `1px solid ${C.border}`, color: C.green,
            borderRadius: 20, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: F,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "8px 16px 16px", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Escribi tu consulta..."
          style={{
            flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 24,
            padding: "10px 16px", fontSize: 14, fontFamily: F, color: C.dark,
            outline: "none", background: C.cream,
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none",
          background: !input.trim() ? C.border : C.green,
          cursor: !input.trim() ? "not-allowed" : "pointer",
          color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>→</button>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: F, color: C.dark, background: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        html { scroll-behavior: smooth; }
        a { color: inherit; text-decoration: none; }
        button { transition: all 0.2s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 6px; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(250,253,248,0.97)", backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`,
        padding: `0 ${isMobile ? "4%" : "6%"}`,
        display: "flex", alignItems: "center", height: 64,
      }}>
        <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: isMobile ? 36 : 44, cursor: "pointer" }} onClick={() => scrollTo("inicio")} />

        {isMobile ? (
          // Hamburger menu
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 24, height: 2, background: C.dark, borderRadius: 2,
                transition: "all 0.2s",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : i === 1 ? "opacity:0"
                  : "rotate(-45deg) translate(5px, -5px)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        ) : (
          <div style={{ marginLeft: "auto", display: "flex", gap: 28, alignItems: "center" }}>
            {[["Nosotros", "nosotros"], ["Variedades", "catalogo"], ["Asociarse", "asociarse"]].map(([l, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: "none", border: "none", color: C.body, cursor: "pointer",
                fontSize: 15, fontFamily: F, fontWeight: 500,
              }}>{l}</button>
            ))}
            <button onClick={() => scrollTo("asociarse")} style={{
              background: C.green, color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 22px", cursor: "pointer",
              fontFamily: F, fontWeight: 700, fontSize: 14,
            }}>Quiero asociarme</button>
          </div>
        )}
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: C.white, borderBottom: `1px solid ${C.border}`,
          padding: "16px 6%", display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}>
          {[["Nosotros", "nosotros"], ["Variedades", "catalogo"], ["Asociarse", "asociarse"], ["Consultar", "consultar"]].map(([l, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: "none", border: "none", color: C.body, cursor: "pointer",
              fontSize: 16, fontFamily: F, fontWeight: 500, padding: "12px 0",
              textAlign: "left", borderBottom: `1px solid ${C.border}`,
            }}>{l}</button>
          ))}
          <button onClick={() => scrollTo("asociarse")} style={{
            background: C.green, color: "#fff", border: "none",
            borderRadius: 8, padding: "14px", cursor: "pointer",
            fontFamily: F, fontWeight: 700, fontSize: 15, marginTop: 8,
          }}>Quiero asociarme</button>
        </div>
      )}

      {/* HERO */}
      <section id="inicio" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: isMobile ? "90px 6% 60px" : "100px 6% 80px",
        background: `linear-gradient(160deg, ${C.white} 50%, ${C.greenLight} 100%)`,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", width: "100%",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : 60,
          alignItems: "center",
        }}>
          <div>
            <div style={{
              display: "inline-block", background: C.greenLight, color: C.greenDark,
              borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", marginBottom: 28,
            }}>ASOCIACIÓN CIVIL · RES. IPJ 207 C/21</div>

            <h1 style={{ fontSize: isMobile ? "clamp(30px, 8vw, 42px)" : "clamp(34px, 4.5vw, 54px)", fontWeight: 700, lineHeight: 1.15, color: C.dark, marginBottom: 20 }}>
              Cannabis medicinal<br />
              <span style={{ color: C.green }}>legal y de calidad</span><br />
              en Córdoba
            </h1>

            <p style={{ color: C.body, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Somos una ONG habilitada por REPROCANN para cultivar por vos de manera legal. Fundada en 2001, somos la primera asociación cannábica de Argentina.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <button onClick={() => scrollTo("asociarse")} style={{
                background: C.green, color: "#fff", border: "none",
                borderRadius: 8, padding: isMobile ? "13px 22px" : "14px 28px",
                fontFamily: F, fontWeight: 700, fontSize: isMobile ? 14 : 15, cursor: "pointer",
                boxShadow: `0 4px 16px ${C.green}40`,
                width: isMobile ? "100%" : "auto",
              }}>Quiero asociarme</button>
              <button onClick={() => scrollTo("consultar")} style={{
                background: "transparent", color: C.green,
                border: `2px solid ${C.green}`,
                borderRadius: 8, padding: isMobile ? "13px 22px" : "14px 28px",
                fontFamily: F, fontWeight: 700, fontSize: isMobile ? 14 : 15, cursor: "pointer",
                width: isMobile ? "100%" : "auto",
              }}>Hacer una consulta</button>
            </div>

            <div style={{ display: "flex", gap: isMobile ? 24 : 40, flexWrap: "wrap" }}>
              {[["2001", "Fundación"], ["Desde REPROCANN", "Habilitados para cultivar"], ["5", "Variedades propias"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: C.green }}>{n}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Logo — oculto en mobile para no ocupar espacio */}
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src="/logo.png" alt="Cogollos Córdoba" style={{ maxWidth: 380, width: "100%" }} />
            </div>
          )}
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>QUIÉNES SOMOS</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, color: C.dark, marginBottom: 20, lineHeight: 1.2 }}>
              La primera asociación cannábica de Argentina
            </h2>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 16, lineHeight: 1.8 }}>
              Cogollos Córdoba fue fundada en 2001 por cultivadores, cultivadoras y activistas para visibilizarse y trabajar por la despenalización del cannabis y el reconocimiento de sus usos terapéuticos. Desde la vigencia de la ley REPROCANN, somos una ONG habilitada para cultivar cannabis medicinal por nuestros socios.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { titulo: "Edith 'La Negra' Moreno", texto: "Pionera en la lucha por los derechos de personas con VIH y el uso terapéutico del cannabis. Fue el motor fundacional de Cogollos Córdoba y la primera asociación cannábica de Argentina." },
              { titulo: "Investigación con INTA", texto: "Trabajamos junto al Instituto Nacional de Tecnología Agropecuaria en un proceso de fitomejoramiento genético para elevar el estándar de calidad de nuestras cepas." },
              { titulo: "Habilitación legal", texto: "Asociación Civil debidamente inscripta (Res. IPJ 207 C/21, CUIT 30-71728612-6), habilitada por REPROCANN para el cultivo de cannabis medicinal en Argentina." },
            ].map(card => (
              <div key={card.titulo} style={{
                background: C.greenPale, borderRadius: 12,
                padding: "28px 24px", border: `1px solid ${C.border}`,
              }}>
                <div style={{ width: 4, height: 32, background: C.green, borderRadius: 4, marginBottom: 20 }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 12 }}>{card.titulo}</h3>
                <p style={{ color: C.body, fontSize: 14, lineHeight: 1.7 }}>{card.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.cream }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>NUESTRAS VARIEDADES</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, color: C.dark, marginBottom: 12, lineHeight: 1.2 }}>
              Flor seca de calidad premium
            </h2>
            <p style={{ color: C.muted, fontSize: isMobile ? 13 : 15 }}>Paquetes cerrados de 5g · <strong style={{ color: C.green }}>$30.000 c/u</strong> · Exclusivo para socios activos</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {VARIEDADES.map(v => (
              <div key={v.nombre} style={{
                background: v.bg, borderRadius: 12,
                padding: "24px 20px", border: `1px solid ${v.accent}22`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ background: `${v.accent}18`, color: v.accent, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{v.tipo}</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>{v.momento}</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: C.dark, marginBottom: 10 }}>{v.nombre}</h3>
                <p style={{ color: C.body, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>{v.descripcion}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${v.accent}18` }}>
                  <span style={{ color: v.accent, fontSize: 12, fontWeight: 600 }}>{v.thc}</span>
                  <span style={{ color: C.green, fontSize: 15, fontWeight: 700 }}>$30.000 · 5g</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, padding: "20px 24px", background: C.greenLight, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.body, fontSize: 14 }}>
              Para acceder al catálogo completo y realizar pedidos, necesitás ser socio activo de la asociación.
              <button onClick={() => scrollTo("asociarse")} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontWeight: 700, fontSize: 14, marginLeft: 6, fontFamily: F }}>
                Asociate →
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ASOCIARSE */}
      <section id="asociarse" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.greenDark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? 36 : 56 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>PROCESO DE VINCULACIÓN</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>Como asociarme</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : 16, maxWidth: 520 }}>El proceso completo lleva entre 1 y 2 semanas. Te acompañamos en cada paso.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            {PASOS.map((paso, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, padding: "28px 24px",
              }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: "rgba(255,255,255,0.12)", marginBottom: 16, lineHeight: 1 }}>{paso.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{paso.titulo}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{paso.desc}</p>
                <a href={paso.link} target="_blank" rel="noreferrer" style={{
                  display: "inline-block", color: "#6FD67F", fontSize: 13, fontWeight: 700,
                  borderBottom: "1px solid rgba(111,214,127,0.4)", paddingBottom: 2,
                }}>{paso.linkText} →</a>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, padding: "24px 28px",
            display: "flex", alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 16 : 20,
          }}>
            <div style={{ flex: 1, minWidth: isMobile ? "auto" : 240 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Ya sos paciente REPROCANN activo?</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                Tenemos caminos especiales: convenio bilateral o baja y nuevo registro. En ambos casos hay consulta médica con nuestro director.
              </div>
            </div>
            <button onClick={() => scrollTo("consultar")} style={{
              background: "#6FD67F", color: C.dark, border: "none",
              borderRadius: 8, padding: "12px 24px",
              fontFamily: F, fontWeight: 700, fontSize: 14, cursor: "pointer",
              flexShrink: 0, width: isMobile ? "100%" : "auto",
            }}>Consultar</button>
          </div>
        </div>
      </section>

      {/* CONSULTAR */}
      <section id="consultar" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 40 : 60,
            alignItems: "center",
          }}>
            <div>
              <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>COGO-BOT</div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, color: C.dark, marginBottom: 20, lineHeight: 1.2 }}>
                Consulta sin compromiso
              </h2>
              <p style={{ color: C.body, fontSize: isMobile ? 14 : 16, lineHeight: 1.75, marginBottom: 28 }}>
                Cogo-Bot puede responder tus dudas sobre el proceso de asociación, las variedades, la consulta médica y todo lo que necesites saber.
              </p>
              {["Proceso de asociación y REPROCANN", "Variedades y efectos de cada una", "Precios y modalidad de entrega", "Consultas sobre la vinculación médica"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                  <span style={{ color: C.body, fontSize: 14 }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: 28, padding: "16px 20px", background: C.greenPale, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <p style={{ color: C.muted, fontSize: 13 }}>
                  Preferis hablar con una persona? Escribinos al WhatsApp:
                  <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 700, marginLeft: 6 }}>
                    +54 9 3518 05-7172
                  </a>
                </p>
              </div>
            </div>
            <Chat />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000000", padding: isMobile ? "48px 6% 28px" : "60px 6% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
            gap: isMobile ? 32 : 40,
            marginBottom: isMobile ? 32 : 48,
          }}>
            <div>
              <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 48, marginBottom: 16 }} />
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginBottom: 16 }}>
                Asociación Civil sin fines de lucro. Fundada en 2001. Habilitada por REPROCANN para el cultivo de cannabis medicinal.
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Res. IPJ 207 C/21 · CUIT 30-71728612-6</p>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Navegación</div>
              {[["Inicio", "inicio"], ["Nosotros", "nosotros"], ["Variedades", "catalogo"], ["Asociarse", "asociarse"], ["Consultar", "consultar"]].map(([l, id]) => (
                <div key={id} style={{ marginBottom: 8 }}>
                  <button onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 13, fontFamily: F, padding: 0 }}>{l}</button>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Contacto</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 3 }}>EMAIL</div>
                <a href="mailto:cogollosargentina@gmail.com" style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>cogollosargentina@gmail.com</a>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 3 }}>WHATSAPP SOCIOS</div>
                <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>+54 9 3518 05-7172</a>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://www.instagram.com/asociacioncivilcogolloscordoba/" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>Instagram</a>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <a href="https://www.facebook.com/LaEdithMorenoCogollosCBA/" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>Facebook</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2026 Asociación Civil Cogollos Córdoba</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>cogolloscordoba.ar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}