import { useEffect, useState } from "react";

const STORAGE_KEY = "receitasfit:favorites";

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let favoritesState: string[] = readFavorites();
const listeners = new Set<(favorites: string[]) => void>();

function setFavoritesState(next: string[]) {
  favoritesState = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener(favoritesState));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(favoritesState);

  useEffect(() => {
    listeners.add(setFavorites);
    return () => {
      listeners.delete(setFavorites);
    };
  }, []);

  function toggleFavorite(id: string) {
    const next = favoritesState.includes(id)
      ? favoritesState.filter((f) => f !== id)
      : [...favoritesState, id];
    setFavoritesState(next);
  }

  function isFavorite(id: string) {
    return favorites.includes(id);
  }

  return { favorites, toggleFavorite, isFavorite };
}
