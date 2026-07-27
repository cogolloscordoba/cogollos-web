const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://cogolloscordoba.ar");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token, password } = req.body || {};
  if (!access_token || !password) return res.status(400).json({ error: "Faltan datos" });
  if (password.length < 8) return res.status(400).json({ error: "Contraseña muy corta" });

  const r = await fetch(`${SB_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!r.ok) return res.status(400).json({ error: "Link expirado o inválido" });
  return res.status(200).json({ ok: true });
}
