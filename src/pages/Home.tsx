import { useState } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes.json";
import categories from "../data/categories.json";
import RecipeCard from "../components/RecipeCard";
import OfferBanner from "../components/OfferBanner";
import { useFavorites } from "../hooks/useFavorites";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | "favoritos" | null>(null);
  const { favorites } = useFavorites();

  const filtered =
    activeCategory === "favoritos"
      ? recipes.filter((r) => favorites.includes(r.id))
      : activeCategory
      ? recipes.filter((r) => r.category === activeCategory)
      : recipes;

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pb-10">
      <header className="pt-6 pb-4 text-center">
        <h1 className="text-2xl font-bold text-fit-dark">Receitas Fit 🥑</h1>
        <p className="text-sm text-gray-500">Práticas, rápidas e de verdade</p>
        <Link
          to="/carrosseis"
          className="inline-block mt-2 text-xs font-semibold text-fit-orange"
        >
          🎠 Baixar carrosséis pro Instagram
        </Link>
      </header>

      <div className="mb-4 md:max-w-md">
        <OfferBanner />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
            activeCategory === null ? "bg-fit-green text-white" : "bg-white text-fit-dark"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
              activeCategory === c.id ? "bg-fit-green text-white" : "bg-white text-fit-dark"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
        <button
          onClick={() => setActiveCategory("favoritos")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
            activeCategory === "favoritos" ? "bg-fit-green text-white" : "bg-white text-fit-dark"
          }`}
        >
          ❤️ Favoritos
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">Nenhuma receita nessa categoria ainda.</p>
      )}
    </div>
  );
}
