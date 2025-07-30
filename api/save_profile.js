export default async function handler(req, res) {
  // 1. CORS erlauben für deinen Shop
  res.setHeader('Access-Control-Allow-Origin', 'https://www.stickeret.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Preflight-Anfrage (OPTIONS) abfangen
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Nur Header zurückgeben
  }

  // 3. Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  // 4. Dein normaler Code (z. B. Bild-URL auslesen)
  const { imageUrl, customerId } = req.body;

  if (!imageUrl || !customerId) {
    return res.status(400).json({ error: 'Fehlende Daten' });
  }

  // Hier würdest du z. B. Shopify Metafeld speichern – Dummy als Platzhalter:
  console.log(`Speichere Bild für ${customerId}: ${imageUrl}`);

  // 5. Erfolg zurückgeben
  res.status(200).json({ success: true });
}
