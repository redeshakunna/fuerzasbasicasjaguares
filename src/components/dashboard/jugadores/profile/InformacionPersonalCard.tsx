import { Card, CardHeader } from "../../ui/Card";
import { EditPlayerButton } from "./EditPlayerButton";
import { getFullName } from "@/lib/data/players-stats";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

function formatDate(value: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">{label}</span>
      <span className="text-right text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{value}</span>
    </div>
  );
}

export function InformacionPersonalCard({ player, isAdmin, age }: { player: PlayerRow; isAdmin: boolean; age: number }) {
  return (
    <Card>
      <CardHeader
        title="Información Personal"
        action={isAdmin ? <EditPlayerButton player={player} /> : undefined}
      />
      <div className="divide-y divide-jaguar-ink/6 px-6 pb-6 pt-2">
        <Row label="Nombre completo" value={getFullName(player)} />
        {player.nickname ? <Row label="Apodo" value={`"${player.nickname}"`} /> : null}
        <Row
          label="Documento"
          value={player.document_type && player.document_number ? `${player.document_type} · ${player.document_number}` : "—"}
        />
        <Row label="Fecha de nacimiento" value={formatDate(player.birth_date)} />
        <Row label="Edad" value={`${age} años`} />
        <Row label="Teléfono de contacto" value={player.phone ?? "—"} />
        <Row label="Lugar de nacimiento" value={player.birth_place ?? "—"} />
        <Row label="Lugar de residencia" value={player.residence_place ?? "—"} />
        <Row label="Dirección" value={player.address ?? "—"} />
        <Row
          label="Institución educativa"
          value={player.school_name ? `${player.school_name}${player.school_grade ? " · " + player.school_grade : ""}` : "—"}
        />
        <Row label="EPS" value={player.eps_name ?? "—"} />
        <Row label="Tipo de sangre" value={player.blood_type ?? "—"} />
        {player.allergies ? <Row label="Alergias" value={player.allergies} /> : null}
      </div>
    </Card>
  );
}
