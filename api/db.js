const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

// Rate limiting para rutas públicas
const rpcAttempts = new Map();
const MAX_RPC = 10;
const RPC_WINDOW_MS = 60 * 1000;

function checkRpcLimit(ip) {
  const now = Date.now();
  const entry = rpcAttempts.get(ip);
  if (!entry || now - entry.firstAttempt > RPC_WINDOW_MS) {
    rpcAttempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }
  entry.count++;
  return entry.count > MAX_RPC;
}

const PUBLIC_ROUTES = [
  /^productos/,
  /^rpc\/login_socio_v3/,
  /^rpc\/dni_existe/,
  /^rpc\/pedidos_de_socio/,
];

const ALLOWED_ROUTES = [
  /^productos/,
  /^socios/,
  /^pedidos/,
  /^tickets/,
  /^rpc\//,
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://cogolloscordoba.ar");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Prefer");
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: "Falta path" });

  const allowed = ALLOWED_ROUTES.some(r => r.test(path));
  if (!allowed) return res.status(403).json({ error: "Ruta no permitida" });

  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const isPublic = PUBLIC_ROUTES.some(r => r.test(path));

  // Rate limiting para rutas públicas sin token
  if (isPublic && !userToken) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
    if (checkRpcLimit(ip)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Esperá un momento." });
    }
  }

  const token = userToken || SB_KEY;
  const method = req.method;

  // Para GET no mandamos body
  const hasBody = method !== "GET" && method !== "HEAD" && req.body && Object.keys(req.body).length > 0;

  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(req.headers.prefer ? { Prefer: req.headers.prefer } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
  });

  const text = await r.text();
  const contentRange = r.headers.get("content-range");
  if (contentRange) res.setHeader("content-range", contentRange);
  res.status(r.status).send(text);
}