export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { customerId, imageUrl } = req.body;

  if (!customerId || !imageUrl) {
    return res.status(400).json({ error: 'Fehlende Daten' });
  }

  const shop = 'stickeret.com'; // <--- DEIN SHOP
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN; // kommt gleich in Vercel

  const response = await fetch(`https://${shop}/admin/api/2024-01/metafields.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      metafield: {
        namespace: "custom",
        key: "profilbild",
        type: "url",
        value: imageUrl,
        owner_resource: "customer",
        owner_id: customerId
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: result });
  }

  res.status(200).json({ success: true, result });
}
