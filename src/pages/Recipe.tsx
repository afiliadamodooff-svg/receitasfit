import { useParams, Link } from "react-router-dom";
import recipes from "../data/recipes.json";
import ExportRecipeButton from "../components/ExportRecipeButton";
import OfferBanner from "../components/OfferBanner";
import { useFavorites } from "../hooks/useFavorites";

export default function Recipe() {
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === id);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto px-4 pt-10 text-center">
        <p className="text-gray-500">Receita não encontrada.</p>
        <Link to="/" className="text-fit-green font-medium">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-2xl mx-auto px-4 pb-10">
      <Link to="/" className="inline-block pt-4 pb-2 text-sm text-fit-green font-medium">
        ← Voltar
      </Link>

      <img src={recipe.image} alt={recipe.title} className="w-full h-48 md:h-72 object-cover rounded-xl" />

      <div className="flex items-center justify-between mt-3">
        <h1 className="text-xl font-bold text-fit-dark">{recipe.title}</h1>
        <button
          onClick={() => toggleFavorite(recipe.id)}
          aria-label="Favoritar receita"
          className="text-2xl shrink-0 ml-2"
        >
          {isFavorite(recipe.id) ? "❤️" : "🤍"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">⏱ {recipe.prepTime} · {recipe.servings}</p>

      <h2 className="font-semibold text-fit-dark mt-5 mb-2">Ingredientes</h2>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        {recipe.ingredients.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>

      <h2 className="font-semibold text-fit-dark mt-5 mb-2">Modo de preparo</h2>
      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>

      <ExportRecipeButton recipe={recipe} />

      <div className="mt-5">
        <OfferBanner />
      </div>
    </div>
  );
}
