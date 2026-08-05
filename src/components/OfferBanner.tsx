import { useEffect, useState } from "react";
import fallbackOffers from "../data/offers.json";

type Offer = {
  id: string;
  title: string;
  image: string;
  price?: number | null;
  originalPrice?: number | null;
  isFlash?: boolean;
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
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {offers.map((offer) => (
          <a
            key={offer.id}
            href={offer.affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="relative shrink-0 w-24 bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
          >
            {offer.isFlash && (
              <span className="absolute top-1 left-1 z-10 bg-fit-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                ⚡ RELÂMPAGO
              </span>
            )}
            <img src={offer.image} alt={offer.title} className="w-24 h-24 object-cover" />
            <div className="p-1.5">
              <p className="text-[11px] text-gray-600 truncate">{offer.title}</p>
              {formatPrice(offer.originalPrice) && (
                <p className="text-[10px] text-gray-400 line-through leading-none">
                  {formatPrice(offer.originalPrice)}
                </p>
              )}
              {formatPrice(offer.price) && (
                <p className="text-sm font-bold text-fit-orange mt-0.5">{formatPrice(offer.price)}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
