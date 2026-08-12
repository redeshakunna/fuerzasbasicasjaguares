import raw from "./colombia-raw.json";

interface DepartamentoData {
  id: number;
  departamento: string;
  ciudades: string[];
}

const data = raw as DepartamentoData[];

/** 32 departamentos de Colombia, orden alfabético. */
export const colombiaDepartamentos: string[] = data
  .map((d) => d.departamento)
  .sort((a, b) => a.localeCompare(b, "es"));

/** Municipios por departamento (~1.100), orden alfabético. Fuente: DANE / marcovega/colombia-json. */
export const municipiosPorDepartamento: Record<string, string[]> = Object.fromEntries(
  data.map((d) => [d.departamento, [...d.ciudades].sort((a, b) => a.localeCompare(b, "es"))])
);
