"use client";

import { useState } from "react";
import { colombiaDepartamentos, municipiosPorDepartamento } from "@/lib/data/colombia-locations";
import { inputClass, labelClass } from "./FormField";

function parseLugar(value: string | null | undefined): { municipio: string; departamento: string } {
  if (!value) return { municipio: "", departamento: "" };
  const parts = value.split(",").map((p) => p.trim());
  if (parts.length === 2) {
    const [municipio, departamento] = parts;
    if (departamento && municipio && municipiosPorDepartamento[departamento]?.includes(municipio)) {
      return { municipio, departamento };
    }
  }
  return { municipio: "", departamento: "" };
}

interface LugarColombiaFieldProps {
  name: string;
  label: string;
  defaultValue?: string | null;
}

/**
 * Selector encadenado Departamento → Municipio (32 departamentos, ~1.100
 * municipios de Colombia). Escribe el valor combinado "Municipio, Departamento"
 * en un input oculto con el `name` indicado — se usa para lugar de nacimiento
 * y lugar de residencia, así que las Server Actions no cambian.
 */
export function LugarColombiaField({ name, label, defaultValue }: LugarColombiaFieldProps) {
  const initial = parseLugar(defaultValue);
  const [departamento, setDepartamento] = useState(initial.departamento);
  const [municipio, setMunicipio] = useState(initial.municipio);

  const municipios = departamento ? (municipiosPorDepartamento[departamento] ?? []) : [];
  const combined = municipio && departamento ? `${municipio}, ${departamento}` : "";
  const unrecognized = defaultValue && !initial.departamento ? defaultValue : null;

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="mt-1.5 grid grid-cols-2 gap-3">
        <select
          value={departamento}
          onChange={(e) => {
            setDepartamento(e.target.value);
            setMunicipio("");
          }}
          className={inputClass}
        >
          <option value="">Departamento</option>
          {colombiaDepartamentos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          disabled={!departamento}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">{departamento ? "Municipio" : "Elige un departamento"}</option>
          {municipios.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {unrecognized ? (
        <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/40">
          Valor actual: {unrecognized} — vuelve a seleccionarlo arriba si quieres cambiarlo.
        </p>
      ) : null}
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
