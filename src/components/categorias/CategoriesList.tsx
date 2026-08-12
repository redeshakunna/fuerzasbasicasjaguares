"use client";

import { CategoryRow } from "./CategoryRow";
import { categoriesContent } from "./categorias.data";

/**
 * Envoltorio cliente que importa categoriesContent directamente.
 *
 * Necesario porque categoriesContent incluye componentes de ícono
 * (LucideIcon), que no son serializables al cruzar de un Server
 * Component a un Client Component como prop. Al importar los datos
 * aquí adentro (ya en el cliente) evitamos ese cruce por completo.
 */
export function CategoriesList() {
  return (
    <div className="divide-y divide-jaguar-ink/6">
      {categoriesContent.map((category, index) => (
        <CategoryRow key={category.id} category={category} reverse={index % 2 === 1} />
      ))}
    </div>
  );
}
