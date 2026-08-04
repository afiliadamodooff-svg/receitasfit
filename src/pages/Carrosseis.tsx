import { useState } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes.json";
import { generateAndDownloadCarousel } from "../utils/carousel";

export default function Carrosseis() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDownload(recipe: (typeof recipes)[number]) {
    setLoadingId(recipe.id);
    try {
      await generateAndDownloadCarousel(recipe);
    } catch (err) {
      alert("Não foi possível gerar o carrossel dessa receita. Tente novamente.");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="max-w-md md:max-w-2xl mx-auto px-4 pb-10">
      <Link to="/" className="inline-block pt-4 pb-2 text-sm text-fit-green font-medium">
        ← Voltar
      </Link>

      <header className="pb-4">
        <h1 className="text-xl font-bold text-fit-dark">Carrosséis prontos 🎠</h1>
        <p className="text-sm text-gray-500 mt-1">
          Baixe capa + slides de cada receita, prontos pro Instagram (formato 4:5).
        </p>
      </header>

      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex items-center gap-3 bg-white rounded-xl shadow p-3">
            <img src={recipe.image} alt={recipe.title} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-fit-dark truncate">{recipe.title}</p>
              <p className="text-xs text-gray-500">3 slides · 1080x1350</p>
            </div>
            <button
              onClick={() => handleDownload(recipe)}
              disabled={loadingId === recipe.id}
              className="shrink-0 bg-fit-green text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
            >
              {loadingId === recipe.id ? "Gerando..." : "Baixar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
