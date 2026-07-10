import { useState, useEffect, useCallback } from "react";

const SB_URL = "https://mphiidkjfjxcqrrfbpfu.supabase.co";
const SB_KEY = "sb_publishable_sKq0rU3ft8rEHCO8MeF0Kg_ciDXTfpz";

const sb = async (path, opts = {}) => {
  // Usa el token del admin autenticado si existe; si no, cae a la anon key.
  // Esto permite que las políticas RLS reconozcan al admin como usuario logueado.
  const token = sessionStorage.getItem("cogo_admin_token") || SB_KEY;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: opts.method === "POST" ? "return=representation" : "return=minimal",
      ...opts.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    // Sesión vencida o sin permisos: forzar re-login del admin.
    sessionStorage.removeItem("cogo_admin");
    sessionStorage.removeItem("cogo_admin_token");
    throw new Error("Tu sesión expiró. Por favor, volvé a iniciar sesión.");
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  return res.json();
};

const C = {
  green: "#2B7A3E", dark: "#1A5C2A", light: "#EAF4ED", pale: "#F4FAF6",
  text: "#111C15", muted: "#6B8872", border: "#C8DFD0", white: "#FFFFFF", bg: "#F4FAF6",
};
const F = "'Roboto', Arial, sans-serif";

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 900);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: C.dark, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontFamily: F, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>{msg}</div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: F, color: C.text, background: C.pale, outline: "none" };
const btnPrimary = { background: C.dark, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F };
const btnSecondary = { background: "transparent", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: F };

// ── PEDIDOS ──────────────────────────────────────────────────────────
function Pedidos({ toast }) {
  const [pedidos, setPedidos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ socio_id: "", producto_id: "", cantidad: 1, metodo_pago: "efectivo", turno_delivery: "lunes", modalidad: "delivery", estado: "pendiente" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [p, s, pr] = await Promise.all([
      sb("pedidos?select=*,socios(nombre,direccion,telefono),productos(nombre,precio)&order=created_at.desc"),
      sb("socios?select=id,nombre,dni,estado&order=nombre"),
      sb("productos?select=id,nombre,precio,stock&activo=eq.true&order=nombre"),
    ]);
    setPedidos(Array.isArray(p) ? p : []);
    setSocios(Array.isArray(s) ? s : []);
    setProductos(Array.isArray(pr) ? pr : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const producto = productos.find(p => p.id === form.producto_id);
  const total = producto ? producto.precio * form.cantidad : 0;

  const guardar = async () => {
    if (!form.socio_id || !form.producto_id) return toast("Completá socio y producto");
    setSaving(true);
    await sb("pedidos", {
      method: "POST",
      body: JSON.stringify({ ...form, cantidad: parseInt(form.cantidad), precio_unitario: producto?.precio || 0 }),
    });
    toast("Pedido creado");
    setModal(false);
    setForm({ socio_id: "", producto_id: "", cantidad: 1, metodo_pago: "efectivo", turno_delivery: "lunes", modalidad: "delivery", estado: "pendiente" });
    await load();
    setSaving(false);
  };

  const cambiarEstado = async (id, estado) => {
    await sb(`pedidos?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado } : p));
    toast("Estado actualizado");
  };

  const estadoBg = { pendiente: ["#FAEEDA","#633806"], preparando: ["#EEEDFE","#3C3489"], en_camino: ["#E6F1FB","#0C447C"], entregado: ["#EAF3DE","#27500A"], cancelado: ["#FCEBEB","#A32D2D"] };

  const filtered = pedidos.filter(p => {
    const q = search.toLowerCase();
    return !q || p.socios?.nombre?.toLowerCase().includes(q) || p.productos?.nombre?.toLowerCase().includes(q);
  });

  // Agrupar todos los pedidos por ticket_id para los contadores
  const todosGrupos = Object.values(pedidos.reduce((acc, p) => {
    const key = p.ticket_id || p.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {}));

  const totalFacturado = todosGrupos.filter(g => g[0].estado === "entregado").reduce((s, g) => s + g.reduce((gs, p) => gs + (p.precio_unitario * p.cantidad), 0), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Pedidos</h2>
        <button onClick={() => setModal(true)} style={btnPrimary}>+ Nuevo pedido</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
        {[["Total pedidos", todosGrupos.length, C.text], ["Pendientes", todosGrupos.filter(g=>g[0].estado==="pendiente").length, "#8C6B1A"], ["En camino", todosGrupos.filter(g=>g[0].estado==="en_camino").length, "#185FA5"], ["Entregados", todosGrupos.filter(g=>g[0].estado==="entregado").length, C.green], ["Facturado", `$${totalFacturado.toLocaleString("es-AR")}`, C.dark]].map(([l,v,c]) => (
          <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: typeof v === "string" && v.startsWith("$") ? 18 : 26, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por socio o producto..." style={{ ...inputStyle, marginBottom: 14, maxWidth: 300 }} />

      {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
          <div style={{ fontSize: 15, marginBottom: 8 }}>No hay pedidos todavía</div>
          <button onClick={() => setModal(true)} style={btnPrimary}>Crear el primero</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(() => {
            const grupos = filtered.reduce((acc, p) => {
              const key = p.ticket_id || p.id;
              if (!acc[key]) acc[key] = [];
              acc[key].push(p);
              return acc;
            }, {});
            return Object.entries(grupos).map(([key, items]) => {
              const p0 = items[0];
              const [bg, tc] = estadoBg[p0.estado] || estadoBg.pendiente;
              const fecha = new Date(p0.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
              const total = items.reduce((s, i) => s + (i.precio_unitario * i.cantidad), 0);
              return (
                <div key={key} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p0.socios?.nombre || "—"}</div>
                    <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span>{items.map(i => `${i.productos?.nombre} × ${i.cantidad}`).join(" · ")}</span>
                      <span style={{ fontWeight: 600, color: C.green }}>${total.toLocaleString("es-AR")}</span>
                      <span>{p0.metodo_pago}</span>
                      <span>{p0.modalidad === "retiro" ? "Retiro" : "Delivery"}: {p0.turno_delivery}</span>
                      <span>{fecha}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ background: bg, color: tc, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{p0.estado?.replace("_"," ")}</span>
                    <select value={p0.estado} onChange={e => {
                      items.forEach(i => cambiarEstado(i.id, e.target.value));
                    }} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 }}>
                      <option value="pendiente">Pendiente</option>
                      <option value="preparando">Preparando</option>
                      <option value="en_camino">En camino</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {modal && (
        <Modal title="Nuevo pedido" onClose={() => setModal(false)}>
          <Field label="Socio">
            <select value={form.socio_id} onChange={e => setForm(f => ({...f, socio_id: e.target.value}))} style={inputStyle}>
              <option value="">Seleccioná un socio...</option>
              {socios.filter(s => s.estado === "activo").map(s => <option key={s.id} value={s.id}>{s.nombre} · DNI {s.dni}</option>)}
            </select>
          </Field>
          <Field label="Producto">
            <select value={form.producto_id} onChange={e => setForm(f => ({...f, producto_id: e.target.value}))} style={inputStyle}>
              <option value="">Seleccioná un producto...</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} · ${Number(p.precio).toLocaleString("es-AR")} · Stock: {p.stock}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Cantidad">
              <input type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({...f, cantidad: e.target.value}))} style={inputStyle} />
            </Field>
            <Field label="Método de pago">
              <select value={form.metodo_pago} onChange={e => setForm(f => ({...f, metodo_pago: e.target.value}))} style={inputStyle}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercadopago">MercadoPago</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Modalidad">
              <select value={form.modalidad} onChange={e => setForm(f => ({...f, modalidad: e.target.value}))} style={inputStyle}>
                <option value="delivery">Delivery</option>
                <option value="retiro">Retiro (A convenir)</option>
              </select>
            </Field>
            <Field label="Día">
              <select value={form.turno_delivery} onChange={e => setForm(f => ({...f, turno_delivery: e.target.value}))} style={inputStyle}>
                <option value="lunes">Lunes</option>
                <option value="miercoles">Miércoles</option>
                <option value="viernes">Viernes</option>
              </select>
            </Field>
          </div>
          {total > 0 && <div style={{ background: C.light, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: C.muted }}>Total del pedido</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>${total.toLocaleString("es-AR")}</span>
          </div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(false)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
            <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? "Guardando..." : "Crear pedido"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── DELIVERY ─────────────────────────────────────────────────────────
function Delivery({ toast }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turno, setTurno] = useState("lunes");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("pedidos?select=*,socios(nombre,direccion,telefono),productos(nombre)&estado=neq.entregado&estado=neq.cancelado&order=created_at.desc");
    setPedidos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const marcarEntregado = async (id) => {
    await sb(`pedidos?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ estado: "entregado" }) });
    setPedidos(ps => ps.filter(p => p.id !== id));
    toast("Marcado como entregado");
  };

  const marcarEnCamino = async (id) => {
    await sb(`pedidos?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ estado: "en_camino" }) });
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado: "en_camino" } : p));
    toast("En camino");
  };

  const filtrados = pedidos.filter(p => p.turno_delivery === turno);
  const turnos = ["lunes", "miercoles", "viernes"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Delivery</h2>
        <button onClick={load} style={{ ...btnSecondary, padding: "7px 14px", fontSize: 13 }}>Actualizar</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {turnos.map(t => (
          <button key={t} onClick={() => setTurno(t)} style={{ padding: "8px 20px", borderRadius: 20, fontSize: 14, cursor: "pointer", border: turno===t ? "none" : `1px solid ${C.border}`, background: turno===t ? C.dark : C.white, color: turno===t ? "#fff" : C.muted, fontFamily: F, fontWeight: turno===t ? 700 : 400, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>No hay entregas pendientes para el {turno}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(() => {
            const grupos = filtrados.reduce((acc, p) => {
              const key = p.ticket_id || p.id;
              if (!acc[key]) acc[key] = [];
              acc[key].push(p);
              return acc;
            }, {});
            return Object.entries(grupos).map(([key, items], i) => {
              const p0 = items[0];
              const dir = p0.socios?.direccion;
              const mapsUrl = dir ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}` : null;
              const total = items.reduce((s, i) => s + (i.precio_unitario * i.cantidad), 0);
              return (
                <div key={key} style={{ background: C.white, border: p0.estado === "en_camino" ? `2px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.dark, flexShrink: 0 }}>{i+1}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p0.socios?.nombre || "—"}</div>
                        <span style={{ background: p0.modalidad === "delivery" ? "#E6F1FB" : "#EAF4ED", color: p0.modalidad === "delivery" ? "#0C447C" : "#1A5C2A", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{p0.modalidad === "delivery" ? "🚴 Delivery" : "🏪 Retiro"}</span>
                        {p0.estado === "en_camino" && <span style={{ background: "#E6F1FB", color: "#0C447C", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>En camino</span>}
                      </div>
                      <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
                        {items.map(i => `${i.productos?.nombre} × ${i.cantidad}`).join(" · ")} · <strong style={{ color: C.dark }}>${total.toLocaleString("es-AR")}</strong> · {p0.metodo_pago}
                      </div>
                      {dir && <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>📍 {dir}</div>}
                      {p0.socios?.telefono && <div style={{ fontSize: 13, color: C.muted }}>Tel: <a href={`https://wa.me/54${p0.socios.telefono}`} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 600 }}>{p0.socios.telefono}</a></div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ ...btnSecondary, textAlign: "center", fontSize: 13, textDecoration: "none", display: "block" }}>Ver en Maps</a>}
                      {p0.estado !== "en_camino" && <button onClick={() => items.forEach(i => marcarEnCamino(i.id))} style={{ ...btnSecondary, fontSize: 13 }}>Salió</button>}
                      <button onClick={() => items.forEach(i => marcarEntregado(i.id))} style={{ ...btnPrimary, fontSize: 13 }}>Entregado</button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}

// ── SOCIOS ───────────────────────────────────────────────────────────
function Socios({ toast }) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", dni: "", telefono: "", email: "", direccion: "", cuit: "", estado: "activo", notas: "", reprocann_codigo: "", reprocann_nro_tramite: "", consulta_realizada: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("socios?select=*&order=nombre");
    setSocios(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const abrirNuevo = () => { setEditando(null); setForm({ nombre: "", dni: "", telefono: "", email: "", direccion: "", cuit: "", estado: "activo", notas: "", reprocann_codigo: "", reprocann_nro_tramite: "", consulta_realizada: false }); setModal(true); };
  const abrirEditar = (s) => { setEditando(s.id); setForm({ nombre: s.nombre||"", dni: s.dni||"", telefono: s.telefono||"", email: s.email||"", direccion: s.direccion||"", cuit: s.cuit||"", estado: s.estado||"activo", notas: s.notas||"", reprocann_codigo: s.reprocann_codigo||"", reprocann_nro_tramite: s.reprocann_nro_tramite||"", consulta_realizada: s.consulta_realizada||false }); setModal(true); };

  const guardar = async () => {
    if (!form.nombre || !form.dni) return toast("Nombre y DNI son obligatorios");
    setSaving(true);
    if (editando) {
      await sb(`socios?id=eq.${editando}`, { method: "PATCH", body: JSON.stringify(form) });
      setSocios(ss => ss.map(s => s.id === editando ? { ...s, ...form } : s));
      toast("Socio actualizado");
    } else {
      await sb("socios", { method: "POST", body: JSON.stringify(form) });
      toast("Socio creado");
      await load();
    }
    setModal(false);
    setSaving(false);
  };

  const cambiarEstado = async (id, estado) => {
    await sb(`socios?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
    setSocios(ss => ss.map(s => s.id === id ? { ...s, estado } : s));
    toast("Estado actualizado");
  };

  const marcarConsulta = async (id) => {
    await sb(`socios?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ consulta_realizada: true, estado: "activo", fecha_consulta: new Date().toISOString().slice(0,10) }) });
    setSocios(ss => ss.map(s => s.id === id ? { ...s, consulta_realizada: true, estado: "activo" } : s));
    toast("Consulta registrada — persona activada");
  };

  const filtered = socios.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.nombre?.toLowerCase().includes(q) || s.dni?.includes(q) || s.telefono?.includes(q);
    const matchEstado =
      filtroEstado === "todos" ? true :
      filtroEstado === "sin_consulta" ? (s.estado === "pendiente" && !s.consulta_realizada) :
      s.estado === filtroEstado;
    const matchOrigen =
      filtroOrigen === "todos" ? true :
      filtroOrigen === "web" ? (s.origen === "web") :
      filtroOrigen === "manual" ? (s.origen !== "web") :
      true;
    return matchSearch && matchEstado && matchOrigen;
  });

  const stats = {
    activos: socios.filter(s => s.estado === "activo").length,
    pendientes: socios.filter(s => s.estado === "pendiente").length,
    sin_consulta: socios.filter(s => s.estado === "pendiente" && !s.consulta_realizada).length,
    web: socios.filter(s => s.origen === "web").length,
  };

  const estadoColor = { activo: ["#EAF3DE","#27500A"], pendiente: ["#FAEEDA","#633806"], inactivo: ["#F1EFE8","#444441"] };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Socios <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>({socios.length} total · {socios.filter(s=>s.estado==="activo").length} activos)</span></h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo socio</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, DNI o teléfono..." style={{ ...inputStyle, maxWidth: 360, marginBottom: 12 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginRight: 4 }}>Estado:</span>
        {[
          ["todos", `Todos (${socios.length})`],
          ["activo", `Activos (${stats.activos})`],
          ["pendiente", `Pendientes (${stats.pendientes})`],
          ["sin_consulta", `Sin revisión médica (${stats.sin_consulta})`],
          ["inactivo", "Inactivos"],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setFiltroEstado(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: filtroEstado === v ? "none" : `1px solid ${C.border}`, background: filtroEstado === v ? C.dark : C.white, color: filtroEstado === v ? "#fff" : C.muted, fontFamily: F }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginRight: 4 }}>Origen:</span>
        {[
          ["todos", "Todos"],
          ["web", `🌐 Por web (${stats.web})`],
          ["manual", `Carga manual (${socios.length - stats.web})`],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setFiltroOrigen(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: filtroOrigen === v ? "none" : `1px solid ${C.border}`, background: filtroOrigen === v ? "#0C447C" : C.white, color: filtroOrigen === v ? "#fff" : C.muted, fontFamily: F }}>{l}</button>
        ))}
        {(filtroEstado !== "todos" || filtroOrigen !== "todos") && (
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(s => {
            const [bg, tc] = estadoColor[s.estado] || estadoColor.pendiente;
            return (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.dark, flexShrink: 0 }}>
                  {s.nombre?.charAt(0) || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{s.nombre}</div>
                  <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span>DNI {s.dni}</span>
                    {s.telefono && <span>{s.telefono}</span>}
                    {s.origen === "web" && <span style={{ background: "#E6F1FB", color: "#0C447C", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>🌐 Web</span>}
                    {s.reprocann_codigo && <span style={{ color: C.green }}>REPROCANN ✓</span>}
                    {s.consulta_realizada
                      ? <span style={{ color: "#27500A", fontWeight: 600 }}>● Consulta realizada</span>
                      : <span style={{ color: "#991B1B", fontWeight: 600 }}>● Sin revisión médica</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: bg, color: tc, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.estado}</span>
                  <select value={s.estado} onChange={e => cambiarEstado(s.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12 }}>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                  {!s.consulta_realizada && <button onClick={() => marcarConsulta(s.id)} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>✓ Consulta</button>}
                  <button onClick={() => abrirEditar(s)} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 12 }}>Editar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar socio" : "Nuevo socio"} onClose={() => setModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Nombre completo"><input value={form.nombre} onChange={e => setForm(f=>({...f, nombre: e.target.value}))} style={inputStyle} /></Field>
            </div>
            <Field label="DNI"><input value={form.dni} onChange={e => setForm(f=>({...f, dni: e.target.value}))} style={inputStyle} /></Field>
            <Field label="Teléfono"><input value={form.telefono} onChange={e => setForm(f=>({...f, telefono: e.target.value}))} style={inputStyle} /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Dirección"><input value={form.direccion} onChange={e => setForm(f=>({...f, direccion: e.target.value}))} style={inputStyle} /></Field>
            </div>
            <Field label="Email"><input value={form.email} onChange={e => setForm(f=>({...f, email: e.target.value}))} style={inputStyle} /></Field>
            <Field label="CUIT"><input value={form.cuit} onChange={e => setForm(f=>({...f, cuit: e.target.value}))} style={inputStyle} /></Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm(f=>({...f, estado: e.target.value}))} style={inputStyle}>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Notas"><textarea value={form.notas} onChange={e => setForm(f=>({...f, notas: e.target.value}))} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} /></Field>
            </div>
            <Field label="Código REPROCANN (opcional)"><input value={form.reprocann_codigo} onChange={e => setForm(f=>({...f, reprocann_codigo: e.target.value}))} style={inputStyle} placeholder="Ej: Jbq9Chv509694" /></Field>
            <Field label="Nº Trámite REPROCANN (opcional)"><input value={form.reprocann_nro_tramite} onChange={e => setForm(f=>({...f, reprocann_nro_tramite: e.target.value}))} style={inputStyle} placeholder="Ej: 407166" /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 14px", background: form.consulta_realizada ? C.light : "#FAFAF8", borderRadius: 10, border: `1.5px solid ${form.consulta_realizada ? C.green : C.border}` }}>
                <input type="checkbox" checked={form.consulta_realizada} onChange={e => setForm(f=>({...f, consulta_realizada: e.target.checked, estado: e.target.checked ? "activo" : f.estado}))} style={{ width: 18, height: 18, accentColor: C.dark }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Consulta médica realizada</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Al marcarla, la persona pasa a estado activo</div>
                </div>
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setModal(false)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
            <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? "Guardando..." : editando ? "Guardar cambios" : "Crear socio"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PRODUCTOS ────────────────────────────────────────────────────────
function Productos({ toast }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", variedad: "", efecto: "", momento_dia: "", precio: "", stock: 0, precio_por_gramo: "", gramos_por_unidad: 5, activo: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("productos?select=*&order=nombre");
    setProductos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const abrirNuevo = () => { setEditando(null); setForm({ nombre: "", descripcion: "", variedad: "", efecto: "", momento_dia: "", precio: "", stock: 0, precio_por_gramo: "", gramos_por_unidad: 5, activo: true }); setModal(true); };
  const abrirEditar = (p) => { setEditando(p.id); setForm({ nombre: p.nombre||"", descripcion: p.descripcion||"", variedad: p.variedad||"", efecto: p.efecto||"", momento_dia: p.momento_dia||"", precio: p.precio||"", stock: p.stock||0, precio_por_gramo: p.precio_por_gramo||"", gramos_por_unidad: p.gramos_por_unidad||5, activo: p.activo !== false }); setModal(true); };

  const guardar = async () => {
    if (!form.nombre || !form.precio) return toast("Nombre y precio son obligatorios");
    setSaving(true);
    if (editando) {
      await sb(`productos?id=eq.${editando}`, { method: "PATCH", body: JSON.stringify({ ...form, precio: Number(form.precio), stock: Number(form.stock), precio_por_gramo: Number(form.precio_por_gramo), gramos_por_unidad: Number(form.gramos_por_unidad) }) });
      toast("Producto actualizado");
      await load();
    } else {
      await sb("productos", { method: "POST", body: JSON.stringify({ ...form, precio: Number(form.precio), stock: Number(form.stock), precio_por_gramo: Number(form.precio_por_gramo), gramos_por_unidad: Number(form.gramos_por_unidad) }) });
      toast("Producto creado");
      await load();
    }
    setModal(false);
    setSaving(false);
  };

  const toggleActivo = async (id, activo) => {
    await sb(`productos?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ activo }) });
    setProductos(ps => ps.map(p => p.id === id ? { ...p, activo } : p));
    toast(activo ? "Producto activado" : "Producto desactivado");
  };

  const updateStock = async (id, stock) => {
    await sb(`productos?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ stock: Number(stock) }) });
    setProductos(ps => ps.map(p => p.id === id ? { ...p, stock: Number(stock) } : p));
    toast("Stock actualizado");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Productos <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>({productos.filter(p=>p.activo).length} activos)</span></h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo producto</button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {productos.map(p => (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", opacity: p.activo ? 1 : 0.5 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p.nombre}</div>
                    <span style={{ background: p.activo ? "#EAF3DE" : "#F1EFE8", color: p.activo ? "#27500A" : "#888", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{p.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{p.variedad}</span>
                    <span>{p.efecto}</span>
                    <span>{p.momento_dia}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>PRECIO</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>${Number(p.precio).toLocaleString("es-AR")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>STOCK</div>
                    <input
                      type="number" defaultValue={p.stock} min="0"
                      onBlur={e => { if (Number(e.target.value) !== p.stock) updateStock(p.id, e.target.value); }}
                      style={{ ...inputStyle, width: 70, textAlign: "center", padding: "5px 8px", fontSize: 14, fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => abrirEditar(p)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 12 }}>Editar</button>
                    <button onClick={() => toggleActivo(p.id, !p.activo)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 12, color: p.activo ? "#991B1B" : C.green, borderColor: p.activo ? "#FECACA" : C.border }}>{p.activo ? "Desactivar" : "Activar"}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editando ? "Editar producto" : "Nuevo producto"} onClose={() => setModal(false)}>
          <Field label="Nombre"><input value={form.nombre} onChange={e => setForm(f=>({...f, nombre: e.target.value}))} style={inputStyle} /></Field>
          <Field label="Descripción"><textarea value={form.descripcion} onChange={e => setForm(f=>({...f, descripcion: e.target.value}))} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Variedad">
              <select value={form.variedad} onChange={e => setForm(f=>({...f, variedad: e.target.value}))} style={inputStyle}>
                <option value="">Seleccioná...</option>
                <option value="Sativa">Sativa</option>
                <option value="Indica">Indica</option>
                <option value="Híbrido">Híbrido</option>
                <option value="CBD">CBD</option>
              </select>
            </Field>
            <Field label="Momento del día">
              <select value={form.momento_dia} onChange={e => setForm(f=>({...f, momento_dia: e.target.value}))} style={inputStyle}>
                <option value="Todo el día">Todo el día</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </Field>
            <Field label="Precio ($)"><input type="number" value={form.precio} onChange={e => setForm(f=>({...f, precio: e.target.value}))} style={inputStyle} /></Field>
            <Field label="Stock"><input type="number" value={form.stock} onChange={e => setForm(f=>({...f, stock: e.target.value}))} style={inputStyle} /></Field>
            <Field label="Precio por gramo ($)"><input type="number" value={form.precio_por_gramo} onChange={e => setForm(f=>({...f, precio_por_gramo: e.target.value}))} style={inputStyle} /></Field>
            <Field label="Gramos por unidad"><input type="number" value={form.gramos_por_unidad} onChange={e => setForm(f=>({...f, gramos_por_unidad: e.target.value}))} style={inputStyle} /></Field>
          </div>
          <Field label="Efecto"><input value={form.efecto} onChange={e => setForm(f=>({...f, efecto: e.target.value}))} placeholder="Ej: Relajante · feliz · equilibrada" style={inputStyle} /></Field>
          <Field label="Activo">
            <select value={form.activo ? "true" : "false"} onChange={e => setForm(f=>({...f, activo: e.target.value === "true"}))} style={inputStyle}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setModal(false)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
            <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? "Guardando..." : editando ? "Guardar" : "Crear"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FACTURACIÓN ───────────────────────────────────────────────────────
function Facturacion({ toast }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  const [metodoPago, setMetodoPago] = useState("todos");
  const [vistaFiltro, setVistaFiltro] = useState("todos");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("pedidos?select=*,socios(nombre,dni,cuit),productos(nombre)&order=created_at.desc");
    setPedidos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const marcarCobrado = async (id, pagado) => {
    await sb(`pedidos?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ pagado, fecha_pago: pagado ? new Date().toISOString() : null }),
    });
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, pagado, fecha_pago: pagado ? new Date().toISOString() : null } : p));
    toast(pagado ? "Marcado como cobrado" : "Marcado como sin cobrar");
  };

  const marcarFacturado = async (id, facturado) => {
    await sb(`pedidos?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ facturado, fecha_factura: facturado ? new Date().toISOString() : null }),
    });
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, facturado, fecha_factura: facturado ? new Date().toISOString() : null } : p));
    toast(facturado ? "Marcado como facturado" : "Factura revertida");
  };

  const exportarCSV = () => {
    const filas = filtrados.map(p => [
      p.numero_orden || "—",
      new Date(p.created_at).toLocaleDateString("es-AR"),
      `"${p.socios?.nombre || "—"}"`,
      p.socios?.dni || "—",
      p.socios?.cuit || "—",
      `"${p.productos?.nombre || "—"}"`,
      p.cantidad,
      p.precio_unitario || 0,
      (p.precio_unitario || 0) * p.cantidad,
      p.metodo_pago,
      p.estado,
      p.pagado ? "Cobrado" : "Sin cobrar",
      p.facturado ? "Facturado" : "Pendiente",
      p.turno_delivery,
    ]);
    const headers = ["N° Orden","Fecha","Nombre","DNI","CUIT","Producto","Cant.","Precio Unit.","Total","Método Pago","Estado entrega","Cobro","Factura","Turno"];
    const csv = [headers, ...filas].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturacion_cogollos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const ahora = new Date();
  const filtradosPeriodo = pedidos.filter(p => {
    const fecha = new Date(p.created_at);
    if (periodo === "hoy") return fecha.toDateString() === ahora.toDateString();
    if (periodo === "semana") return (ahora - fecha) < 7 * 24 * 60 * 60 * 1000;
    if (periodo === "mes") return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    return true;
  });
  const filtradosMetodo = metodoPago === "todos" ? filtradosPeriodo : filtradosPeriodo.filter(p => p.metodo_pago === metodoPago);
  const filtrados = vistaFiltro === "sin_cobrar" ? filtradosMetodo.filter(p => !p.pagado)
    : vistaFiltro === "cobrado" ? filtradosMetodo.filter(p => p.pagado && !p.facturado)
    : vistaFiltro === "facturado" ? filtradosMetodo.filter(p => p.facturado)
    : filtradosMetodo;

  const totalVentas = filtradosMetodo.reduce((s, p) => s + (p.precio_unitario || 0) * p.cantidad, 0);
  const totalCobrado = filtradosMetodo.filter(p => p.pagado).reduce((s, p) => s + (p.precio_unitario || 0) * p.cantidad, 0);
  const totalSinCobrar = filtradosMetodo.filter(p => !p.pagado).reduce((s, p) => s + (p.precio_unitario || 0) * p.cantidad, 0);
  const totalFacturadoEmitido = filtradosMetodo.filter(p => p.facturado).reduce((s, p) => s + (p.precio_unitario || 0) * p.cantidad, 0);

  const porMetodo = filtradosMetodo.reduce((acc, p) => { const m = p.metodo_pago||"efectivo"; acc[m]=(acc[m]||0)+(p.precio_unitario||0)*p.cantidad; return acc; }, {});
  const porTurno = filtradosMetodo.reduce((acc, p) => { const t = p.turno_delivery||"sin turno"; acc[t]=(acc[t]||0)+(p.precio_unitario||0)*p.cantidad; return acc; }, {});

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Facturación</h2>
        <button onClick={exportarCSV} style={btnPrimary}>Exportar CSV</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[["hoy","Hoy"],["semana","Esta semana"],["mes","Este mes"],["todo","Todo"]].map(([v,l]) => (
          <button key={v} onClick={() => setPeriodo(v)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: periodo===v?"none":`1px solid ${C.border}`, background: periodo===v?C.dark:C.white, color: periodo===v?"#fff":C.muted, fontFamily: F }}>{l}</button>
        ))}
        <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ ...inputStyle, width: "auto", marginLeft: "auto" }}>
          <option value="todos">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercadopago">MercadoPago</option>
        </select>
      </div>

      {/* Flujo: Ventas → Sin cobrar → Cobrado → Facturado */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          ["Total ventas", `$${totalVentas.toLocaleString("es-AR")}`, C.text, `${filtradosMetodo.length} pedidos`],
          ["Sin cobrar", `$${totalSinCobrar.toLocaleString("es-AR")}`, "#991B1B", `${filtradosMetodo.filter(p=>!p.pagado).length} pedidos`],
          ["Cobrado", `$${totalCobrado.toLocaleString("es-AR")}`, C.green, `${filtradosMetodo.filter(p=>p.pagado&&!p.facturado).length} a facturar`],
          ["Facturado", `$${totalFacturadoEmitido.toLocaleString("es-AR")}`, "#0C447C", `${filtradosMetodo.filter(p=>p.facturado).length} comprobantes`],
        ].map(([l,v,c,sub]) => (
          <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c, marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Por método de pago</div>
          {Object.entries(porMetodo).length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Sin datos</div> : Object.entries(porMetodo).map(([m,v]) => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: C.muted, textTransform: "capitalize" }}>{m}</span>
              <span style={{ fontWeight: 700 }}>${v.toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Por turno de delivery</div>
          {Object.entries(porTurno).length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Sin datos</div> : Object.entries(porTurno).map(([t,v]) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: C.muted, textTransform: "capitalize" }}>{t}</span>
              <span style={{ fontWeight: 700 }}>${v.toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista con filtro por estado de cobro/factura */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {[["todos","Todos"],["sin_cobrar","Sin cobrar"],["cobrado","Cobrado — a facturar"],["facturado","Facturados"]].map(([v,l]) => (
            <button key={v} onClick={() => setVistaFiltro(v)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: vistaFiltro===v?"none":`1px solid ${C.border}`, background: vistaFiltro===v?C.dark:"transparent", color: vistaFiltro===v?"#fff":C.muted, fontFamily: F }}>{l}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>{filtrados.length} pedidos</span>
        </div>
        {loading ? <div style={{ padding: "40px 0", textAlign: "center", color: C.muted }}>Cargando...</div>
          : filtrados.length === 0 ? <div style={{ padding: "40px 0", textAlign: "center", color: C.muted }}>Sin pedidos en este filtro</div>
          : (() => {
              const grupos = filtrados.reduce((acc, p) => {
                const key = p.ticket_id || p.id;
                if (!acc[key]) acc[key] = [];
                acc[key].push(p);
                return acc;
              }, {});
              return Object.entries(grupos).map(([key, items]) => {
                const p0 = items[0];
                const total = items.reduce((s, i) => s + (i.precio_unitario || 0) * i.cantidad, 0);
                const fecha = new Date(p0.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
                const pagado = items.every(i => i.pagado);
                const facturado = items.every(i => i.facturado);
                return (
                  <div key={key} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{p0.socios?.nombre || "—"}</div>
                      <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {p0.socios?.cuit && <span>CUIT {p0.socios.cuit}</span>}
                        <span>{items.map(i => `${i.productos?.nombre} × ${i.cantidad}`).join(" · ")}</span>
                        <span style={{ textTransform: "capitalize" }}>{p0.metodo_pago}</span>
                        <span>{fecha}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, minWidth: 90, textAlign: "right" }}>${total.toLocaleString("es-AR")}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => items.forEach(i => marcarCobrado(i.id, !pagado))} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F, border: "none", background: pagado?"#EAF3DE":"#F1EFE8", color: pagado?"#27500A":"#888", minWidth: 80 }}>
                        {pagado ? "Cobrado" : "Sin cobrar"}
                      </button>
                      <button onClick={() => pagado && items.forEach(i => marcarFacturado(i.id, !facturado))} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: pagado?"pointer":"not-allowed", fontFamily: F, border: "none", background: facturado?"#E6F1FB":pagado?"#FAEEDA":"#F5F5F5", color: facturado?"#0C447C":pagado?"#633806":"#ccc", minWidth: 80, opacity: pagado?1:0.5 }}>
                        {facturado ? "Facturado" : "Facturar"}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
      </div>
    </div>
  );
}

// ── VENTAS ────────────────────────────────────────────────────────────
function Ventas() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("pedidos?select=*,productos(nombre,variedad)&estado=neq.cancelado&order=created_at.desc");
    setPedidos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const ahora = new Date();
  const filtrados = pedidos.filter(p => {
    const fecha = new Date(p.created_at);
    if (periodo === "semana") return (ahora - fecha) < 7 * 24 * 60 * 60 * 1000;
    if (periodo === "mes") return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    if (periodo === "trimestre") return (ahora - fecha) < 90 * 24 * 60 * 60 * 1000;
    return true;
  });

  const porProducto = filtrados.reduce((acc, p) => {
    const nombre = p.productos?.nombre || "Desconocido";
    if (!acc[nombre]) acc[nombre] = { unidades: 0, total: 0 };
    acc[nombre].unidades += p.cantidad;
    acc[nombre].total += (p.precio_unitario || 0) * p.cantidad;
    return acc;
  }, {});

  const porMes = pedidos.reduce((acc, p) => {
    const fecha = new Date(p.created_at);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`;
    const label = fecha.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = { label, total: 0, unidades: 0 };
    acc[key].total += (p.precio_unitario || 0) * p.cantidad;
    acc[key].unidades += p.cantidad;
    return acc;
  }, {});
  const meses = Object.entries(porMes).sort((a,b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMes = Math.max(...meses.map(([,v]) => v.total), 1);

  const totalUnidades = filtrados.reduce((s, p) => s + p.cantidad, 0);
  const totalVentas = filtrados.reduce((s, p) => s + (p.precio_unitario || 0) * p.cantidad, 0);
  const gruposFiltrados = Object.values(filtrados.reduce((acc, p) => {
    const key = p.ticket_id || p.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {}));
  const ticketPromedio = gruposFiltrados.length ? Math.round(totalVentas / gruposFiltrados.length) : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Ventas</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {[["semana","Semana"],["mes","Mes"],["trimestre","Trimestre"],["todo","Todo"]].map(([v,l]) => (
            <button key={v} onClick={() => setPeriodo(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: periodo===v?"none":`1px solid ${C.border}`, background: periodo===v?C.dark:C.white, color: periodo===v?"#fff":C.muted, fontFamily: F }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
        {[["Total vendido",`$${totalVentas.toLocaleString("es-AR")}`,C.dark],["Unidades",totalUnidades,C.green],["Pedidos",gruposFiltrados.length,C.text],["Ticket promedio",`$${ticketPromedio.toLocaleString("es-AR")}`,"#8C6B1A"]].map(([l,v,c]) => (
          <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 20 }}>Facturación mensual</div>
        {loading ? <div style={{ color: C.muted, fontSize: 13 }}>Cargando...</div> : meses.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Sin datos</div> : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
            {meses.map(([key, v]) => (
              <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>${(v.total/1000).toFixed(0)}k</div>
                <div style={{ width: "100%", background: C.dark, borderRadius: "4px 4px 0 0", height: Math.max(8, (v.total / maxMes) * 100) + "px" }} />
                <div style={{ fontSize: 10, color: C.muted, textAlign: "center" }}>{v.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>Ventas por producto</div>
        {Object.keys(porProducto).length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Sin datos en este período</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(porProducto).sort((a,b) => b[1].total - a[1].total).map(([nombre, v]) => {
              const maxTotal = Math.max(...Object.values(porProducto).map(x => x.total), 1);
              return (
                <div key={nombre}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{nombre}</span>
                    <span style={{ color: C.muted }}>{v.unidades} u · <strong style={{ color: C.dark }}>${v.total.toLocaleString("es-AR")}</strong></span>
                  </div>
                  <div style={{ height: 6, background: C.light, borderRadius: 3 }}>
                    <div style={{ height: "100%", background: C.green, borderRadius: 3, width: `${(v.total / maxTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const isMobile = useIsMobile();
  const [seccion, setSeccion] = useState("pedidos");
  const [toastMsg, setToastMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const secciones = [
    { id: "pedidos", label: "Pedidos" },
    { id: "delivery", label: "Delivery" },
    { id: "facturacion", label: "Facturación" },
    { id: "ventas", label: "Ventas" },
    { id: "socios", label: "Socios" },
    { id: "productos", label: "Productos" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input, select, textarea { font-family: inherit; }`}</style>

      {/* Header */}
      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 60, gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30}} />
        {isMobile ? (
          <button onClick={() => setMenuOpen(o => !o)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 22 }}>☰</button>
        ) : (
          <>
            <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
              {secciones.map(s => (
                <button key={s.id} onClick={() => setSeccion(s.id)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: "none", background: seccion === s.id ? "rgba(255,255,255,0.15)" : "transparent", color: seccion === s.id ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: F, fontWeight: seccion === s.id ? 700 : 400 }}>{s.label}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <a href="/" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F, textDecoration: "none" }}>Ver sitio</a>
              <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: F }}>Salir</button>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ background: C.dark, padding: "8px 4% 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {secciones.map(s => (
            <button key={s.id} onClick={() => { setSeccion(s.id); setMenuOpen(false); }} style={{ padding: "12px 16px", borderRadius: 8, fontSize: 14, cursor: "pointer", border: "none", background: seccion === s.id ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontFamily: F, textAlign: "left", fontWeight: seccion === s.id ? 700 : 400 }}>{s.label}</button>
          ))}
          <button onClick={onLogout} style={{ padding: "12px 16px", borderRadius: 8, fontSize: 14, cursor: "pointer", border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: F, textAlign: "left", marginTop: 8 }}>Salir</button>
        </div>
      )}

      {/* Contenido */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 4%" : "32px 6%" }}>
        {seccion === "pedidos" && <Pedidos toast={toast} />}
        {seccion === "delivery" && <Delivery toast={toast} />}
        {seccion === "facturacion" && <Facturacion toast={toast} />}
        {seccion === "ventas" && <Ventas />}
        {seccion === "socios" && <Socios toast={toast} />}
        {seccion === "productos" && <Productos toast={toast} />}
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}