import { useEffect, useState } from "react";
import fallbackOffers from "../data/offers.json";

type Offer = {
  id: string;
  title: string;
  image: string;
  affiliateLink: string;
};

export default function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>(fallbackOffers);
  const [index, setIndex] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const offer = offers[index % offers.length];

  return (
    <a
      href={offer.affiliateLink}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center gap-3 rounded-xl bg-white shadow p-3 hover:shadow-md transition"
    >
      <img src={offer.image} alt={offer.title} className="w-16 h-16 object-cover rounded-lg" />
      <div>
        <p className="text-xs text-fit-orange font-semibold uppercase">Oferta</p>
        <p className="text-sm font-medium text-fit-dark line-clamp-2">{offer.title}</p>
      </div>
    </a>
  );
}
