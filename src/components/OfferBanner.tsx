import { useEffect, useState } from "react";
import offers from "../data/offers.json";

export default function OfferBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const offer = offers[index];

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
        <p className="text-sm font-medium text-fit-dark">{offer.title}</p>
      </div>
    </a>
  );
}
