/**
 * Utilidades de formato de texto compartidas.
 */

/**
 * Convierte un nombre o apellido a Formato Título: primera letra de cada
 * palabra en mayúscula, el resto en minúscula. Preserva tildes/ñ (usa
 * localeCompare-safe charAt en vez de regex ASCII) y colapsa espacios
 * múltiples.
 *
 * Se usa tanto en el cliente (formato en vivo mientras el usuario escribe)
 * como en el servidor (defensa en profundidad en las Server Actions, ya
 * que el formato del cliente puede evitarse).
 *
 * Ejemplos:
 *   toTitleCase("JUAN CARLOS")      -> "Juan Carlos"
 *   toTitleCase("maría josé")       -> "María José"
 *   toTitleCase("  ana   maría  ")  -> "Ana María"
 */
export function toTitleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      // Preserva partículas con guion (ej. "Jose-Luis" -> "Jose-Luis")
      return word
        .split("-")
        .map((part) => {
          if (part.length === 0) return part;
          return part.charAt(0).toLocaleUpperCase("es") + part.slice(1).toLocaleLowerCase("es");
        })
        .join("-");
    })
    .join(" ");
}
