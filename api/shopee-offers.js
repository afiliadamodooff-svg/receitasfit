import crypto from "crypto";

const KEYWORDS = [
  "air fryer",
  "liquidificador",
  "pote hermetico marmita",
  "jogo de potes de vidro",
  "tabua de corte cozinha",
  "jogo de facas cozinha",
  "forma de silicone",
  "balanca de cozinha digital",
  "garrafa squeeze",
  "copo medidor cozinha",
  "potes de tempero organizador",
];

function assinar(appId, secret, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadStr = JSON.stringify(payload);
  const raw = appId + timestamp + payloadStr + secret;
  const signature = crypto.createHash("sha256").update(raw).digest("hex");
  return {
    "Content-Type": "application/json",
    Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
  };
}

async function buscarOferta(appId, secret, keyword) {
  const query = `{ productOfferV2(keyword: "${keyword.replace(/"/g, "")}", listType: 0, sortType: 2, page: 1, limit: 3) { nodes { itemId productName offerLink imageUrl priceMin commissionRate } } }`;
  const payload = { query };
  const headers = assinar(appId, secret, payload);

  const resp = await fetch("https://open-api.affiliate.shopee.com.br/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const json = await resp.json();
  if (json.errors) return [];
  return (json.data && json.data.productOfferV2 && json.data.productOfferV2.nodes) || [];
}

export default async function handler(req, res) {
  const appId = process.env.SHOPEE_APP_ID;
  const secret = process.env.SHOPEE_SECRET;

  if (!appId || !secret) {
    res.status(500).json({ error: "Credenciais da Shopee não configuradas" });
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  try {
    const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    const nodes = await buscarOferta(appId, secret, keyword);

    const offers = nodes
      .filter((n) => n.offerLink && n.productName)
      .map((n) => ({
        id: String(n.itemId),
        title: n.productName,
        image: n.imageUrl,
        affiliateLink: n.offerLink,
      }));

    res.status(200).json({ offers });
  } catch (err) {
    res.status(500).json({ error: "Falha ao buscar ofertas da Shopee" });
  }
};
