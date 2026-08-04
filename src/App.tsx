import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Recipe from "./pages/Recipe";
import Carrosseis from "./pages/Carrosseis";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/receita/:id" element={<Recipe />} />
      <Route path="/carrosseis" element={<Carrosseis />} />
    </Routes>
  );
}
