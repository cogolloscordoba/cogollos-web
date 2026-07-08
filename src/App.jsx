import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Delivery from "./Delivery";

// ─── Supabase ────────────────────────────────────────────────────────
const SB_URL = "https://mphiidkjfjxcqrrfbpfu.supabase.co";
const SB_KEY = "sb_publishable_sKq0rU3ft8rEHCO8MeF0Kg_ciDXTfpz";
const sb = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...opts.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ─── Login admin via Supabase Auth ──────────────────────────────────
async function loginAdminSupabase(email, password) {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ? data : null;
}

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
    const sesion = await loginAdminSupabase(user.trim(), pass);
    if (sesion) {
      sessionStorage.setItem("cogo_admin", "1");
      sessionStorage.setItem("cogo_admin_token", sesion.access_token);
      onLogin();
    } else {
      setError("Email o contraseña incorrectos");
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
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
              <input type="email" value={user} onChange={e => setUser(e.target.value)} autoFocus style={inputStyle} />
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
  const [modalidad, setModalidad] = useState("delivery");
  const [enviando, setEnviando] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    sb("productos?select=*&activo=eq.true&order=nombre").then(data => setProductos(Array.isArray(data) ? data : []));
    sb("rpc/pedidos_de_socio", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_socio_id: socio.id }),
    }).then(data => setPedidos(Array.isArray(data) ? data : []));
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

    // Crear un único ticket para todo el pedido
    const ticketId = Date.now().toString() + Math.random().toString(36).slice(2);
    const resumenItems = items.map(([pid, cant]) => {
      const prod = productos.find(p => p.id === pid);
      return `${prod?.nombre} x${cant}`;
    }).join(", ");

    await sb("tickets", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: ticketId,
        tipo: "retiro",
        prioridad: "media",
        resumen: `${modalidad === "delivery" ? "Delivery" : "Retiro"} ${turno}: ${resumenItems}`,
        socio_id: socio.id,
        telefono: socio.telefono,
        estado: "abierto",
      }),
    });

    // Crear un pedido por producto, todos vinculados al mismo ticket
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
          modalidad: modalidad,
          estado: "pendiente",
          ticket_id: ticketId,
        }),
      });
    }

    setCantidades({});
    setPedidoEnviado(true);
    setEnviando(false);
    sb("rpc/pedidos_de_socio", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_socio_id: socio.id }),
    }).then(data => setPedidos(Array.isArray(data) ? data : []));
  };

  const estadoColor = { pendiente: ["#FAEEDA","#633806"], preparando: ["#EEEDFE","#3C3489"], en_camino: ["#E6F1FB","#0C447C"], entregado: ["#EAF3DE","#27500A"], cancelado: ["#FCEBEB","#A32D2D"] };

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>

      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Hola, {socio.nombre.split(" ")[0]}</span>
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>Salir</button>
        </div>
      </div>

      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", gap: 4 }}>
        {[["catalogo","Catálogo"], ["mis-pedidos","Mis retiros"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "14px 20px", fontSize: 14, fontWeight: tab===id ? 700 : 400, color: tab===id ? C.dark : C.muted, background: "none", border: "none", borderBottom: tab===id ? `3px solid ${C.dark}` : "3px solid transparent", cursor: "pointer", fontFamily: F }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 4%" : "32px 6%" }}>
        {tab === "catalogo" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Variedades disponibles</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>Variedades de desarrollo propio, registradas en conjunto con INTA en el Instituto Nacional de Semillas (INASE). Cultivadas con estándares agroecológicos y trazabilidad completa. Los retiros se coordinan los lunes, miércoles y viernes — también tenemos delivery.</p>
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

            {totalUnidades > 0 && !pedidoEnviado && (
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "24px 28px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Confirmar retiro</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Modalidad</label>
                    <select value={modalidad} onChange={e => setModalidad(e.target.value)} style={{ ...inputStyle }}>
                      <option value="delivery">Delivery</option>
                      <option value="retiro">Retiro en sede</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{modalidad === "retiro" ? "Día de retiro" : "Día de entrega"}</label>
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
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>{totalUnidades} unidad{totalUnidades > 1 ? "es" : ""} · {modalidad === "retiro" ? "Retiro en sede" : "Delivery"} {turno}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>${totalPrecio.toLocaleString("es-AR")}</div>
                  </div>
                  <button onClick={confirmarRetiro} disabled={enviando} style={{ ...btnGreen, padding: "12px 28px" }}>{enviando ? "Enviando..." : "Confirmar retiro"}</button>
                </div>
              </div>
            )}

            {pedidoEnviado && (
              <div style={{ background: C.light, border: `1.5px solid ${C.green}`, borderRadius: 14, padding: "24px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 8 }}>¡Retiro registrado!</div>
                <p style={{ color: C.body, fontSize: 14, marginBottom: 16 }}>Tu solicitud está en camino. El equipo te va a contactar por WhatsApp para confirmar {modalidad === "retiro" ? "el retiro en sede" : "la entrega"} del {turno}.</p>
                <button onClick={() => { setPedidoEnviado(false); setTab("mis-pedidos"); }} style={{ ...btnGreen, padding: "10px 24px", fontSize: 14 }}>Ver mis retiros</button>
              </div>
            )}
          </div>
        )}

        {tab === "mis-pedidos" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 24 }}>Mis retiros</h2>
            {pedidos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: 15, marginBottom: 12 }}>Todavía no tenés retiros registrados</div>
                <p style={{ fontSize: 13, marginBottom: 20, color: C.muted }}>Seleccioná lo que necesités del catálogo y coordinamos el retiro.</p>
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
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.producto_nombre || "—"}</div>
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
      const existente = await sb("rpc/dni_existe", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ p_dni: form.dni.trim() }),
      });
      if (existente === true) {
        setError("Ya existe un registro con ese DNI. Si creés que es un error, escribinos al WhatsApp y te ayudamos.");
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
          origen: "web",
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, fontFamily: F, padding: "40px 6%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 32 }} />
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "40px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12 }}>¡Recibimos tu solicitud!</h2>
          <p style={{ color: C.body, fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Gracias por dar el primer paso. <strong>Te vamos a acompañar en todo el proceso de vinculación</strong>, que incluye el alta en REPROCANN y la consulta con nuestro director médico.
          </p>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            Los datos que nos dejaste se usan únicamente para gestionar tu <strong>alta en REPROCANN</strong> y coordinar tu <strong>consulta médica</strong>. Tu privacidad es importante para nosotros.
          </p>
          <div style={{ background: C.pale, borderRadius: 12, padding: "24px 20px", marginBottom: 8 }}>
            <p style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>El siguiente paso es escribirnos por WhatsApp:</p>
            <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", padding: "14px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: F }}>
              <span style={{ fontSize: 20 }}>💬</span> Escribinos por WhatsApp
            </a>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 16, lineHeight: 1.6 }}>¿No tenés WhatsApp a mano? Guardá nuestro número:</p>
            <p style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 4, letterSpacing: "0.02em" }}>+54 9 3518 05-7172</p>
          </div>
          <div style={{ marginTop: 24 }}>
            <button onClick={() => window.location.hash = ""} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontFamily: F, fontSize: 14, fontWeight: 500 }}>← Volver al sitio</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ background: C.dark, padding: "0 6%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30 }} />
        <button onClick={() => window.location.hash = ""} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>← Volver</button>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: isMobile ? "32px 4%" : "48px 6%" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 8 }}>Quiero asociarme</h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>Completá el formulario y el equipo te va a contactar para coordinar la consulta médica, que es el paso previo a tu vinculación con la ONG.</p>
        </div>
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

// ─── LOGIN SOCIOS ─────────────────────────────────────────────────────
function LoginSocios({ onLogin }) {
  const [paso, setPaso] = useState("dni");
  const [dni, setDni] = useState("");
  const [mes, setMes] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [reqMes, setReqMes] = useState(false);
  const [reqCiudad, setReqCiudad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const seguirDni = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{7,8}$/.test(dni.trim())) { setError("Ingresá un DNI válido (7 u 8 dígitos)."); return; }
    setLoading(true);
    try {
      const data = await sb("rpc/login_socio_v3", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ p_dni: dni.trim() }),
      });
      if (data && data.motivo === "faltan_datos") {
        setReqMes(data.requiere_mes === true);
        setReqCiudad(data.requiere_ciudad === true);
        setPaso("verificar");
      } else if (data && data.motivo === "ficha_incompleta") {
        setError("No podemos verificar tu identidad automáticamente. Escribinos al WhatsApp +54 9 3518 05-7172 y te ayudamos a acceder.");
      } else if (data && data.motivo === "datos_incorrectos") {
        setReqMes(true); setReqCiudad(true); setPaso("verificar");
      } else {
        setError("Hubo un error. Intentá de nuevo en unos minutos.");
      }
    } catch (err) {
      setError("Hubo un error. Intentá de nuevo en unos minutos.");
    }
    setLoading(false);
  };

  const verificar = async (e) => {
    e.preventDefault();
    if (reqMes && !mes) { setError("Elegí tu mes de nacimiento."); return; }
    if (reqCiudad && !ciudad.trim()) { setError("Ingresá tu ciudad."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await sb("rpc/login_socio_v3", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ p_dni: dni.trim(), p_mes: reqMes ? Number(mes) : null, p_ciudad: reqCiudad ? ciudad.trim() : null }),
      });
      if (data && data.ok === true && data.socio) { onLogin(data.socio); return; }
      if (data && data.motivo === "no_activo") {
        setError("Tu cuenta todavía no está activa. Estamos procesando tu vinculación — escribinos al WhatsApp +54 9 3518 05-7172 y te contamos en qué paso estamos.");
        setLoading(false); return;
      }
      if (data && data.motivo === "ficha_incompleta") {
        setError("No podemos verificar tu identidad automáticamente. Escribinos al WhatsApp +54 9 3518 05-7172 y te ayudamos.");
        setLoading(false); return;
      }
      const n = intentos + 1;
      setIntentos(n);
      if (n >= 4) {
        setError("Demasiados intentos. Si no podés acceder, escribinos al WhatsApp +54 9 3518 05-7172.");
      } else {
        setError("Los datos no coinciden. Revisá e intentá de nuevo.");
      }
    } catch (err) {
      setError("Hubo un error. Intentá de nuevo en unos minutos.");
    }
    setLoading(false);
  };

  const volverDni = () => { setPaso("dni"); setError(""); setMes(""); setCiudad(""); setReqMes(false); setReqCiudad(false); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pale, fontFamily: F, padding: "0 6%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 56, marginBottom: 16 }} />
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.1em" }}>ACCESO SOCIOS</div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "36px 32px" }}>
          {paso === "dni" && (
            <form onSubmit={seguirDni}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tu DNI (sin puntos)</label>
                <input value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoFocus placeholder="Ej: 44999653" style={inputStyle} />
              </div>
              {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 20 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ ...btnGreen, width: "100%", padding: 14, opacity: loading ? 0.5 : 1 }}>{loading ? "Verificando..." : "Continuar"}</button>
            </form>
          )}
          {paso === "verificar" && (
            <>
              <p style={{ fontSize: 14, color: C.body, marginBottom: 20, lineHeight: 1.6 }}>Para confirmar tu identidad, ingresá {reqMes && reqCiudad ? "estos datos" : "este dato"}:</p>
              <form onSubmit={verificar}>
                {reqMes && (
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Mes de nacimiento</label>
                    <select value={mes} onChange={e => setMes(e.target.value)} style={inputStyle}>
                      <option value="">Elegí un mes...</option>
                      {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                )}
                {reqCiudad && (
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ciudad donde vivís</label>
                    <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ej: Córdoba" style={inputStyle} />
                  </div>
                )}
                {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 20 }}>{error}</div>}
                <button type="submit" disabled={loading || intentos >= 4} style={{ ...btnGreen, width: "100%", padding: 14, opacity: (loading || intentos >= 4) ? 0.5 : 1 }}>{loading ? "Verificando..." : "Acceder"}</button>
              </form>
              <button onClick={volverDni} style={{ background: "transparent", color: C.muted, border: "none", fontSize: 13, cursor: "pointer", fontFamily: F, padding: "8px", marginTop: 16, width: "100%" }}>← Usar otro DNI</button>
            </>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
          <button onClick={() => { window.location.hash = ""; }} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500 }}>← Volver al sitio</button>
        </p>
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────
const PASOS = [
  { num: "01", titulo: "Alta en Mi Argentina y REPROCANN", desc: "Ingresá a reprocann.msal.gob.ar con tu cuenta de Mi Argentina. Elegí perfil Paciente, tipo de cultivo Otro, y copiá tu código de vinculación. Sacá una captura donde figuren tus datos y tu código de vinculación y envíanosla por WhatsApp.", link: "https://reprocann.msal.gob.ar/" },
  { num: "02", titulo: "Consulta médica", desc: "Completá el formulario con tus datos para que la ONG pueda coordinar tu vinculación.", link: "#/asociarse" },
  { num: "03", titulo: "Vinculación en Cannalizar", desc: "Ya estamos cerca: completá la ficha médica y se te asignará un turno para hablar con nuestra dirección médica (horario a convenir). La consulta médica tiene un costo de $80.000 — con descuento asociativo pagás $40.000." },
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

      <section id="inicio" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: isMobile ? "90px 6% 60px" : "100px 6% 80px", background: `linear-gradient(160deg, ${C.white} 50%, ${C.light} 100%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: C.light, color: C.dark, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 28 }}>ASOCIACIÓN CIVIL · HABILITADA POR REPROCANN</div>
            <h1 style={{ fontSize: isMobile ? "clamp(30px,8vw,42px)" : "clamp(34px,4.5vw,54px)", fontWeight: 700, lineHeight: 1.15, color: C.text, marginBottom: 20 }}>
              Cannabis medicinal<br /><span style={{ color: C.green }}>cultivado con cuidado</span><br />para vos
            </h1>
            <p style={{ color: C.body, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Somos la primera asociación cannábica de Argentina, fundada en 2001 en Córdoba. Cultivamos cannabis medicinal de manera legal, agroecológica y trazable, dentro del marco de la ley 27.350 y el registro REPROCANN del Ministerio de Salud.
            </p>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 480 }}>
              Trabajamos en conjunto con INTA, UTN y UNC para garantizar la mejor calidad en cada variedad. No cobramos inscripción ni membresía mensual — solo la medicina que retirás.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <button onClick={() => window.location.hash = "#/asociarse"} style={{ ...btnGreen, padding: isMobile ? "13px 22px" : "14px 28px", fontSize: isMobile ? 14 : 15, width: isMobile ? "100%" : "auto" }}>Quiero asociarme</button>
              <button onClick={() => window.location.hash = "#/socios"} style={{ background: "transparent", color: C.green, border: `2px solid ${C.green}`, borderRadius: 10, padding: isMobile ? "13px 22px" : "14px 28px", fontFamily: F, fontWeight: 700, fontSize: isMobile ? 14 : 15, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>Acceso socios →</button>
            </div>
            <div style={{ display: "inline-block", background: C.light, color: C.dark, borderRadius: 8, padding: "12px 20px", fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>
              Sin membresía mensual · Sin costo de inscripción
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src="/logo.png" alt="Cogollos Córdoba" style={{ maxWidth: 380, width: "100%" }} />
            </div>
          )}
        </div>
      </section>

      <section id="nosotros" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>QUIÉNES SOMOS</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: C.text, marginBottom: 20, lineHeight: 1.2 }}>La primera asociación cannábica de Argentina</h2>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 16, lineHeight: 1.8 }}>Somos activistas, cultivadores y profesionales que trabajan por los derechos de las personas usuarias de cannabis y el reconocimiento de sus usos terapéuticos. Desde 2001 acompañamos a personas en su acceso al cannabis medicinal de calidad, y desde la sanción de la ley 27.350 somos una ONG habilitada para cultivar en nombre de nuestros socios vinculados.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
            {[
              { titulo: "Edith 'La Negra' Moreno", texto: "Pionera en la lucha por los derechos de personas con VIH y el uso terapéutico del cannabis. Figura histórica del movimiento cannábico argentino y motor fundacional de Cogollos Córdoba." },
              { titulo: "Investigación y desarrollo", texto: "Trabajamos junto a INTA en un proyecto de mejoramiento genético y registro de variedades propias, y junto a UTN y UNC en métodos de extracción y administración de cannabis medicinal." },
              { titulo: "Marco legal vigente", texto: "Asociación Civil inscripta (Res. IPJ 207 C/21, CUIT 30-71728612-6), habilitada por REPROCANN. Cultivamos con respaldo legal como ONG vinculada a la salud pública." },
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

      <section id="como-funciona" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.pale }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 600, marginBottom: 48 }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>CÓMO FUNCIONA</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.2 }}>Nosotros cultivamos, vos retirás tu medicina</h2>
            <p style={{ color: C.body, fontSize: isMobile ? 14 : 15, lineHeight: 1.7 }}>Completás los requisitos de inscripción y hacés una consulta con nuestra dirección médica. Después te vinculamos a la ONG y empezamos a cultivar por vos. No cobramos inscripción ni membresía mensual — solo la medicina que retirás. La consulta médica tiene un descuento del 50% para quienes se vinculan por cultivo asociativo.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 24, marginBottom: 48 }}>
            {[
              { icon: "📋", titulo: "Marco legal", desc: "Todo funciona dentro del registro REPROCANN del Ministerio de Salud. La vinculación a nuestra ONG es el mecanismo legal que habilita el cultivo colectivo y te protege como paciente." },
              { icon: "🌱", titulo: "Cultivo propio", desc: "Nuestro equipo cultiva las variedades en nombre de los socios vinculados. Variedades propias, registradas con INTA, con trazabilidad y continuidad garantizada." },
              { icon: "📦", titulo: "Retiro coordinado", desc: "Retirás los lunes, miércoles y viernes. También tenemos delivery. El pedido se coordina con al menos un día de anticipación y te avisamos por WhatsApp cuando está listo." },
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

      <section id="asociarse" style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? 36 : 56 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12 }}>CÓMO ASOCIARSE</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>El proceso de vinculación</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 14 : 16, maxWidth: 520 }}>Tres pasos y te acompañamos en cada uno. El proceso tarda entre 1 y 2 semanas.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
            {PASOS.map((paso, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: "rgba(255,255,255,0.12)", marginBottom: 16, lineHeight: 1 }}>{paso.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{paso.titulo}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{paso.desc}</p>
                {paso.link && <a href={paso.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", color: "#6FD67F", fontSize: 13, fontWeight: 700, borderBottom: "1px solid rgba(111,214,127,0.4)", paddingBottom: 2 }}>Ir al sitio →</a>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => window.location.hash = "#/asociarse"} style={{ background: "#6FD67F", color: C.text, border: "none", borderRadius: 10, padding: "14px 28px", fontFamily: F, fontWeight: 700, fontSize: 15, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>Iniciar mi solicitud</button>
            <a href="https://wa.me/5493518057172" target="_blank" rel="noreferrer" style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "14px 28px", fontFamily: F, fontWeight: 600, fontSize: 15, display: "inline-block", width: isMobile ? "100%" : "auto", textAlign: "center" }}>Consultar por WhatsApp</a>
          </div>
        </div>
      </section>

      <section style={{ padding: isMobile ? "70px 6%" : "100px 6%", background: C.white }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ color: C.green, fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>PREGUNTAS FRECUENTES</div>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 700, color: C.text, marginBottom: 40, lineHeight: 1.2, textAlign: "center" }}>Lo que más nos preguntan</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "¿Tengo que pagar una cuota mensual?", r: "No. Solo abonás lo que retirás, cuando lo retirás. Sin costos fijos ni sorpresas." },
              { q: "¿Emiten factura?", r: "Sí. Todas las dispensas son facturadas." },
              { q: "¿Cuánto puedo retirar por mes?", r: "Lo que necesités. REPROCANN permite circular con hasta 40g y 6 aceites de 30ml." },
              { q: "¿Puedo recomendar a alguien?", r: "Claro, pasales nuestro número de WhatsApp y los acompañamos desde el primer mensaje." },
              { q: "¿Qué productos puedo retirar?", r: "Flor seca de variedades propias y derivados de cannabis sativa. Próximamente aceites. El catálogo completo está disponible desde la zona de socios." },
              { q: "¿Hacen delivery?", r: "Sí, los mismos días que los retiros: lunes, miércoles y viernes. Lo coordinamos por WhatsApp." },
            ].map((f, i) => (
              <div key={i} style={{ background: C.pale, borderRadius: 12, padding: "20px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.7 }}>{f.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#000", padding: isMobile ? "48px 6% 28px" : "60px 6% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap: isMobile ? 32 : 40, marginBottom: isMobile ? 32 : 48 }}>
            <div>
              <img src="/logo.png" alt="Cogollos Córdoba" style={{ height: 48, marginBottom: 16 }} />
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginBottom: 16 }}>Asociación Civil sin fines de lucro. Fundada en 2001 en Córdoba. Habilitada por REPROCANN para el cultivo colectivo de cannabis medicinal.</p>
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
              <button onClick={() => window.location.hash = "#/admin"} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 11, fontFamily: F }}>Acceso equipo</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTOCULTIVO ──────────────────────────────────────────────────────
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
      <div style={{ background: `linear-gradient(160deg, ${C.dark} 0%, #2B7A3E 100%)`, padding: isMobile ? "60px 6% 50px" : "80px 6% 70px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 24 }}>GUÍA DE AUTOCULTIVO</div>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>Cultivá tu cannabis de manera legal</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 15 : 17, lineHeight: 1.75, marginBottom: 32 }}>Si querés cultivar para uso personal, REPROCANN te da el respaldo legal para hacerlo. Te explicamos el proceso completo, paso a paso.</p>
          <button onClick={() => window.location.hash = "#/asociarse"} style={{ display: "inline-block", background: "#6FD67F", color: C.text, borderRadius: 10, padding: "13px 28px", fontFamily: F, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Completar formulario →</button>
        </div>
      </div>
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
      <div style={{ padding: isMobile ? "60px 6%" : "80px 6%", background: C.dark, textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>¿Preferís no cultivar vos mismo?</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>Como socio de Cogollos, nuestro equipo cultiva por vos. Retirás tu flor seca sin ocuparte del cultivo, con trazabilidad y calidad garantizada.</p>
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

  useEffect(() => {
    const titles = { "#/admin": "Panel · Cogollos", "#/socios": "Socios · Cogollos", "#/autocultivo": "Autocultivo · Cogollos", "#/asociarse": "Asociarse · Cogollos", "#/delivery": "Delivery · Cogollos" };
    document.title = titles[hash] || "Cogollos Córdoba";
  }, [hash]);

  if (hash === "#/admin") {
    if (!adminLoggedIn) return <LoginAdmin onLogin={() => setAdminLoggedIn(true)} />;
    return <Dashboard onLogout={() => { sessionStorage.removeItem("cogo_admin"); setAdminLoggedIn(false); window.location.hash = ""; }} />;
  }

  if (hash === "#/asociarse") return <FormularioAlta />;
  if (hash === "#/autocultivo") return <Autocultivo />;
  if (hash === "#/delivery") return <Delivery />;

  if (hash === "#/socios") {
    if (!socio) return <LoginSocios onLogin={s => setSocio(s)} />;
    return <ZonaSocios socio={socio} onLogout={() => { setSocio(null); window.location.hash = ""; }} />;
  }

  return <Landing />;
}