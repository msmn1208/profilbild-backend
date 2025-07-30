import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 1. CORS Headers setzen
  res.setHeader('Access-Control-Allow-Origin', 'https://www.stickeret.com'); // deine Domain hier
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Preflight-Anfrage beantworten
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST-Anfragen erlaubt' });
  }

  try {
    const { customerId, profileImageUrl } = req.body;

    if (!customerId || !profileImageUrl) {
      return res.status(400).json({ error: 'customerId und profileImageUrl werden benötigt' });
    }

    // Shopify Admin API URL
    const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // z.B. 'deinshop.myshopify.com'
    const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    // GraphQL Mutation zum Setzen des Metafelds (custom.profilbild)
    const query = `
      mutation metafieldUpsert($metafield: MetafieldInput!) {
        metafieldUpsert(metafield: $metafield) {
          metafield {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metafield: {
        namespace: "custom",
        key: "profilbild",
        ownerId: customerId, // Shopify Kunden-ID (global ID)
        type: "url",
        value: profileImageUrl
      }
    };

    const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(500).json({ error: data.errors });
    }

    if (data.data.metafieldUpsert.userErrors.length > 0) {
      return res.status(400).json({ error: data.data.metafieldUpsert.userErrors });
    }

    return res.status(200).json({ message: 'Profilbild erfolgreich gespeichert', metafield: data.data.metafieldUpsert.metafield });

  } catch (error) {
    console.error('Fehler beim Speichern des Profilbilds:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}
