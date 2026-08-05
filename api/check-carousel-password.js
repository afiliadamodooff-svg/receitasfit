export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const { password } = req.body || {};
  const expected = process.env.CARROSSEIS_PASSWORD;

  res.status(200).json({ ok: Boolean(expected) && password === expected });
}
