import { ClipboardPlus, FileUp, HeartPulse, MoreHorizontal, Send } from "lucide-react";
import { Card } from "../../ui/Card";

const actions = [
  { icon: ClipboardPlus, label: "Registrar evaluación" },
  { icon: HeartPulse, label: "Registrar lesión" },
  { icon: FileUp, label: "Subir documento" },
  { icon: Send, label: "Enviar mensaje" },
  { icon: MoreHorizontal, label: "Más acciones" },
];

/** Acciones rápidas — todavía sin flujo propio, se activan en próximas iteraciones. */
export function ProfileActionsBar() {
  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      {actions.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/35 cursor-not-allowed"
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          {label}
        </button>
      ))}
    </Card>
  );
}
