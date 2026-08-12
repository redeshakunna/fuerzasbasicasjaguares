"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { categories, activeCategories, type Category } from "@/lib/data/categories";

/** Selector de categoría — Sub-13 / Sub-15 / Sub-17. Reutilizable en cualquier página con `?categoria=`. */
export function CategorySelector({ active, basePath = "/plataforma" }: { active: Category; basePath?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(category: Category) {
    if (category === active) return;
    startTransition(() => {
      router.push(`${basePath}?categoria=${category}`);
    });
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-jaguar-ink/10 bg-white p-1 ${isPending ? "opacity-60" : ""}`}>
      {categories.map((category) => {
        const isActive = category === active;
        const hasData = activeCategories.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => choose(category)}
            className={`relative rounded-full px-4 py-2 text-[13px] lg:text-[14px] font-bold transition-colors ${
              isActive ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/50 hover:bg-jaguar-mist/60"
            }`}
          >
            {category}
            {!hasData ? (
              <span
                className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${isActive ? "bg-white/70" : "bg-jaguar-gold-500"}`}
                title="Próximamente"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
