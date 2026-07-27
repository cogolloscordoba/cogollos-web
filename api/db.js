const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

// Rate limiting en memoria: ip -> { count, firstAttempt }
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function getRateLimit(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return { blocked: false, remaining: MAX_ATTEMPTS - 1 };
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000);
    return { blocked: true, retryAfter };
  }
  return { blocked: false, remaining: MAX_ATTEMPTS - entry.count };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://cogolloscordoba.ar");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting por IP
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const limit = getRateLimit(ip);
  if (limit.blocked) {
    return res.status(429).json({
      error: `Demasiados intentos. Esperá ${Math.ceil(limit.retryAfter / 60)} minutos.`
    });
  }

  const { email, password, refresh_token } = req.body || {};

  // Refresh token
  if (refresh_token) {
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
    if (!r.ok) return res.status(401).json({ error: "Token expirado" });
    const data = await r.json();
    return res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token });
  }

  // Login normal
  if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

  const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!r.ok) return res.status(401).json({ error: "Credenciales incorrectas" });
  const data = await r.json();
  return res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token });
}