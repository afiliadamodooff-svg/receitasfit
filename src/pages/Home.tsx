import { useState } from "react";
import recipes from "../data/recipes.json";
import categories from "../data/categories.json";
import RecipeCard from "../components/RecipeCard";
import OfferBanner from "../components/OfferBanner";
import { useFavorites } from "../hooks/useFavorites";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | "favoritos" | null>(null);
  const [search, setSearch] = useState("");
  const { favorites } = useFavorites();

  const byCategory =
    activeCategory === "favoritos"
      ? recipes.filter((r) => favorites.includes(r.id))
      : activeCategory
      ? recipes.filter((r) => r.category === activeCategory)
      : recipes;

  const filtered = search.trim()
    ? byCategory.filter((r) => r.title.toLowerCase().includes(search.trim().toLowerCase()))
    : byCategory;

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pb-10">
      <header className="pt-6 pb-4 text-center">
        <h1 className="text-2xl font-bold text-fit-dark">Receitas Fit 🥑</h1>
        <p className="text-sm text-gray-500">Práticas, rápidas e de verdade</p>
      </header>

      <div className="mb-4">
        <OfferBanner />
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar receita por nome..."
        className="w-full mb-3 px-4 py-2 rounded-full bg-white shadow text-sm text-fit-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fit-green"
      />

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
