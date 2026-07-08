import { useState, useEffect, useCallback } from "react";

// ─── Config ──────────────────────────────────────────────────────────
const SB_URL = "https://mphiidkjfjxcqrrfbpfu.supabase.co";
const SB_KEY = "sb_publishable_sKq0rU3ft8rEHCO8MeF0Kg_ciDXTfpz";

const sb = async (path, opts = {}) => {
  const token = sessionStorage.getItem("cogo_admin_token") || SB_KEY;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

async function loginAdmin(email, password) {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ? data : null;
}

// ─── Tokens ──────────────────────────────────────────────────────────
const C = {
  green: "#2B7A3E", dark: "#1A5C2A", light: "#EAF4ED", pale: "#F4FAF6",
  text: "#111C15", body: "#374840", muted: "#6B8872",
  border: "#C8DFD0", white: "#FFFFFF", cream: "#FAFDF8",
};
const F = "'DM Sans', Arial, sans-serif";

const ESTADO_CONFIG = {
  pendiente:   { label: "Pendiente",   bg: "#FEF9EC", color: "#92620A", dot: "#F5A623" },
  preparando:  { label: "Preparando",  bg: "#EEF0FE", color: "#3C3489", dot: "#6C63FF" },
  en_camino:   { label: "En camino",   bg: "#E6F1FB", color: "#0C447C", dot: "#2196F3" },
  entregado:   { label: "Entregado",   bg: "#EAF3DE", color: "#27500A", dot: "#4CAF50" },
  cancelado:   { label: "Cancelado",   bg: "#FCEBEB", color: "#A32D2D", dot: "#F44336" },
};



// ─── Utilidades ───────────────────────────────────────────────────────
function formatFecha(iso) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function llamar(tel) {
  if (!tel) return;
  const limpio = tel.replace(/\D/g, "");
  window.open(`tel:+54${limpio.startsWith("0") ? limpio.slice(1) : limpio}`);
}

function whatsapp(tel, nombre) {
  if (!tel) return;
  const limpio = tel.replace(/\D/g, "");
  const num = limpio.startsWith("549") ? limpio : limpio.startsWith("54") ? limpio : `549${limpio.startsWith("0") ? limpio.slice(1) : limpio}`;
  const msg = encodeURIComponent(`Hola ${nombre?.split(" ")[0] || ""} 👋 Te escribimos de Cogollos Córdoba para coordinar tu delivery.`);
  window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
}

// ─── Componentes pequeños ─────────────────────────────────────────────
function Badge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: C.dark, color: "#fff", borderRadius: 10, padding: "12px 24px",
      fontSize: 14, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      whiteSpace: "nowrap",
    }}>
      {msg}
    </div>
  );
}

// ─── Card de grupo (ticket) ──────────────────────────────────────────
function GrupoCard({ grupo, onEstadoChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = ESTADO_CONFIG[grupo.estado] || ESTADO_CONFIG.pendiente;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: C.white, borderRadius: 14,
        border: `1.5px solid ${expanded ? C.green : C.border}`,
        overflow: "hidden", cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    >
      {/* Cabecera */}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {grupo.socio_nombre || "—"}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {grupo.items.map(i => `${i.producto_nombre} x${i.cantidad}`).join(" · ")} · ${grupo.total.toLocaleString("es-AR")}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Badge estado={grupo.estado} />
          <span style={{ color: C.muted, fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 18px", background: C.pale }}>

          {/* Dirección */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: 4 }}>DIRECCIÓN</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{grupo.socio_direccion || "Sin dirección registrada"}</div>
          </div>

          {/* Contacto */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: 6 }}>CONTACTO</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={e => { e.stopPropagation(); llamar(grupo.socio_telefono); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: C.light, color: C.dark, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
              >
                📞 {grupo.socio_telefono || "Sin teléfono"}
              </button>
              {grupo.socio_telefono && (
                <button
                  onClick={e => { e.stopPropagation(); whatsapp(grupo.socio_telefono, grupo.socio_nombre); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
                >
                  💬 WhatsApp
                </button>
              )}
            </div>
          </div>

          {/* Items del pedido */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: 8 }}>PRODUCTOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {grupo.items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", background: C.white, borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.producto_nombre} x{item.cantidad}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>${(Number(item.precio_unitario) * item.cantidad).toLocaleString("es-AR")}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>${grupo.total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {/* Info del pedido */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              ["Pago", grupo.metodo_pago],
              ["Turno", grupo.turno_delivery],
              ["Modalidad", grupo.modalidad],
              ["Fecha", formatFecha(grupo.created_at)],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: 2 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{v || "—"}</div>
              </div>
            ))}
          </div>

          {/* Selector de estado */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.07em", marginBottom: 6 }}>CAMBIAR ESTADO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={async e => {
                    e.stopPropagation();
                    if (key === grupo.estado) return;
                    setUpdating(true);
                    await onEstadoChange(grupo.ticketId, key);
                    setUpdating(false);
                  }}
                  disabled={updating}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: key === grupo.estado ? cfg.bg : C.white,
                    color: key === grupo.estado ? cfg.color : C.muted,
                    border: `1.5px solid ${key === grupo.estado ? cfg.dot : C.border}`,
                    borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                    cursor: key === grupo.estado ? "default" : "pointer",
                    fontFamily: F, opacity: updating ? 0.6 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────
function DeliveryView({ onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("activos"); // activos | entregado | todos
  const [toast, setToast] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      // Traer pedidos de modalidad delivery con datos del socio y producto
      const data = await sb(
        "pedidos?select=*,socios(nombre,telefono,direccion),productos(nombre)&modalidad=eq.delivery&order=created_at.desc"
      );
      const lista = (data || []).map(p => ({
        ...p,
        socio_nombre: p.socios?.nombre,
        socio_telefono: p.socios?.telefono,
        socio_direccion: p.socios?.direccion,
        producto_nombre: p.productos?.nombre,
      }));
      setPedidos(lista);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstadoGrupo = async (ticketId, nuevoEstado) => {
    // Actualizar todos los pedidos del ticket
    await sb(`pedidos?ticket_id=eq.${ticketId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setPedidos(prev => prev.map(p => p.ticket_id === ticketId ? { ...p, estado: nuevoEstado } : p));
    setToast(`Pedido marcado como ${ESTADO_CONFIG[nuevoEstado]?.label}`);
  };

  // Agrupar pedidos por ticket_id
  const gruposMap = pedidos.reduce((acc, p) => {
    const key = p.ticket_id || p.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  // Convertir a array de grupos, el estado del grupo es el del primer item
  const grupos = Object.entries(gruposMap).map(([ticketId, items]) => ({
    ticketId,
    items,
    estado: items[0].estado,
    socio_nombre: items[0].socio_nombre,
    socio_telefono: items[0].socio_telefono,
    socio_direccion: items[0].socio_direccion,
    turno_delivery: items[0].turno_delivery,
    metodo_pago: items[0].metodo_pago,
    modalidad: items[0].modalidad,
    created_at: items[0].created_at,
    total: items.reduce((s, i) => s + Number(i.precio_unitario) * i.cantidad, 0),
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const gruposFiltrados = grupos.filter(g => {
    if (filtro === "activos") return g.estado !== "entregado" && g.estado !== "cancelado";
    if (filtro === "entregado") return g.estado === "entregado";
    return true;
  });

  const contadores = {
    activos: grupos.filter(g => g.estado !== "entregado" && g.estado !== "cancelado").length,
    entregado: grupos.filter(g => g.estado === "entregado").length,
    todos: grupos.length,
  };

  const ORDEN_TURNOS = ["lunes", "miercoles", "viernes", "sin turno"];
  const porTurno = gruposFiltrados.reduce((acc, g) => {
    const turno = g.turno_delivery || "sin turno";
    if (!acc[turno]) acc[turno] = [];
    acc[turno].push(g);
    return acc;
  }, {});
  const turnosOrdenados = Object.keys(porTurno).sort((a, b) => {
    const ia = ORDEN_TURNOS.indexOf(a);
    const ib = ORDEN_TURNOS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div style={{ minHeight: "100vh", background: C.pale, fontFamily: F }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{
        background: C.dark, padding: "0 5%", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📦</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Delivery</span>
          {contadores.activos > 0 && (
            <span style={{ background: "#6FD67F", color: C.dark, borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
              {contadores.activos}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={cargar}
            style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: F }}
          >
            ↻ Actualizar
          </button>
          <button
            onClick={onLogout}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: F }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 5%", display: "flex", gap: 4 }}>
        {[
          ["activos", "Pendientes"],
          ["entregado", "Entregados"],
          ["todos", "Todos"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            style={{
              padding: "13px 16px", fontSize: 13, fontWeight: filtro === key ? 700 : 400,
              color: filtro === key ? C.dark : C.muted,
              background: "none", border: "none",
              borderBottom: filtro === key ? `3px solid ${C.dark}` : "3px solid transparent",
              cursor: "pointer", fontFamily: F,
            }}
          >
            {label}
            <span style={{ marginLeft: 5, fontSize: 11, color: filtro === key ? C.green : C.muted }}>
              {contadores[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 5% 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>
            Cargando pedidos...
          </div>
        ) : gruposFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, color: C.muted }}>
              {filtro === "activos" ? "No hay deliveries pendientes" : "No hay pedidos en esta sección"}
            </div>
          </div>
        ) : filtro === "activos" ? (
          turnosOrdenados.map(turno => (
            <div key={turno} style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.muted,
                letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>📅 {turno.charAt(0).toUpperCase() + turno.slice(1)}</span>
                <span style={{ background: C.border, color: C.body, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                  {porTurno[turno].length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {porTurno[turno].map(g => (
                  <GrupoCard key={g.ticketId} grupo={g} onEstadoChange={cambiarEstadoGrupo} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gruposFiltrados.map(g => (
              <GrupoCard key={g.ticketId} grupo={g} onEstadoChange={cambiarEstadoGrupo} />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sesion = await loginAdmin(email.trim(), pass);
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
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Delivery · Cogollos</div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.1em" }}>ACCESO EQUIPO</div>
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "32px 28px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 15, fontFamily: F, color: C.text, background: C.white, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 15, fontFamily: F, color: C.text, background: C.white, outline: "none" }} />
            </div>
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 18 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: C.dark, color: "#fff", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────
export default function Delivery() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("cogo_admin") === "1");

  const logout = () => {
    sessionStorage.removeItem("cogo_admin");
    sessionStorage.removeItem("cogo_admin_token");
    setLoggedIn(false);
  };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return <DeliveryView onLogout={logout} />;
}