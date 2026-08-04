import { Link } from "react-router-dom";

type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: string;
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/receita/${recipe.id}`}
      className="block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition"
    >
      <img src={recipe.image} alt={recipe.title} className="w-full h-36 object-cover" />
      <div className="p-3">
        <h3 className="font-semibold text-fit-dark text-sm">{recipe.title}</h3>
        <p className="text-xs text-gray-500 mt-1">⏱ {recipe.prepTime}</p>
      </div>
    </Link>
  );
}
