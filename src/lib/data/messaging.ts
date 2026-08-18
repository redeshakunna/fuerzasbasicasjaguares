import { createClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/finance/format";
import {
  formatDateLong,
  formatTime12h,
  daysBetween,
  toWhatsAppPhone,
  firstNameOf,
  type MessageRecipient,
  type MatchReplacementGroup,
} from "@/lib/data/messaging-shared";

/** Jugadores con obligación en estado "Vencido" para una categoría — listos para recordatorio de pago. */
export async function getDebtorRecipients(category: string): Promise<MessageRecipient[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, guardian_name, guardian_phone, phone")
    .eq("category", category);
  if (!players || players.length === 0) return [];

  const playerIds = players.map((p) => p.id);
  const { data: obligations, error } = await supabase
    .from("obligations")
    .select("id, player_id, concept_id, amount, due_date, status")
    .eq("status", "Vencido")
    .in("player_id", playerIds)
    .order("due_date", { ascending: true });
  if (error) {
    console.error("getDebtorRecipients() falló:", error);
    return [];
  }
  if (!obligations || obligations.length === 0) return [];

  const conceptIds = [...new Set(obligations.map((o) => o.concept_id))];
  const { data: concepts } = await supabase.from("payment_concepts").select("id, name").in("id", conceptIds);
  const conceptNameById = new Map((concepts ?? []).map((c) => [c.id, c.name]));
  const playerById = new Map(players.map((p) => [p.id, p]));

  return obligations.map((o) => {
    const player = playerById.get(o.player_id);
    const playerName = player ? `${player.first_name} ${player.last_name}` : "Jugador";
    const guardianName = player?.guardian_name || "Padre de familia";
    const amount = formatCOP(Number(o.amount));
    const dueDateLabel = formatDateLong(o.due_date);
    const overdueDays = daysBetween(o.due_date, today);

    const message = [
      "*ACADEMIA JAGUARES DE CÓRDOBA*",
      "*Recordatorio de pago*",
      "",
      `Hola ${guardianName}, te escribimos de Jaguares de Córdoba.`,
      "",
      `Jugador: ${playerName}`,
      `Concepto: ${conceptNameById.get(o.concept_id) ?? "Cobro pendiente"}`,
      `Valor: ${amount}`,
      `Venció: ${dueDateLabel}${overdueDays > 0 ? ` (${overdueDays} ${overdueDays === 1 ? "día" : "días"} de mora)` : ""}`,
      "",
      "Si ya realizaste el pago, ignora este mensaje. Cualquier duda, escríbenos por este medio.",
      "",
      "¡Gracias por tu compromiso con Jaguares!",
    ].join("\n");

    return {
      playerId: o.player_id,
      playerName,
      guardianName,
      waPhone: toWhatsAppPhone(player?.guardian_phone || player?.phone),
      message,
      meta: `${amount} · vencido hace ${overdueDays} ${overdueDays === 1 ? "día" : "días"}`,
      obligationId: o.id,
    };
  });
}

/** Jugadores con al menos una falta ("Ausente") en los últimos `sinceDays` días, para una categoría. */
export async function getAbsenteeRecipients(category: string, sinceDays = 14): Promise<MessageRecipient[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data: trainings } = await supabase
    .from("trainings")
    .select("id, session_date")
    .eq("category", category)
    .gte("session_date", sinceIso);
  if (!trainings || trainings.length === 0) return [];

  const trainingIds = trainings.map((t) => t.id);
  const trainingDateById = new Map(trainings.map((t) => [t.id, t.session_date]));

  const { data: attendance, error } = await supabase
    .from("attendance")
    .select("player_id, training_id, status")
    .eq("status", "Ausente")
    .in("training_id", trainingIds);
  if (error) {
    console.error("getAbsenteeRecipients() falló:", error);
    return [];
  }
  if (!attendance || attendance.length === 0) return [];

  const absencesByPlayer = new Map<string, string[]>();
  for (const a of attendance) {
    const list = absencesByPlayer.get(a.player_id) ?? [];
    const date = a.training_id ? trainingDateById.get(a.training_id) : undefined;
    if (date) list.push(date);
    absencesByPlayer.set(a.player_id, list);
  }
  if (absencesByPlayer.size === 0) return [];

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, guardian_name, guardian_phone, phone")
    .in("id", [...absencesByPlayer.keys()]);

  return (players ?? [])
    .map((player) => {
      const dates = (absencesByPlayer.get(player.id) ?? []).sort();
      const count = dates.length;
      const lastDate = dates[dates.length - 1];
      const playerName = `${player.first_name} ${player.last_name}`;
      const guardianName = player.guardian_name || "Padre de familia";

      const message = [
        "*ACADEMIA JAGUARES DE CÓRDOBA*",
        "*Aviso de inasistencia*",
        "",
        `Hola ${guardianName}, te escribimos de Jaguares de Córdoba.`,
        "",
        `${playerName} no ha asistido a ${count} ${count === 1 ? "entrenamiento" : "entrenamientos"} en las últimas ${sinceDays > 14 ? "semanas" : "dos semanas"}${lastDate ? ` (la más reciente el ${formatDateLong(lastDate)})` : ""}.`,
        "",
        "La constancia es clave en su proceso formativo — cualquier situación que esté afectando su asistencia, cuéntanos y buscamos cómo apoyar.",
        "",
        "¡Los esperamos en la próxima sesión!",
      ].join("\n");

      return {
        playerId: player.id,
        playerName,
        guardianName,
        waPhone: toWhatsAppPhone(player.guardian_phone || player.phone),
        message,
        meta: `${count} ${count === 1 ? "falta" : "faltas"}${lastDate ? ` · última: ${formatDateLong(lastDate)}` : ""}`,
      };
    })
    .sort((a, b) => b.meta.localeCompare(a.meta));
}

/**
 * Aviso general de fecha de corte — a TODOS los jugadores activos de la
 * categoría (no solo a quien tenga una obligación vencida en `obligations`).
 * Distinto de getDebtorRecipients(): ese avisa un monto puntual vencido;
 * este es el aviso masivo de "llegó la fecha de corte del mes, ponte al día".
 */
export async function getCutoffNoticeRecipients(category: string): Promise<MessageRecipient[]> {
  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, first_name, last_name, guardian_name, guardian_phone, phone, status")
    .eq("category", category)
    .order("first_name");
  if (error) {
    console.error("getCutoffNoticeRecipients() falló:", error);
    return [];
  }

  return (players ?? [])
    .filter((p) => p.status === "Disponible")
    .map((player) => {
      const playerName = `${player.first_name} ${player.last_name}`;
      const guardianName = player.guardian_name || "Padre de familia";
      const message = [
        "*ACADEMIA JAGUARES DE CÓRDOBA*",
        "*Fecha de corte del mes*",
        "",
        `Hola ${guardianName}, te escribimos de Jaguares de Córdoba.`,
        "",
        `Llegó la fecha de corte de este mes — te recordamos ponerte al día con la mensualidad de ${playerName} para evitar mora.`,
        "",
        "Si ya realizaste el pago, ignora este mensaje. Cualquier duda, escríbenos por este medio.",
        "",
        "¡Gracias por tu compromiso con Jaguares!",
      ].join("\n");

      return {
        playerId: player.id,
        playerName,
        guardianName,
        waPhone: toWhatsAppPhone(player.guardian_phone || player.phone),
        message,
        meta: guardianName,
      };
    });
}

/** Todos los jugadores activos de una categoría, listos para un mensaje libre. */
export async function getActivePlayersForCategory(category: string): Promise<MessageRecipient[]> {
  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, first_name, last_name, guardian_name, guardian_phone, phone, status")
    .eq("category", category)
    .order("first_name");
  if (error) {
    console.error("getActivePlayersForCategory() falló:", error);
    return [];
  }
  return (players ?? [])
    .filter((p) => p.status === "Disponible")
    .map((player) => {
      const playerName = `${player.first_name} ${player.last_name}`;
      const guardianName = player.guardian_name || "Padre de familia";
      return {
        playerId: player.id,
        playerName,
        guardianName,
        waPhone: toWhatsAppPhone(player.guardian_phone || player.phone),
        message: "",
        meta: guardianName,
      };
    });
}

/** Próximos partidos de una categoría con bajas confirmadas y candidatos disponibles para reemplazo. */
export async function getReplacementGroups(category: string, limit = 3): Promise<MatchReplacementGroup[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, category, opponent, match_date, match_time, location")
    .eq("category", category)
    .gte("match_date", today)
    .order("match_date", { ascending: true })
    .limit(limit);
  if (error || !matches || matches.length === 0) {
    if (error) console.error("getReplacementGroups() falló:", error);
    return [];
  }

  const matchIds = matches.map((m) => m.id);
  const { data: callups } = await supabase
    .from("match_callups")
    .select("match_id, player_id, call_status")
    .in("match_id", matchIds);

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, guardian_name, guardian_phone, phone")
    .eq("category", category)
    .eq("status", "Disponible");
  const playerById = new Map((players ?? []).map((p) => [p.id, p]));

  const groups: MatchReplacementGroup[] = [];
  for (const match of matches) {
    const matchCallups = (callups ?? []).filter((c) => c.match_id === match.id);
    const withdrawnStatuses = new Set(["No asistirá", "Lesionado", "Suspendido"]);
    const withdrawn = matchCallups
      .filter((c) => withdrawnStatuses.has(c.call_status))
      .map((c) => {
        const p = playerById.get(c.player_id);
        return { playerId: c.player_id, playerName: p ? `${p.first_name} ${p.last_name}` : "Jugador", callStatus: c.call_status };
      });

    if (withdrawn.length === 0) continue;

    const calledUpIds = new Set(matchCallups.map((c) => c.player_id));
    const opponent = match.opponent;
    const matchDateLabel = formatDateLong(match.match_date);
    const matchTimeLabel = formatTime12h(match.match_time);

    const candidates: MessageRecipient[] = (players ?? [])
      .filter((p) => !calledUpIds.has(p.id))
      .map((player) => {
        const playerName = `${player.first_name} ${player.last_name}`;
        const guardianName = player.guardian_name || "Padre de familia";
        const message = [
          "*ACADEMIA JAGUARES DE CÓRDOBA*",
          "*Convocatoria — cupo disponible*",
          "",
          `Hola ${guardianName}, te escribimos de Jaguares de Córdoba.`,
          "",
          `Se liberó un cupo en la convocatoria de ${category} para el partido ante ${opponent}.`,
          `Fecha: ${matchDateLabel}`,
          `Hora: ${matchTimeLabel}`,
          match.location ? `Lugar: ${match.location}` : null,
          "",
          `¿${firstNameOf(playerName)} puede sumarse? Confirma tu respuesta por este medio lo antes posible.`,
        ]
          .filter((line) => line !== null)
          .join("\n");

        return {
          playerId: player.id,
          playerName,
          guardianName,
          waPhone: toWhatsAppPhone(player.guardian_phone || player.phone),
          message,
          meta: "Disponible",
        };
      });

    groups.push({
      matchId: match.id,
      category: match.category,
      opponent,
      matchDateLabel,
      matchTimeLabel,
      location: match.location,
      withdrawn,
      candidates,
    });
  }

  return groups;
}
