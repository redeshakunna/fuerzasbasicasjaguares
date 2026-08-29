import { Fragment } from "react";

/**
 * Render mínimo de markdown para burbujas de chat — el modelo a veces
 * devuelve **negrita** o listas con "- "; sin esto se veían los asteriscos
 * literales. Deliberadamente no se trae una librería de markdown completa
 * (no hace falta: solo negrita y saltos de línea, que ya vienen de
 * whitespace-pre-wrap en el contenedor).
 */
export function MarkdownLite({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
