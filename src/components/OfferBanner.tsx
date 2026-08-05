import { useEffect, useState } from "react";
import fallbackOffers from "../data/offers.json";

type Offer = {
  id: string;
  title: string;
  image: string;
  price?: number | null;
  affiliateLink: string;
};

function formatPrice(price?: number | null) {
  if (!price) return null;
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>(fallbackOffers);

  useEffect(() => {
    fetch("/api/shopee-offers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.offers) && data.offers.length > 0) {
          setOffers(data.offers);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <p className="text-xs text-fit-orange font-semibold uppercase mb-2">Ofertas pra sua cozinha</p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {offers.map((offer) => (
          <a
            key={offer.id}
            href={offer.affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="shrink-0 w-32 bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
          >
            <img src={offer.image} alt={offer.title} className="w-32 h-32 object-cover" />
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate">{offer.title}</p>
              {formatPrice(offer.price) && (
                <p className="text-sm font-bold text-fit-green mt-0.5">{formatPrice(offer.price)}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
