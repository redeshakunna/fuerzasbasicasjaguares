/** Sedes oficiales de entrenamiento del club. */
export const trainingVenues = [
  "Sede Principal Jaguares FC, vía Caño Viejo/Las Lamas",
  "Sede Ilusión Jaguares, vía Los Pericos",
] as const;

export type TrainingVenue = (typeof trainingVenues)[number];
