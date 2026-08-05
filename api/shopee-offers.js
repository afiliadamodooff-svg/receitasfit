import crypto from "crypto";

const KEYWORDS = [
  "air fryer",
  "liquidificador portatil",
  "pote hermetico marmita",
  "jogo de potes de vidro",
  "tabua de corte cozinha",
  "jogo de facas cozinha",
  "forma de silicone",
  "balanca de cozinha digital",
  "garrafa squeeze",
  "copo medidor cozinha",
  "potes de tempero organizador",
  "escorredor de louca",
  "organizador de geladeira",
  "processador de alimentos",
  "espremedor de frutas",
  "kit utensilios de cozinha",
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
  const query = `{ productOfferV2(keyword: "${keyword.replace(/"/g, "")}", listType: 0, sortType: 2, page: 1, limit: 2) { nodes { itemId productName offerLink imageUrl priceMin priceDiscountRate commissionRate } } }`;
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
    const shuffled = [...KEYWORDS].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 7);
    const results = await Promise.all(chosen.map((k) => buscarOferta(appId, secret, k)));

    const seenIds = new Set();
    const seenTitles = new Set();
    const offers = [];

    for (const n of results.flat()) {
      if (!n.offerLink || !n.productName) continue;
      const id = String(n.itemId);
      const normalized = n.productName.trim().toLowerCase();
      const titleKey = normalized.split(/\s+/).slice(0, 3).join(" ");
      if (seenIds.has(id) || seenTitles.has(titleKey)) continue;
      seenIds.add(id);
      seenTitles.add(titleKey);

      const price = parseFloat(n.priceMin) || null;
      const discountRate = parseFloat(n.priceDiscountRate) || 0;
      const originalPrice = price && discountRate > 0 ? price / (1 - discountRate / 100) : null;

      offers.push({
        id,
        title: n.productName,
        image: n.imageUrl,
        price,
        originalPrice,
        discountRate,
        isFlash: discountRate >= 20,
        affiliateLink: n.offerLink,
      });
    }

    res.status(200).json({ offers });
  } catch (err) {
    res.status(500).json({ error: "Falha ao buscar ofertas da Shopee" });
  }
};
