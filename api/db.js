const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

// Lista blanca de rutas permitidas
const ALLOWED = [
  /^productos/,
  /^socios/,
  /^pedidos/,
  /^tickets/,
  /^rpc\/login_socio_v3/,
  /^rpc\/dni_existe/,
  /^rpc\/pedidos_de_socio/,
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://cogolloscordoba.ar");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Prefer");
  if (req.method === "OPTIONS") return res.status(200).end();

  // path viene como ?path=productos?select=*
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: "Falta path" });

  // Verificar que la ruta esté en la lista blanca
  const allowed = ALLOWED.some(r => r.test(path));
  if (!allowed) return res.status(403).json({ error: "Ruta no permitida" });

  // Pasar el token del usuario si viene, sino usar la key
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : SB_KEY;

  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: req.method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(req.headers.prefer ? { Prefer: req.headers.prefer } : {}),
    },
    ...(req.body && Object.keys(req.body).length ? { body: JSON.stringify(req.body) } : {}),
  });

  const text = await r.text();
  const contentRange = r.headers.get("content-range");
  if (contentRange) res.setHeader("content-range", contentRange);
  res.status(r.status).send(text);
}
