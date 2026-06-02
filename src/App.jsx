import { useState, useEffect, useRef } from "react";
import Dashboard from "./Dashboard";

// ─── Supabase ────────────────────────────────────────────────────────
const SB_URL = "https://mphiidkjfjxcqrrfbpfu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waGlpZGtqZmp4Y3FycmZicGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzczMzIsImV4cCI6MjA5NDM1MzMzMn0.ons8D67XR92jlpCb-ORTBeqbFVcgozQy4Zqpd8s7hlI";
const sb = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...opts.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ─── Admin ───────────────────────────────────────────────────────────
const ADMIN_USER = "C0g026IPJ";
const ADMIN_PASS = "789996g!!#";
const MEDICA_USER = "Medi26IPJ";
const MEDICA_PASS = "789996g!!#";

// ─── Colores ─────────────────────────────────────────────────────────
const C = {
  green: "#2B7A3E", dark: "#1A5C2A", light: "#EAF4ED", pale: "#F4FAF6",
  text: "#111C15", body: "#374840", muted: "#6B8872",
  border: "#C8DFD0", white: "#FFFFFF", cream: "#FAFDF8",
};
const F = "'DM Sans', Arial, sans-serif";

// ─── Hooks ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const h = () => setHash(window.location.hash);
    h();
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return hash;
}

// ─── Estilos compartidos ─────────────────────────────────────────────
const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: "12px 16px", fontSize: 15, fontFamily: F, color: C.text,
  background: C.white, outline: "none",
};
const btnGreen = {
  background: C.dark, color: "#fff", border: "none", borderRadius: 10,
  padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F,
};

// ─── LOGIN ADMIN ─────────────────────────────────────────────────────
function LoginAdmin({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 300));
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("cogo_admin", "1");
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, fontFamily: F, padding: "0 6%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 16 }} />
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.1em" }}>PANEL DE GESTIÓN</div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "36px 32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Usuario</label>
              <input value={user} onChange={e => setUser(e.target.value)} autoFocus style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} style={inputStyle} />
            </div>
            {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 20 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...btnGreen, width: "100%", padding: 14 }}>{loading ? "Ingresando..." : "Ingresar"}</button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
          <button onClick={() => { window.location.hash = ""; }} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500 }}>← Volver al sitio</button>
        </p>
      </div>
    </div>
  );
}

// ─── CHAT BOT ────────────────────────────────────────────────────────
async function askClaude(messages, socio) {
  const ultimoMensaje = messages.filter(m => m.role === "user").pop();
  const historial = messages.slice(0, -1);
  const res = await fetch("https://cogollos.app.n8n.cloud/webhook/chat-web", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje: ultimoMensaje?.content || "",
      historial,
      socio_id: socio.id,
      socio_nombre: socio.nombre,
      socio_telefono: socio.telefono || "",
    }),
  });
  const text = await res.text();
  return text || "Perdoná, hubo un error. Escribinos al WhatsApp +54 9 3518 05-7172";
}

function Chat({ socio }) {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: `Hola ${socio.nombre.split(" ")[0]}, soy Cogo-Bot. Podés preguntarme sobre las variedades disponibles, los turnos de retiro o lo que necesites.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const history = [...msgs, { role: "user", content: text }];
    setMsgs(history);
    setLoading(true);
    try {
      const reply = await askClaude(history, socio);
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Hubo un error. Escribinos directamente al WhatsApp." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: C.dark, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 28 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6FD67F" }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Cogo-Bot</span>
        </div>
      </div>
      <div style={{ height: 300, overflowY: "auto", padding: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: "85%", padding: "10px 14px", background: m.role === "user" ? C.dark : C.light, color: m.role === "user" ? "#fff" : C.text, borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: F }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: C.light, borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
            {[0,1,2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `bounce 1s ${j*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "8px 16px 16px", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escribi tu consulta..." style={{ ...inputStyle, fontSize: 14 }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: !input.trim() ? C.border : C.dark, cursor: !input.trim() ? "not-allowed" : "pointer", color: "#fff", fontSize: 18, flexShrink: 0 }}>→</button>
      </div>
    </div>
  );
}

// ─── ZONA SOCIOS ─────────────────────────────────────────────────────
const VARIEDADES_INFO = {
  "Sativa":  { color: "#2B7A3E", bg: "#EAF4ED" },
  "Híbrido": { color: "#8C6B1A", bg: "#FDF6E8" },
  "Indica":  { color: "#5C2B7A", bg: "#F2EAF8" },
  "CBD":     { color: "#1A5C7A", bg: "#E8F2F8" },
};

function ZonaSocios({ socio, onLogout }) {
  const isMobile = useIsMobile();
  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [tab, setTab] = useState("catalogo");
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [turno, setTurno] = useState("lunes");
  const [metodo, setMetodo] = useState("transferencia");
  const [enviando, setEnviando] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    sb("productos?select=*&activo=eq.true&order=nombre").then(data => setProductos(Array.isArray(data) ? data : []));
    sb(`pedidos?select=*,productos(nombre)&socio_id=eq.${socio.id}&order=created_at.desc`).then(data => setPedidos(Array.isArray(data) ? data : []));
  }, [socio.id]);

  const totalUnidades = Object.values(cantidades).reduce((s, v) => s + v, 0);
  const totalPrecio = Object.entries(cantidades).reduce((s, [id, cant]) => {
    const p = productos.find(p => p.id === id);
    return s + (p ? Number(p.precio) * cant : 0);
  }, 0);

  const confirmarRetiro = async () => {
    if (!totalUnidades) return;
    setEnviando(true);
    const items = Object.entries(cantidades).filter(([,c]) => c > 0);
    for (const [producto_id, cantidad] of items) {
      const prod = productos.find(p => p.id === producto_id);
      await sb("pedidos", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          socio_id: socio.id,
          producto_id,
          cantidad,
          precio_unitario: Number(prod?.precio || 0),
          metodo_pago: metodo,
          turno_delivery: turno,
          estado: "pendiente",
        }),
      });
      await sb("tickets", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          tipo: "retiro",
          prioridad: "media",
          resumen: `Retiro ${prod?.nombre} x${cantidad} - ${turno}`,
          socio_id: socio.id,
          telefono: socio.telefono,
          estado: "abierto",
        }),
      });
    }
    setCantidades({});
    setPedidoEnviado(true);
    setEnviando(false);
    sb(`pedidos?select=*,productos(nombre)&socio_id=eq.${socio.id}&order=created_at.desc`).then(data => setPedidos(Array.isArray(data) ? data : []));
  };

  const estadoColor = { pendiente: ["#FAEEDA","#633806"], preparando: ["#EEEDFE","#3C3489"], en_camino: ["#E6F1FB","#0C447C"], entregado: ["#EAF3DE","#27500A"], cancelado: ["#FCEBEB","#A32D2D"] };

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>

      {/* Header */}
      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Hola, {socio.nombre.split(" ")[0]}</span>
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>Salir</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", gap: 4 }}>
        {[["catalogo","Catálogo"], ["mis-pedidos","Mis retiros"], ["consultas","Consultas"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "14px 20px", fontSize: 14, fontWeight: tab===id ? 700 : 400, color: tab===id ? C.dark : C.muted, background: "none", border: "none", borderBottom: tab===id ? `3px solid ${C.dark}` : "3px solid transparent", cursor: "pointer", fontFamily: F }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 4%" : "32px 6%" }}>

        {/* CATÁLOGO */}
        {tab === "catalogo" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Variedades disponibles</h2>
              <p style={{ color: C.muted, fontSize: 14 }}>Seleccioná las variedades que querés retirar. Los retiros se realizan los lunes, miércoles y viernes.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
              {productos.map(p => {
                const info = VARIEDADES_INFO[p.variedad] || VARIEDADES_INFO["Híbrido"];
                const cant = cantidades[p.id] || 0;
                return (
                  <div key={p.id} style={{ background: info.bg, border: `1.5px solid ${cant > 0 ? info.color : "transparent"}`, borderRadius: 14, padding: "20px", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ background: `${info.color}20`, color: info.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{p.variedad}</span>
                      <span style={{ color: C.muted, fontSize: 12 }}>{p.momento_dia}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.nombre}</h3>
                    <p style={{ color: C.body, fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{p.descripcion}</p>
                    <p style={{ color: info.color, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>{p.efecto}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${info.color}20` }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>${Number(p.precio).toLocaleString("es-AR")}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.gramos_por_unidad || 5}g por unidad</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => setCantidades(c => ({ ...c, [p.id]: Math.max(0, (c[p.id]||0)-1) }))} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${info.color}`, background: "transparent", cursor: "pointer", fontSize: 18, color: info.color, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, minWidth: 20, textAlign: "center" }}>{cant}</span>
                        <button onClick={() => setCantidades(c => ({ ...c, [p.id]: (c[p.id]||0)+1 }))} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: info.color, cursor: "pointer", fontSize: 18, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen pedido */}
            {totalUnidades > 0 && !pedidoEnviado && (
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "24px 28px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Confirmar retiro</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Turno de retiro</label>
                    <select value={turno} onChange={e => setTurno(e.target.value)} style={{ ...inputStyle }}>
                      <option value="lunes">Lunes</option>
                      <option value="miercoles">Miércoles</option>
                      <option value="viernes">Viernes</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Método de pago</label>
                    <select value={metodo} onChange={e => setMetodo(e.target.value)} style={{ ...inputStyle }}>
                      <option value="transferencia">Transferencia</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="mercadopago">MercadoPago</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>{totalUnidades} unidad{totalUnidades > 1 ? "es" : ""} · Retiro {turno}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>${totalPrecio.toLocaleString("es-AR")}</div>
                  </div>
                  <button onClick={confirmarRetiro} disabled={enviando} style={{ ...btnGreen, padding: "12px 28px" }}>{enviando ? "Enviando..." : "Confirmar retiro"}</button>
                </div>
              </div>
            )}

            {pedidoEnviado && (
              <div style={{ background: C.light, border: `1.5px solid ${C.green}`, borderRadius: 14, padding: "24px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Retiro solicitado</div>
                <p style={{ color: C.body, fontSize: 14, marginBottom: 16 }}>Tu solicitud de retiro fue registrada. El equipo te va a contactar por WhatsApp para coordinar la entrega del {turno}.</p>
                <button onClick={() => { setPedidoEnviado(false); setTab("mis-pedidos"); }} style={{ ...btnGreen, padding: "10px 24px", fontSize: 14 }}>Ver mis retiros</button>
              </div>
            )}
          </div>
        )}

        {/* MIS PEDIDOS */}
        {tab === "mis-pedidos" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 24 }}>Mis retiros</h2>
            {pedidos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: 15, marginBottom: 12 }}>Todavía no tenés retiros registrados</div>
                <button onClick={() => setTab("catalogo")} style={{ ...btnGreen, padding: "10px 24px", fontSize: 14 }}>Ver catálogo</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pedidos.map(p => {
                  const [bg, tc] = estadoColor[p.estado] || estadoColor.pendiente;
                  const fecha = new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
                  return (
                    <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.productos?.nombre || "—"}</div>
                        <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10 }}>
                          <span>{p.cantidad} u · ${(p.precio_unitario * p.cantidad).toLocaleString("es-AR")}</span>
                          <span>{p.metodo_pago}</span>
                          <span>Retiro {p.turno_delivery}</span>
                          <span>{fecha}</span>
                        </div>
                      </div>
                      <span style={{ background: bg, color: tc, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{p.estado?.replace("_"," ")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONSULTAS */}
        {tab === "consultas" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Consultas</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Podés consultarle a Cogo-Bot sobre las variedades, turnos de retiro o cualquier duda.</p>
            <Chat socio={socio} />
            <div style={{ marginTop: 20, padding: "16px 20px", background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: 13 }}>
                ¿Preferís hablar con una persona? WhatsApp:
                <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 700, marginLeft: 6 }}>+54 9 3518 05-7172</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FORMULARIO DE ALTA ───────────────────────────────────────────────
function FormularioAlta() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", telefono: "", email: "", direccion: "", ciudad: "", provincia: "Córdoba", codigo_postal: "", cuit: "", notas: "" });
  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validarStep1 = () => {
    if (!form.nombre || !form.apellido || !form.dni || !form.telefono || !form.email) {
      setError("Completá todos los campos obligatorios");
      return false;
    }
    if (!/^\d{7,8}$/.test(form.dni)) { setError("El DNI debe tener 7 u 8 dígitos"); return false; }
    setError("");
    return true;
  };

  const enviar = async () => {
    if (!form.direccion || !form.ciudad) { setError("Completá dirección y ciudad"); return; }
    setLoading(true);
    setError("");
    try {
      const existente = await sb(`socios?dni=eq.${form.dni}&select=id,estado`);
      if (existente?.length > 0) {
        setError("Ya existe un registro con ese DNI. Si creés que es un error, escribinos al WhatsApp.");
        setLoading(false);
        return;
      }
      await sb("socios", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
          dni: form.dni.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          direccion: `${form.direccion.trim()}, ${form.ciudad.trim()}`,
          ciudad: form.ciudad.trim(),
          provincia: form.provincia,
          codigo_postal: form.codigo_postal.trim() || null,
          cuit: form.cuit.trim() || null,
          estado: "pendiente",
          notas: form.notas.trim() || null,
        }),
      });
      setEnviado(true);
    } catch (e) {
      setError("Hubo un error al enviar. Intentá de nuevo o escribinos al WhatsApp.");
    }
    setLoading(false);
  };

  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" };

  if (enviado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, fontFamily: F, padding: "0 6%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 32 }} />
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "40px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 12 }}>Solicitud enviada</h2>
          <p style={{ color: C.body, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>Recibimos tu solicitud. El siguiente paso es la consulta médica virtual con nuestro director. El equipo te va a contactar por WhatsApp para coordinar el turno.</p>
          <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ ...btnGreen, display: "inline-block", textDecoration: "none", padding: "12px 28px" }}>Escribirnos al WhatsApp</a>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => window.location.hash = ""} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500 }}>← Volver al sitio</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ background: C.dark, padding: "0 6%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30}} />
        <button onClick={() => window.location.hash = ""} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>← Volver</button>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: isMobile ? "32px 4%" : "48px 6%" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 8 }}>Quiero asociarme</h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>Completá el formulario y el equipo te va a contactar para coordinar la consulta médica, que es el paso previo a la vinculación.</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? C.dark : C.border }} />
          ))}
        </div>

        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "32px 28px" }}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Datos personales</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Nombre *</label><input value={form.nombre} onChange={e => set("nombre", e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Apellido *</label><input value={form.apellido} onChange={e => set("apellido", e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>DNI *</label><input value={form.dni} onChange={e => set("dni", e.target.value)} style={inputStyle} placeholder="Sin puntos" /></div>
                <div><label style={labelStyle}>Teléfono *</label><input value={form.telefono} onChange={e => set("telefono", e.target.value)} style={inputStyle} placeholder="Ej: 3512345678" /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email *</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>CUIT</label><input value={form.cuit} onChange={e => set("cuit", e.target.value)} style={inputStyle} placeholder="Sin guiones" /></div>
              {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button onClick={() => validarStep1() && setStep(2)} style={{ ...btnGreen, width: "100%", padding: 14 }}>Continuar →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Domicilio</h3>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Dirección *</label><input value={form.direccion} onChange={e => set("direccion", e.target.value)} style={inputStyle} placeholder="Calle y número" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Ciudad *</label><input value={form.ciudad} onChange={e => set("ciudad", e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Código postal</label><input value={form.codigo_postal} onChange={e => set("codigo_postal", e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Provincia</label><input value={form.provincia} onChange={e => set("provincia", e.target.value)} style={inputStyle} /></div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>¿Tenés REPROCANN activo?</label>
                <textarea value={form.notas} onChange={e => set("notas", e.target.value)} placeholder="Si ya tenés REPROCANN, contanos tu situación actual..." style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
              </div>
              {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 14, fontSize: 15, cursor: "pointer", fontFamily: F }}>← Atrás</button>
                <button onClick={enviar} disabled={loading} style={{ ...btnGreen, flex: 2, padding: 14 }}>{loading ? "Enviando..." : "Enviar solicitud"}</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, padding: "16px 20px", background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <p style={{ color: C.muted, fontSize: 13 }}>
            ¿Tenés dudas antes de completar el formulario?
            <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 700, marginLeft: 6 }}>Escribinos al WhatsApp →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SOCIOS (DNI) ───────────────────────────────────────────────
function LoginSocios({ onLogin }) {
  const isMobile = useIsMobile();
  const [paso, setPaso] = useState("dni"); // dni | preguntas
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socioData, setSocioData] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [intentos, setIntentos] = useState(0);

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Genera 2 preguntas de seguridad con los datos reales del socio
  const generarPreguntas = (s) => {
    const posibles = [];

    // Pregunta: mes de nacimiento
    if (s.fecha_nacimiento) {
      const mesReal = new Date(s.fecha_nacimiento + "T00:00:00").getMonth(); // 0-11
      const opcionesIdx = shuffle([...Array(12).keys()].filter(i => i !== mesReal)).slice(0, 3);
      const opciones = shuffle([mesReal, ...opcionesIdx]).map(i => MESES[i]);
      posibles.push({ id: "mes_nac", pregunta: "¿En qué mes naciste?", opciones, correcta: MESES[mesReal] });
    }

    // Pregunta: últimos 3 dígitos del teléfono
    if (s.telefono && s.telefono.replace(/\D/g, "").length >= 3) {
      const tel = s.telefono.replace(/\D/g, "");
      const real = tel.slice(-3);
      const fakes = new Set();
      while (fakes.size < 3) {
        const f = String(Math.floor(Math.random() * 900) + 100);
        if (f !== real) fakes.add(f);
      }
      const opciones = shuffle([real, ...fakes]);
      posibles.push({ id: "tel", pregunta: "¿Cuáles son los últimos 3 dígitos de tu teléfono?", opciones, correcta: real });
    }

    // Pregunta: ciudad
    if (s.ciudad) {
      const ciudadesFalsas = ["Villa María","Río Cuarto","Alta Gracia","Carlos Paz","Jesús María","San Francisco","Bell Ville","Cosquín"].filter(c => c.toLowerCase() !== s.ciudad.toLowerCase());
      const opciones = shuffle([s.ciudad, ...shuffle(ciudadesFalsas).slice(0, 3)]);
      posibles.push({ id: "ciudad", pregunta: "¿En qué ciudad vivís?", opciones, correcta: s.ciudad });
    }

    // Elegimos 2 preguntas al azar de las disponibles
    return shuffle(posibles).slice(0, 2);
  };

  const buscarDni = async (e) => {
    e.preventDefault();
    if (!dni.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await sb(`socios?dni=eq.${dni.trim()}&select=*`);
      if (!data || data.length === 0) {
        setError("El DNI ingresado no figura en nuestro registro.");
        setLoading(false);
        return;
      }
      const socio = data[0];
      if (socio.estado === "pendiente") {
        setError("Tu solicitud está pendiente de aprobación. El equipo te va a contactar pronto.");
        setLoading(false);
        return;
      }
      if (socio.estado !== "activo") {
        setError("Tu acceso no está activo. Escribinos al WhatsApp para regularizar.");
        setLoading(false);
        return;
      }
      const pregs = generarPreguntas(socio);
      if (pregs.length < 2) {
        // No hay datos suficientes para verificar: dejamos entrar solo con DNI (fallback)
        onLogin(socio);
        return;
      }
      setSocioData(socio);
      setPreguntas(pregs);
      setRespuestas({});
      setPaso("preguntas");
    } catch (e) {
      setError("Hubo un error. Intentá de nuevo.");
    }
    setLoading(false);
  };

  const verificarPreguntas = (e) => {
    e.preventDefault();
    const todasOk = preguntas.every(p => respuestas[p.id] === p.correcta);
    if (todasOk) {
      onLogin(socioData);
    } else {
      const nuevoIntento = intentos + 1;
      setIntentos(nuevoIntento);
      if (nuevoIntento >= 3) {
        setError("Demasiados intentos fallidos. Escribinos al WhatsApp para acceder.");
        setPaso("dni");
        setIntentos(0);
        setSocioData(null);
      } else {
        setError(`Respuestas incorrectas. Te quedan ${3 - nuevoIntento} intento${3 - nuevoIntento > 1 ? "s" : ""}.`);
        // Regenerar preguntas para el siguiente intento
        setPreguntas(generarPreguntas(socioData));
        setRespuestas({});
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {!isMobile && (
        <div style={{ width: "45%", background: C.dark, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 70%, rgba(43,122,62,0.4) 0%, transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 40}} />
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 16 }}>Zona de personas usuarias</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7 }}>Accedé al catálogo de variedades disponibles, solicitá tus retiros y consultá el estado de tus pedidos.</p>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, padding: isMobile ? "32px 6%" : "48px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {isMobile && <img src="/logo.png" alt="Cogollos" style={{ height: 44, marginBottom: 32 }} />}

          {paso === "dni" && (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>Ingresar</h1>
              <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Ingresá tu DNI para acceder al catálogo.</p>
              <form onSubmit={buscarDni}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tu DNI</label>
                  <input value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej: 25666777" autoFocus style={{ ...inputStyle, fontSize: 18, letterSpacing: "0.05em" }} />
                </div>
                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", color: "#991B1B", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                    {error}
                    {error.includes("pendiente") && <div style={{ marginTop: 8 }}><a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: "#991B1B", fontWeight: 700 }}>Consultar por WhatsApp →</a></div>}
                    {(error.includes("no figura") || error.includes("intentos")) && <div style={{ marginTop: 8 }}><a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: "#991B1B", fontWeight: 700 }}>Escribinos al WhatsApp →</a></div>}
                  </div>
                )}
                <button type="submit" disabled={loading || !dni.trim()} style={{ ...btnGreen, width: "100%", padding: 14, fontSize: 15, opacity: !dni.trim() ? 0.5 : 1 }}>{loading ? "Verificando..." : "Continuar"}</button>
              </form>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => window.location.hash = "#/asociarse"} style={{ background: C.light, color: C.dark, border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Quiero vincularme</button>
                <button onClick={() => window.location.hash = ""} style={{ background: "transparent", color: C.muted, border: "none", fontSize: 13, cursor: "pointer", fontFamily: F, padding: "8px" }}>← Volver al sitio</button>
              </div>
            </>
          )}

          {paso === "preguntas" && (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>Verificación</h1>
              <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Para confirmar tu identidad, respondé estas preguntas.</p>
              <form onSubmit={verificarPreguntas}>
                {preguntas.map(p => (
                  <div key={p.id} style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>{p.pregunta}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {p.opciones.map(op => (
                        <button key={op} type="button" onClick={() => setRespuestas(r => ({ ...r, [p.id]: op }))} style={{ padding: "12px 10px", borderRadius: 10, border: respuestas[p.id] === op ? `2px solid ${C.green}` : `1.5px solid ${C.border}`, background: respuestas[p.id] === op ? C.light : C.white, color: C.text, fontSize: 14, fontWeight: respuestas[p.id] === op ? 700 : 400, cursor: "pointer", fontFamily: F, textAlign: "center" }}>{op}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", color: "#991B1B", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>{error}</div>}
                <button type="submit" disabled={preguntas.some(p => !respuestas[p.id])} style={{ ...btnGreen, width: "100%", padding: 14, fontSize: 15, opacity: preguntas.some(p => !respuestas[p.id]) ? 0.5 : 1 }}>Acceder</button>
              </form>
              <button onClick={() => { setPaso("dni"); setError(""); setSocioData(null); setRespuestas({}); }} style={{ background: "transparent", color: C.muted, border: "none", fontSize: 13, cursor: "pointer", fontFamily: F, padding: "8px", marginTop: 16, width: "100%" }}>← Usar otro DNI</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LANDING INSTITUCIONAL ───────────────────────────────────────────
const PASOS = [
  { num: "01", titulo: "Alta en REPROCANN", desc: "Ingresá a reprocann.msal.gob.ar con tu cuenta de Mi Argentina. Elegí perfil Paciente, tipo de cultivo Otro, y copiá tu código de vinculación.", link: "https://reprocann.msal.gob.ar/" },
  { num: "02", titulo: "Consulta médica", desc: "Coordinamos un turno virtual con nuestro director médico. La consulta es necesaria para completar tu vinculación y comenzar a retirar.", link: "#/asociarse" },
  { num: "03", titulo: "Vinculación a Cogollos", desc: "El equipo médico te guía para completar la vinculación en Cannalizar. Una vez aprobada, sos parte de la asociación y podés retirar.", link: "https://app.cannalizar.com.ar/invite-patient?referal=1687099523011x992708761737770400" },
];

function Landing() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <div style={{ fontFamily: F, color: C.text, background: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { color: inherit; text-decoration: none; }
        button { transition: all 0.2s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 6px; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,253,248,0.97)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 64 }}>
        <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: isMobile ? 36 : 44, cursor: "pointer" }} onClick={() => scrollTo("inicio")} />
        {isMobile ? (
          <button onClick={() => setMenuOpen(o => !o)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 24, height: 2, background: C.text, borderRadius: 2, opacity: menuOpen && i === 1 ? 0 : 1 }} />)}
          </button>
        ) : (
          <div style={{ marginLeft: "auto", display: "flex", gap: 24, alignItems: "center" }}>
            {[["Nosotros","nosotros"],["Cómo funciona","como-funciona"],["Asociarse","asociarse"],["Autocultivo","#/autocultivo"]].map(([l,id]) => (
              <button key={id} onClick={() => id.startsWith("#") ? window.location.hash = id : scrollTo(id)} style={{ background: "none", border: "none", color: C.body, cursor: "pointer", fontSize: 15, fontFamily: F, fontWeight: 500 }}>{l}</button>
            ))}
            <button onClick={() => window.location.hash = "#/socios"} style={{ background: C.dark, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontFamily: F, fontWeight: 700, fontSize: 14 }}>Acceder como socio</button>
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99, background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 6%", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          {[["Nosotros","nosotros"],["Cómo funciona","como-funciona"],["Asociarse","asociarse"]].map(([l,id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: C.body, cursor: "pointer", fontSize: 16, fontFamily: F, fontWeight: 500, padding: "12px 0", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{l}</button>
          ))}
          <button onClick={() => { setMenuOpen(false); window.location.hash = "#/socios"; }} style={{ ...btnGreen, marginTop: 8, padding: 14 }}>Acceder como socio</button>
          <button onClick={() => { setMenuOpen(false); window.location.hash = "#/asociarse"; }} style={{ background: C.light, color: C.dark, border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Quiero asociarme</button>
        </div>
      )}

      {/* HERO */}
      <section id="inicio" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: isMobile ? "90px 6% 60px" : "100px 6% 80px", background: `linear-gradient(160deg, ${C.white} 50%, ${C.light} 100%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: C.light, color: C.dark, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 28 }}>ASOCIACIÓN CIVIL · RES. IPJ 207 C/21</div>
            <h1 style={{ fontSize: isMobile ? "clamp(30px,8vw,42px)" : "clamp(34px,4.5vw,54px)", fontWeight: 700, lineHeight: 1.15, color: C.text, marginBottom: 20 }}>
              Cannabis medicinal<br /><span style={{ color: C.green }}>legal y de calidad</span><br />en Córdoba
            </h1>
            <p style={{ color: C.body, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Somos la primera asociación cannábica de Argentina, fundada en 2001. Cultivamos cannabis medicinal para nuestros socios de forma legal, a través del sistema REPROCANN.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <button onClick={() => window.location.hash = "#/asociarse"} style={{ ...btnGreen, padding: isMobile ? "13px 22px" : "14px 28px", fontSize: isMobile ? 14 : 15, width: isMobile ? "100%" : "auto" }}>Quiero asociarme</button>
              <button onClick={() => window.location.hash = "#/socios"} style={{ background: "transparent", color: C.green, border: `2px solid ${C.green}`, borderRadius: 10, padding: isMobile ? "13px 22px" : "14px 28px", fontFamily: F, fontWeight: 700, fontSize: isMobile ? 14 : 15, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>Soy socio →</button>
            </div>
            <div style={{ display: "flex", gap: isMobile ? 24 : 40, flexWrap: "wrap" }}>
              {[["2001","Fundación"],["REPROCANN","Habilitados"],["5","Variedades propias"]].map(([n,l]) => (
                <div key={l}><div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: C.green }}>{n}</div><div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{l}</div></div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "center" }}>
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
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: C.text, marginBottom: 20, lineHeight: 1.2 }}>La primera asociación cannábica de Argentina</h2>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 16, lineHeight: 1.8 }}>Cogollos Córdoba fue fundada en 2001 por cultivadores y activistas que trabajaban por la despenalización del cannabis y el reconocimiento de sus usos terapéuticos. Desde la sanción de la ley REPROCANN, somos una ONG habilitada para cultivar cannabis medicinal para nuestros socios.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
            {[
              { titulo: "Edith 'La Negra' Moreno", texto: "Pionera en la lucha por los derechos de personas con VIH y el uso terapéutico del cannabis. Motor fundacional de Cogollos Córdoba y figura histórica del movimiento cannábico argentino." },
              { titulo: "Investigación con INTA", texto: "Trabajamos junto al Instituto Nacional de Tecnología Agropecuaria en el mejoramiento genético de nuestras variedades, para garantizar la mayor calidad posible." },
              { titulo: "Habilitación legal", texto: "Asociación Civil inscripta (Res. IPJ 207 C/21, CUIT 30-71728612-6), habilitada por REPROCANN. Cultivamos legalmente para nuestros socios vinculados." },
            ].map(card => (
              <div key={card.titulo} style={{ background: C.pale, borderRadius: 12, padding: "28px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ width: 4, height: 32, background: C.green, borderRadius: 4, marginBottom: 20 }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 12 }}>{card.titulo}</h3>
                <p style={{ color: C.body, fontSize: 14, lineHeight: 1.7 }}>{card.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.pale }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 600, marginBottom: 48 }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>CÓMO FUNCIONA</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.2 }}>El cannabis lo cultivamos nosotros, vos lo retirás</h2>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 15, lineHeight: 1.7 }}>No es una compra ni una venta. Somos una asociación que cultiva en nombre de sus socios dentro del marco legal de REPROCANN. Cada socio retira su parte de la producción colectiva.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 24, marginBottom: 48 }}>
            {[
              { icon: "📋", titulo: "Marco legal", desc: "Todo funciona dentro del registro REPROCANN del Ministerio de Salud. La vinculación a nuestra ONG es el mecanismo legal que habilita el cultivo colectivo." },
              { icon: "🌱", titulo: "Cultivo colectivo", desc: "Nuestro equipo cultiva las variedades medicinales en nombre de los socios vinculados. Garantizamos calidad, trazabilidad y continuidad de la producción." },
              { icon: "📦", titulo: "Retiro programado", desc: "Los socios retiran su flor seca los lunes, miércoles y viernes. El retiro se coordina con al menos un día de anticipación." },
            ].map(item => (
              <div key={item.titulo} style={{ background: C.white, borderRadius: 12, padding: "28px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10 }}>{item.titulo}</h3>
                <p style={{ color: C.body, fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ASOCIARSE */}
      <section id="asociarse" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? 36 : 56 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>CÓMO ASOCIARSE</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>El proceso de vinculación</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : 16, maxWidth: 520 }}>El proceso completo lleva entre 1 y 2 semanas. Te acompañamos en cada paso.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
            {PASOS.map((paso, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: "rgba(255,255,255,0.12)", marginBottom: 16, lineHeight: 1 }}>{paso.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{paso.titulo}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{paso.desc}</p>
                <a href={paso.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", color: "#6FD67F", fontSize: 13, fontWeight: 700, borderBottom: "1px solid rgba(111,214,127,0.4)", paddingBottom: 2 }}>Ir al sitio →</a>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => window.location.hash = "#/asociarse"} style={{ background: "#6FD67F", color: C.text, border: "none", borderRadius: 10, padding: "14px 28px", fontFamily: F, fontWeight: 700, fontSize: 15, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>Iniciar mi solicitud</button>
            <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "14px 28px", fontFamily: F, fontWeight: 600, fontSize: 15, display: "inline-block", width: isMobile ? "100%" : "auto", textAlign: "center" }}>Consultar por WhatsApp</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000", padding: isMobile ? "48px 6% 28px" : "60px 6% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap: isMobile ? 32 : 40, marginBottom: isMobile ? 32 : 48 }}>
            <div>
              <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 48, marginBottom: 16 }} />
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginBottom: 16 }}>Asociación Civil sin fines de lucro. Fundada en 2001. Habilitada por REPROCANN para el cultivo de cannabis medicinal.</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Res. IPJ 207 C/21 · CUIT 30-71728612-6</p>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Navegación</div>
              {[["Inicio","inicio"],["Nosotros","nosotros"],["Cómo funciona","como-funciona"],["Asociarse","asociarse"]].map(([l,id]) => (
                <div key={id} style={{ marginBottom: 8 }}><button onClick={() => document.getElementById(id)?.scrollIntoView({behavior:"smooth"})} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 13, fontFamily: F, padding: 0 }}>{l}</button></div>
              ))}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Contacto</div>
              <div style={{ marginBottom: 12 }}><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 3 }}>EMAIL</div><a href="mailto:cogollosargentina@gmail.com" style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>cogollosargentina@gmail.com</a></div>
              <div style={{ marginBottom: 24 }}><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 3 }}>WHATSAPP</div><a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>+54 9 3518 05-7172</a></div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://www.instagram.com/asociacioncivilcogolloscordoba/" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>Instagram</a>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <a href="https://www.facebook.com/LaEdithMorenoCogollosCBA/" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>Facebook</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2026 Asociación Civil Cogollos Córdoba</span>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => window.location.hash = "#/medica"} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 11, fontFamily: F }}>Portal médico</button>
              <button onClick={() => window.location.hash = "#/admin"} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 11, fontFamily: F }}>Acceso equipo</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── PORTAL MÉDICO ───────────────────────────────────────────────────
function LoginMedica({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    if (user === MEDICA_USER && pass === MEDICA_PASS) {
      sessionStorage.setItem("cogo_medica", "1");
      onLogin();
    } else {
      setError("Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, fontFamily: F, padding: "0 6%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 16 }} />
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.1em" }}>PORTAL MÉDICO</div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "36px 32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Usuario</label>
              <input value={user} onChange={e => setUser(e.target.value)} autoFocus style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} style={inputStyle} />
            </div>
            {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 20 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...btnGreen, width: "100%", padding: 14 }}>{loading ? "Ingresando..." : "Ingresar"}</button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => { window.location.hash = ""; }} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500 }}>← Volver al sitio</button>
        </p>
      </div>
    </div>
  );
}

function PortalMedico({ onLogout }) {
  const isMobile = useIsMobile();
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendientes");
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ fecha_consulta: "", notas_medicas: "", consulta_realizada: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const load = async () => {
    setLoading(true);
    const data = await sb("socios?select=*&order=created_at.desc");
    setSocios(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrirEditar = (s) => {
    setEditando(s);
    setForm({
      fecha_consulta: s.fecha_consulta || "",
      notas_medicas: s.notas_medicas || "",
      consulta_realizada: s.consulta_realizada || false,
    });
  };

  const guardar = async () => {
    setSaving(true);
    await sb(`socios?id=eq.${editando.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        fecha_consulta: form.fecha_consulta || null,
        // Si marcó consulta realizada, pasa a estado activo automáticamente
        estado: form.consulta_realizada ? "activo" : editando.estado,
      }),
    });
    setSocios(ss => ss.map(s => s.id === editando.id ? {
      ...s, ...form,
      estado: form.consulta_realizada ? "activo" : s.estado
    } : s));
    showToast(form.consulta_realizada ? "Consulta registrada — socio activado" : "Notas guardadas");
    setEditando(null);
    setSaving(false);
  };

  const filtrados = socios.filter(s => {
    const matchFiltro = filtro === "todos" ? true : filtro === "pendientes" ? s.estado === "pendiente" && !s.consulta_realizada : filtro === "con_consulta" ? s.consulta_realizada : s.estado === "activo";
    const q = search.toLowerCase();
    const matchSearch = !q || s.nombre?.toLowerCase().includes(q) || s.dni?.includes(q);
    return matchFiltro && matchSearch;
  });

  const stats = {
    pendientes: socios.filter(s => s.estado === "pendiente" && !s.consulta_realizada).length,
    con_consulta: socios.filter(s => s.consulta_realizada).length,
    activos: socios.filter(s => s.estado === "activo").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input, select, textarea { font-family: inherit; }`}</style>

      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30}} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginLeft: 12 }}>Portal médico</span>
        <button onClick={onLogout} style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>Salir</button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 4%" : "32px 6%" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 24 }}>Agenda de consultas</h2>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            ["Sin consulta", stats.pendientes, "#991B1B"],
            ["Con consulta", stats.con_consulta, "#8C6B1A"],
            ["Activados", stats.activos, C.green],
          ].map(([l,v,c]) => (
            <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {[["pendientes","Sin consulta"],["con_consulta","Con consulta"],["activos","Activados"],["todos","Todos"]].map(([v,l]) => (
            <button key={v} onClick={() => setFiltro(v)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: filtro===v?"none":`1px solid ${C.border}`, background: filtro===v?C.dark:C.white, color: filtro===v?"#fff":C.muted, fontFamily: F }}>{l}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre o DNI..." style={{ ...inputStyle, width: 200, marginLeft: "auto", fontSize: 13, padding: "8px 12px" }} />
        </div>

        {/* Lista */}
        {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : filtrados.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Sin resultados</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtrados.map(s => (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.consulta_realizada ? C.light : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.consulta_realizada ? C.dark : "#991B1B", flexShrink: 0 }}>
                  {s.nombre?.charAt(0) || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{s.nombre}</div>
                  <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>DNI {s.dni}</span>
                    {s.telefono && <span>{s.telefono}</span>}
                    {s.fecha_consulta && <span>Consulta: {new Date(s.fecha_consulta).toLocaleDateString("es-AR")}</span>}
                    {s.notas && <span style={{ color: C.body, fontStyle: "italic" }}>{s.notas.slice(0, 60)}{s.notas.length > 60 ? "..." : ""}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: s.consulta_realizada ? C.light : s.estado === "pendiente" ? "#FAEEDA" : "#EAF3DE", color: s.consulta_realizada ? C.dark : s.estado === "pendiente" ? "#633806" : "#27500A" }}>
                    {s.consulta_realizada ? "Consulta realizada" : s.estado}
                  </span>
                  <button onClick={() => abrirEditar(s)} style={{ ...btnGreen, padding: "6px 14px", fontSize: 12 }}>Registrar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{editando.nombre}</div>
                <div style={{ fontSize: 12, color: C.muted }}>DNI {editando.dni} · {editando.telefono}</div>
              </div>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.muted }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              {editando.notas && (
                <div style={{ background: C.pale, borderRadius: 8, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: C.body, lineHeight: 1.6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nota del socio</div>
                  {editando.notas}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fecha de consulta</label>
                <input type="date" value={form.fecha_consulta} onChange={e => setForm(f => ({...f, fecha_consulta: e.target.value}))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notas médicas</label>
                <textarea value={form.notas_medicas} onChange={e => setForm(f => ({...f, notas_medicas: e.target.value}))} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Observaciones de la consulta..." />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 24, padding: "14px 16px", background: form.consulta_realizada ? C.light : C.pale, borderRadius: 10, border: `1.5px solid ${form.consulta_realizada ? C.green : C.border}` }}>
                <input type="checkbox" checked={form.consulta_realizada} onChange={e => setForm(f => ({...f, consulta_realizada: e.target.checked}))} style={{ width: 18, height: 18, accentColor: C.dark }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Marcar consulta como realizada</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Activa automáticamente al socio para que pueda retirar</div>
                </div>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditando(null)} style={{ flex: 1, background: "transparent", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 13, fontSize: 14, cursor: "pointer", fontFamily: F }}>Cancelar</button>
                <button onClick={guardar} disabled={saving} style={{ ...btnGreen, flex: 2, padding: 13 }}>{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.dark, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontFamily: F, zIndex: 9999 }}>{toast}</div>}
    </div>
  );
}

// ─── AUTOCULTIVO ─────────────────────────────────────────────────────
function Autocultivo() {
  const isMobile = useIsMobile();

  const pasos = [
    { num: "01", titulo: "Registrate en REPROCANN", desc: "Ingresá a reprocann.msal.gob.ar con tu cuenta de Mi Argentina. Elegí perfil Paciente y tipo de cultivo Autocultivo. Completá tus datos y guardá tu código de vinculación.", link: "https://reprocann.msal.gob.ar/", linkText: "Ir a REPROCANN" },
    { num: "02", titulo: "Consulta con un médico", desc: "REPROCANN requiere que un médico avale tu solicitud. Podés agendar una consulta virtual con nuestro director médico para obtener el aval necesario, sin necesidad de asociarte a Cogollos.", link: "#/asociarse", linkText: "Completar formulario →" },
    { num: "03", titulo: "Presentá la documentación", desc: "Con el aval médico completás tu registro en REPROCANN. Una vez aprobado, tenés habilitación legal para cultivar hasta 9 plantas de cannabis para uso personal." },
    { num: "04", titulo: "Empezá a cultivar", desc: "Con tu REPROCANN aprobado podés cultivar de forma legal en tu domicilio. Si en algún momento querés sumarte a nuestra asociación para acceder a flor seca de calidad, las puertas están abiertas." },
  ];

  const faqs = [
    { q: "¿Cuántas plantas puedo tener?", r: "Con REPROCANN como autocultivador podés tener hasta 9 plantas de cannabis." },
    { q: "¿Necesito ser médico para registrarme?", r: "No, pero sí necesitás el aval de un médico que certifique tu uso terapéutico." },
    { q: "¿Puedo hacer autocultivo y también ser socio de Cogollos?", r: "Sí, pero en ese caso tu REPROCANN se vincula a nuestra ONG como cultivador colectivo, no como autocultivador individual. Son dos modalidades distintas." },
    { q: "¿Qué pasa si ya tengo REPROCANN como autocultivador y quiero asociarme?", r: "Hay dos caminos: convenio bilateral entre tu registro y nuestra ONG, o dar de baja el autocultivo y reiniciar vinculado a Cogollos. En ambos casos necesitás una consulta médica con nuestro director." },
  ];

  return (
    <div style={{ fontFamily: F, color: C.text, background: C.cream }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } html { scroll-behavior: smooth; }`}</style>

      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30, cursor: "pointer" }} onClick={() => window.location.hash = ""} />
        <button onClick={() => window.location.hash = ""} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>← Inicio</button>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${C.dark} 0%, #2B7A3E 100%)`, padding: isMobile ? "60px 6% 50px" : "80px 6% 70px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 24 }}>GUÍA DE AUTOCULTIVO</div>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>Cultivá tu cannabis de forma legal</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 15 : 17, lineHeight: 1.75, marginBottom: 32 }}>Si querés cultivar para uso personal, REPROCANN te da el marco legal para hacerlo. Te explicamos el proceso paso a paso.</p>
          <button onClick={() => window.location.hash = "#/asociarse"} style={{ display: "inline-block", background: "#6FD67F", color: C.text, borderRadius: 10, padding: "13px 28px", fontFamily: F, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", textDecoration: "none" }}>Completar formulario →</button>
        </div>
      </div>

      {/* Pasos */}
      <div style={{ padding: isMobile ? "60px 6%" : "80px 6%", background: C.white }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: C.text, marginBottom: 40, textAlign: "center" }}>Paso a paso</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {pasos.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "28px 28px", background: C.pale, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: C.border, lineHeight: 1, flexShrink: 0, minWidth: 48 }}>{p.num}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.titulo}</h3>
                  <p style={{ color: C.body, fontSize: 14, lineHeight: 1.7, marginBottom: p.link ? 14 : 0 }}>{p.desc}</p>
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>{p.linkText} →</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div style={{ padding: isMobile ? "60px 6%" : "80px 6%", background: C.pale }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: C.text, marginBottom: 36, textAlign: "center" }}>Preguntas frecuentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: "20px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.7 }}>{f.r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: isMobile ? "60px 6%" : "80px 6%", background: C.dark, textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>¿Preferís no cultivar vos mismo?</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>Como socio de Cogollos, nosotros cultivamos por vos. Retirás tu flor seca sin preocuparte por el cultivo.</p>
        <button onClick={() => window.location.hash = "#/asociarse"} style={{ background: "#6FD67F", color: C.text, border: "none", borderRadius: 10, padding: "13px 28px", fontFamily: F, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Quiero asociarme a Cogollos</button>
      </div>

      <footer style={{ background: "#000", padding: "24px 6%", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2026 Asociación Civil Cogollos Córdoba</span>
        <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>WhatsApp: +54 9 3518 05-7172</a>
      </footer>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────
export default function App() {
  const hash = useHash();
  const [socio, setSocio] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => sessionStorage.getItem("cogo_admin") === "1");
  const [medicaLoggedIn, setMedicaLoggedIn] = useState(() => sessionStorage.getItem("cogo_medica") === "1");

  useEffect(() => {
    const titles = { "#/admin": "Panel · Cogollos", "#/socios": "Socios · Cogollos", "#/medica": "Portal Médico · Cogollos", "#/autocultivo": "Autocultivo · Cogollos", "#/asociarse": "Asociarse · Cogollos" };
    document.title = titles[hash] || "Cogollos Córdoba";
  }, [hash]);

  if (hash === "#/admin") {
    if (!adminLoggedIn) return <LoginAdmin onLogin={() => setAdminLoggedIn(true)} />;
    return <Dashboard onLogout={() => { sessionStorage.removeItem("cogo_admin"); setAdminLoggedIn(false); window.location.hash = ""; }} />;
  }

  if (hash === "#/medica") {
    if (!medicaLoggedIn) return <LoginMedica onLogin={() => setMedicaLoggedIn(true)} />;
    return <PortalMedico onLogout={() => { sessionStorage.removeItem("cogo_medica"); setMedicaLoggedIn(false); window.location.hash = ""; }} />;
  }

  if (hash === "#/asociarse") return <FormularioAlta />;
  if (hash === "#/autocultivo") return <Autocultivo />;

  if (hash === "#/socios") {
    if (!socio) return <LoginSocios onLogin={s => setSocio(s)} />;
    return <ZonaSocios socio={socio} onLogout={() => { setSocio(null); window.location.hash = ""; }} />;
  }

  return <Landing />;
}