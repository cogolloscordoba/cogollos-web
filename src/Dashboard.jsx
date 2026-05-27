import { useState, useEffect, useCallback } from "react";

const SB_URL = "https://mphiidkjfjxcqrrfbpfu.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waGlpZGtqZmp4Y3FycmZicGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTAyOTMsImV4cCI6MjA2MzQyNjI5M30.IRIHLRudXDnRVx-DqGSl8-sBLDUsaJ1j5re5_JHbSoE";

const sb = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.method === "POST" ? "return=representation" : "return=minimal",
      ...opts.headers,
    },
  });
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

// ── TICKETS ──────────────────────────────────────────────────────────
function Tickets({ toast }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("tickets?select=*,socios(nombre,direccion)&order=created_at.desc");
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cambiarEstado = async (id, estado) => {
    await sb(`tickets?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
    setTickets(ts => ts.map(t => t.id === id ? { ...t, estado } : t));
    toast("Estado actualizado");
  };

  const filters = ["todos", "compra", "medica", "general", "seguimiento", "alta"];
  const labels = { todos: "Todos", compra: "Compras", medica: "Médica", general: "General", seguimiento: "Seguimiento", alta: "Alta prioridad" };
  const tipoBg = { compra: ["#EAF3DE","#27500A"], general: ["#E6F1FB","#0C447C"], medica: ["#FAEEDA","#633806"], seguimiento: ["#EEEDFE","#3C3489"], consulta: ["#F1EFE8","#444441"], asociarse: ["#FBEAF0","#72243E"] };
  const prioDot = { alta: "#E24B4A", media: "#EF9F27", baja: "#639922" };

  const filtered = tickets.filter(t => {
    const mf = filter === "todos" ? true : filter === "alta" ? t.prioridad === "alta" : t.tipo === filter;
    const q = search.toLowerCase();
    const ms = !q || t.resumen?.toLowerCase().includes(q) || t.socios?.nombre?.toLowerCase().includes(q);
    return mf && ms;
  });
  const pages = Math.ceil(filtered.length / PER);
  const paged = filtered.slice((page-1)*PER, page*PER);

  const stats = { total: tickets.length, compras: tickets.filter(t=>t.tipo==="compra").length, medica: tickets.filter(t=>t.tipo==="medica").length, alta: tickets.filter(t=>t.prioridad==="alta").length };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Tickets</h2>
        <button onClick={load} style={{ ...btnSecondary, padding: "7px 14px", fontSize: 13 }}>Actualizar</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 12, marginBottom: 24 }}>
        {[["Total", stats.total, C.text], ["Compras", stats.compras, C.green], ["Médica", stats.medica, "#8C6B1A"], ["Alta prioridad", stats.alta, "#991B1B"]].map(([l,v,c]) => (
          <div key={l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {filters.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: filter===f ? "none" : `1px solid ${C.border}`, background: filter===f ? C.dark : C.white, color: filter===f ? "#fff" : C.muted, fontFamily: F }}>{labels[f]}</button>
        ))}
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." style={{ ...inputStyle, width: 180, marginLeft: "auto" }} />
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Cargando...</div> : paged.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>Sin tickets</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {paged.map(t => {
            const tipo = t.tipo || "consulta";
            const [tbg, tc] = tipoBg[tipo] || tipoBg.consulta;
            const fecha = new Date(t.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
            return (
              <div key={t.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioDot[t.prioridad] || prioDot.media, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{t.resumen || "(sin resumen)"}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.muted, alignItems: "center" }}>
                    <span style={{ background: tbg, color: tc, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>{tipo}</span>
                    <span>{t.socios?.nombre || "—"}</span>
                    <span>{fecha}</span>
                  </div>
                </div>
                <select value={t.estado || "abierto"} onChange={e => cambiarEstado(t.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "6px 10px" }}>
                  <option value="abierto">Abierto</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ ...btnSecondary, padding: "5px 12px" }}>‹</button>
          <span style={{ fontSize: 13, color: C.muted }}>Página {page} de {pages} · {filtered.length} tickets</span>
          <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} style={{ ...btnSecondary, padding: "5px 12px" }}>›</button>
        </div>
      )}
    </div>
  );
}

// ── PEDIDOS ──────────────────────────────────────────────────────────
function Pedidos({ toast }) {
  const [pedidos, setPedidos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ socio_id: "", producto_id: "", cantidad: 1, metodo_pago: "efectivo", turno_delivery: "lunes", estado: "pendiente" });
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
    setForm({ socio_id: "", producto_id: "", cantidad: 1, metodo_pago: "efectivo", turno_delivery: "lunes", estado: "pendiente" });
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

  const totalFacturado = pedidos.filter(p => p.estado === "entregado").reduce((s, p) => s + (p.precio_unitario * p.cantidad), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Pedidos</h2>
        <button onClick={() => setModal(true)} style={btnPrimary}>+ Nuevo pedido</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
        {[["Total pedidos", pedidos.length, C.text], ["Pendientes", pedidos.filter(p=>p.estado==="pendiente").length, "#8C6B1A"], ["En camino", pedidos.filter(p=>p.estado==="en_camino").length, "#185FA5"], ["Entregados", pedidos.filter(p=>p.estado==="entregado").length, C.green], ["Facturado", `$${totalFacturado.toLocaleString("es-AR")}`, C.dark]].map(([l,v,c]) => (
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
          {filtered.map(p => {
            const [bg, tc] = estadoBg[p.estado] || estadoBg.pendiente;
            const fecha = new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
            return (
              <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.socios?.nombre || "—"}</div>
                  <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{p.productos?.nombre || "—"} × {p.cantidad}</span>
                    <span style={{ fontWeight: 600, color: C.green }}>${(p.precio_unitario * p.cantidad).toLocaleString("es-AR")}</span>
                    <span>{p.metodo_pago}</span>
                    <span>Delivery: {p.turno_delivery}</span>
                    <span>{fecha}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: bg, color: tc, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{p.estado?.replace("_"," ")}</span>
                  <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 }}>
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">Preparando</option>
                    <option value="en_camino">En camino</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            );
          })}
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
          <Field label="Turno de delivery">
            <select value={form.turno_delivery} onChange={e => setForm(f => ({...f, turno_delivery: e.target.value}))} style={inputStyle}>
              <option value="lunes">Lunes</option>
              <option value="miercoles">Miércoles</option>
              <option value="viernes">Viernes</option>
            </select>
          </Field>
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
          {filtrados.map((p, i) => {
            const dir = p.socios?.direccion;
            const mapsUrl = dir ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}` : null;
            return (
              <div key={p.id} style={{ background: C.white, border: p.estado === "en_camino" ? `2px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.dark, flexShrink: 0 }}>{i+1}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p.socios?.nombre || "—"}</div>
                      {p.estado === "en_camino" && <span style={{ background: "#E6F1FB", color: "#0C447C", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>En camino</span>}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
                      {p.productos?.nombre} × {p.cantidad} · <strong style={{ color: C.dark }}>${(p.precio_unitario * p.cantidad).toLocaleString("es-AR")}</strong> · {p.metodo_pago}
                    </div>
                    {dir && <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>📍 {dir}</div>}
                    {p.socios?.telefono && <div style={{ fontSize: 13, color: C.muted }}>Tel: <a href={`https://wa.me/54${p.socios.telefono}`} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 600 }}>{p.socios.telefono}</a></div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ ...btnSecondary, textAlign: "center", fontSize: 13, textDecoration: "none", display: "block" }}>Ver en Maps</a>}
                    {p.estado !== "en_camino" && <button onClick={() => marcarEnCamino(p.id)} style={{ ...btnSecondary, fontSize: 13 }}>Salió</button>}
                    <button onClick={() => marcarEntregado(p.id)} style={{ ...btnPrimary, fontSize: 13 }}>Entregado</button>
                  </div>
                </div>
              </div>
            );
          })}
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
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", dni: "", telefono: "", email: "", direccion: "", cuit: "", estado: "activo", notas: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await sb("socios?select=*&order=nombre");
    setSocios(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const abrirNuevo = () => { setEditando(null); setForm({ nombre: "", dni: "", telefono: "", email: "", direccion: "", cuit: "", estado: "activo", notas: "" }); setModal(true); };
  const abrirEditar = (s) => { setEditando(s.id); setForm({ nombre: s.nombre||"", dni: s.dni||"", telefono: s.telefono||"", email: s.email||"", direccion: s.direccion||"", cuit: s.cuit||"", estado: s.estado||"activo", notas: s.notas||"" }); setModal(true); };

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

  const filtered = socios.filter(s => {
    const q = search.toLowerCase();
    return !q || s.nombre?.toLowerCase().includes(q) || s.dni?.includes(q) || s.telefono?.includes(q);
  });

  const estadoColor = { activo: ["#EAF3DE","#27500A"], pendiente: ["#FAEEDA","#633806"], inactivo: ["#F1EFE8","#444441"] };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Socios <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>({socios.length} total · {socios.filter(s=>s.estado==="activo").length} activos)</span></h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo socio</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, DNI o teléfono..." style={{ ...inputStyle, maxWidth: 360, marginBottom: 16 }} />

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
                  <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>DNI {s.dni}</span>
                    {s.telefono && <span>{s.telefono}</span>}
                    {s.direccion && <span>{s.direccion}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: bg, color: tc, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.estado}</span>
                  <select value={s.estado} onChange={e => cambiarEstado(s.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12 }}>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
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

// ── DASHBOARD PRINCIPAL ──────────────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const isMobile = useIsMobile();
  const [seccion, setSeccion] = useState("tickets");
  const [toastMsg, setToastMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const secciones = [
    { id: "tickets", label: "Tickets" },
    { id: "pedidos", label: "Pedidos" },
    { id: "delivery", label: "Delivery" },
    { id: "socios", label: "Socios" },
    { id: "productos", label: "Productos" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input, select, textarea { font-family: inherit; }`}</style>

      {/* Header */}
      <div style={{ background: C.dark, padding: `0 ${isMobile ? "4%" : "6%"}`, display: "flex", alignItems: "center", height: 60, gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="Cogollos" style={{ height: 30, filter: "brightness(0) invert(1)" }} />
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
        {seccion === "tickets" && <Tickets toast={toast} />}
        {seccion === "pedidos" && <Pedidos toast={toast} />}
        {seccion === "delivery" && <Delivery toast={toast} />}
        {seccion === "socios" && <Socios toast={toast} />}
        {seccion === "productos" && <Productos toast={toast} />}
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}
