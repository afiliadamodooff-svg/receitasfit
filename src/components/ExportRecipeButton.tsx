import { useEffect, useRef } from "react";
import fallbackOffers from "../data/offers.json";

type Recipe = {
  title: string;
  ingredients: string[];
  steps: string[];
};

type Offer = { affiliateLink: string };

function buildRecipeText(recipe: Recipe) {
  const ingredients = recipe.ingredients.map((i) => `- ${i}`).join("\n");
  const steps = recipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n");
  return `${recipe.title}\n\nIngredientes:\n${ingredients}\n\nModo de preparo:\n${steps}\n\nReceitasFit`;
}

export default function ExportRecipeButton({ recipe }: { recipe: Recipe }) {
  const offersRef = useRef<Offer[]>(fallbackOffers);

  useEffect(() => {
    fetch("/api/shopee-offers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.offers) && data.offers.length > 0) {
          offersRef.current = data.offers;
        }
      })
      .catch(() => {});
  }, []);

  function handleExport() {
    const offers = offersRef.current;
    const offer = offers[Math.floor(Math.random() * offers.length)];

    window.open(offer.affiliateLink, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      const text = buildRecipeText(recipe);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${recipe.title}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }, 600);
  }

  return (
    <button
      onClick={handleExport}
      className="w-full mt-4 bg-fit-green text-white font-semibold py-3 rounded-xl hover:bg-fit-dark transition"
    >
      Ver oferta do dia e baixar receita 📥
    </button>
  );
}
