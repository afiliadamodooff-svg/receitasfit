import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: string;
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  return (
    <div className="relative block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(recipe.id);
        }}
        aria-label="Favoritar receita"
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-lg"
      >
        {favorited ? "❤️" : "🤍"}
      </button>
      <Link to={`/receita/${recipe.id}`}>
        <img src={recipe.image} alt={recipe.title} className="w-full h-36 object-cover" />
        <div className="p-3">
          <h3 className="font-semibold text-fit-dark text-sm">{recipe.title}</h3>
          <p className="text-xs text-gray-500 mt-1">⏱ {recipe.prepTime}</p>
        </div>
      </Link>
    </div>
  );
}
