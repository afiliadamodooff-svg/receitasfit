import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes.json";
import { generateAndDownloadCarousel } from "../utils/carousel";

const SESSION_KEY = "receitasfit:carrosseis-unlocked";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(false);
    try {
      const resp = await fetch("/api/check-carousel-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await resp.json();
      if (data.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onUnlock();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 pt-16 text-center">
      <Link to="/" className="inline-block mb-6 text-sm text-fit-green font-medium">
        ← Voltar
      </Link>
      <h1 className="text-lg font-bold text-fit-dark mb-2">Área restrita 🔒</h1>
      <p className="text-sm text-gray-500 mb-4">Digite a senha para acessar os carrosséis.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full px-4 py-2 rounded-full bg-white shadow text-sm text-center focus:outline-none focus:ring-2 focus:ring-fit-green"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mt-2">Senha incorreta.</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full mt-3 bg-fit-green text-white font-semibold py-2 rounded-full disabled:opacity-50"
        >
          {checking ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function Carrosseis() {
  const [unlocked, setUnlocked] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

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

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
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
