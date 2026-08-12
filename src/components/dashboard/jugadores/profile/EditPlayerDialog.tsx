"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, User, X } from "lucide-react";
import { updatePlayer, type RegisterPlayerState } from "@/app/plataforma/(dashboard)/jugadores/actions";
import { positionOptions } from "@/lib/data/positions";
import { categories, getCategoryAgeWarning, parseCategory, type Category } from "@/lib/data/categories";
import { Field, inputClass, labelClass } from "../FormField";
import { LugarColombiaField } from "../LugarNacimientoField";
import { getFullName } from "@/lib/data/players-stats";
import { useTakenJerseyNumbers } from "../useTakenJerseyNumbers";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

const initialState: RegisterPlayerState = {};
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export function EditPlayerDialog({ player, onClose }: { player: PlayerRow; onClose: () => void }) {
  const updatePlayerWithId = updatePlayer.bind(null, player.id);
  const [state, formAction, isPending] = useActionState(updatePlayerWithId, initialState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(player.photo_url);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [jerseyValue, setJerseyValue] = useState(player.jersey_number?.toString() ?? "");
  const [birthDateValue, setBirthDateValue] = useState(player.birth_date);
  const [categoryValue, setCategoryValue] = useState<Category>(parseCategory(player.category));
  const photoInputRef = useRef<HTMLInputElement>(null);

  const takenJerseyNumbers = useTakenJerseyNumbers(true, player.id);
  const jerseyNumber = jerseyValue ? Number(jerseyValue) : null;
  const isJerseyTaken = jerseyNumber !== null && takenJerseyNumbers.has(jerseyNumber);
  const ageWarning = getCategoryAgeWarning(birthDateValue, categoryValue);

  useEffect(() => {
    if (state.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PHOTO_BYTES) {
      setPhotoError("La foto pesa más de 8 MB. Usa una imagen más liviana.");
      e.target.value = "";
      return;
    }
    setPhotoError(null);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[640px] flex-col rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <div>
            <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Editar información</h2>
            <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">{getFullName(player)} — solo súper admin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <form action={formAction} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-jaguar-ink/15 bg-jaguar-mist/50 transition-colors hover:border-jaguar-green-500/40"
            >
              {photoPreview ? (
                <Image src={photoPreview} alt="Vista previa" fill className="object-cover" unoptimized />
              ) : (
                <User className="h-7 w-7 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-jaguar-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" strokeWidth={1.8} aria-hidden />
              </span>
            </button>
            <div>
              <p className={labelClass}>Foto del jugador</p>
              <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/45">Sube una nueva para reemplazar la actual.</p>
              {photoError ? <p className="mt-1 text-[12px] lg:text-[13px] font-medium text-jaguar-maroon-600">{photoError}</p> : null}
              <input
                ref={photoInputRef}
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPhotoChange}
                className="hidden"
              />
            </div>
          </div>

          <p className="mt-6 text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Personal</p>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombres *">
                <input name="first_name" defaultValue={player.first_name} className={inputClass} />
              </Field>
              <Field label="Apellidos *">
                <input name="last_name" defaultValue={player.last_name} className={inputClass} />
              </Field>
            </div>
            <Field label="Apodo">
              <input name="nickname" defaultValue={player.nickname ?? ""} placeholder="Ej. Cucho, Tornado, Pipa…" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de documento">
                <select name="document_type" defaultValue={player.document_type ?? ""} className={inputClass}>
                  <option value="">Sin definir</option>
                  <option value="Registro Civil">Registro Civil</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                </select>
              </Field>
              <Field label="Número de documento">
                <input name="document_number" defaultValue={player.document_number ?? ""} className={inputClass} />
              </Field>
            </div>
            <Field label="Fecha de nacimiento *">
              <input
                name="birth_date"
                type="date"
                value={birthDateValue}
                onChange={(e) => setBirthDateValue(e.target.value)}
                className={inputClass}
              />
            </Field>
            <LugarColombiaField name="birth_place" label="Lugar de nacimiento" defaultValue={player.birth_place} />
            <Field label="Dirección de residencia">
              <input name="address" defaultValue={player.address ?? ""} className={inputClass} />
            </Field>
            <LugarColombiaField
              name="residence_place"
              label="Lugar de residencia"
              defaultValue={player.residence_place}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Institución educativa">
                <input name="school_name" defaultValue={player.school_name ?? ""} className={inputClass} />
              </Field>
              <Field label="Grado escolar">
                <select name="school_grade" defaultValue={player.school_grade ?? ""} className={inputClass}>
                  <option value="">Sin definir</option>
                  {["6°", "7°", "8°", "9°", "10°", "11°"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <p className="mt-6 text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Deportivo</p>
          <div className="mt-3 space-y-4">
            <Field label="Categoría *">
              <select
                name="category"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value as Category)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {ageWarning ? (
                <p className="mt-1.5 text-[12px] lg:text-[13px] font-medium text-jaguar-gold-600">{ageWarning}</p>
              ) : null}
            </Field>
            <Field label="Posición *">
              <select name="position" defaultValue={player.position} className={inputClass}>
                {positionOptions.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pie hábil">
                <select name="dominant_foot" defaultValue={player.dominant_foot ?? ""} className={inputClass}>
                  <option value="">Sin definir</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Izquierdo">Izquierdo</option>
                  <option value="Ambidiestro">Ambidiestro</option>
                </select>
              </Field>
              <Field label="Número de camiseta">
                <input
                  name="jersey_number"
                  type="number"
                  min="1"
                  max="99"
                  defaultValue={player.jersey_number ?? ""}
                  onChange={(e) => setJerseyValue(e.target.value)}
                  className={`${inputClass} ${isJerseyTaken ? "border-jaguar-maroon-500/50 bg-jaguar-maroon-500/5" : ""}`}
                />
                {jerseyNumber !== null ? (
                  isJerseyTaken ? (
                    <p className="mt-1.5 text-[12px] lg:text-[13px] font-medium text-jaguar-maroon-600">
                      El número {jerseyNumber} ya está asignado a otro jugador de Sub-15.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[12px] lg:text-[13px] font-medium text-jaguar-green-600">
                      Número {jerseyNumber} disponible.
                    </p>
                  )
                ) : null}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Altura (cm)">
                <input
                  name="height_cm"
                  type="number"
                  min="100"
                  max="220"
                  defaultValue={player.height_cm ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Peso (kg)">
                <input
                  name="weight_kg"
                  type="number"
                  min="30"
                  max="120"
                  defaultValue={player.weight_kg ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Club anterior">
                <input name="previous_club" defaultValue={player.previous_club ?? ""} className={inputClass} />
              </Field>
              <Field label="Años jugando fútbol">
                <input
                  name="years_playing"
                  type="number"
                  min="0"
                  max="15"
                  defaultValue={player.years_playing ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Rating (0-5)">
                <input
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  defaultValue={player.rating ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Estado">
                <select name="status" defaultValue={player.status} className={inputClass}>
                  <option value="Disponible">Disponible</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Lesionado">Lesionado</option>
                </select>
              </Field>
              <Field label="Documentación">
                <select name="documents_status" defaultValue={player.documents_status} className={inputClass}>
                  <option value="Completo">Completo</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </Field>
            </div>
          </div>

          <p className="mt-6 text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">
            Acudiente y emergencia
          </p>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre del acudiente">
                <input name="guardian_name" defaultValue={player.guardian_name ?? ""} className={inputClass} />
              </Field>
              <Field label="Parentesco">
                <select name="guardian_relationship" defaultValue={player.guardian_relationship ?? ""} className={inputClass}>
                  <option value="">Sin definir</option>
                  <option value="Madre">Madre</option>
                  <option value="Padre">Padre</option>
                  <option value="Tutor legal">Tutor legal</option>
                  <option value="Abuelo(a)">Abuelo(a)</option>
                  <option value="Otro">Otro</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono de contacto del jugador">
                <input name="phone" type="tel" defaultValue={player.phone ?? ""} className={inputClass} />
              </Field>
              <Field label="Teléfono del acudiente">
                <input name="guardian_phone" type="tel" defaultValue={player.guardian_phone ?? ""} className={inputClass} />
              </Field>
            </div>
            <Field label="Correo del acudiente">
              <input name="guardian_email" type="email" defaultValue={player.guardian_email ?? ""} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contacto de emergencia">
                <input
                  name="emergency_contact_name"
                  defaultValue={player.emergency_contact_name ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Teléfono de emergencia">
                <input
                  name="emergency_contact_phone"
                  type="tel"
                  defaultValue={player.emergency_contact_phone ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <p className="mt-6 text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">
            Salud y autorizaciones
          </p>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="EPS">
                <input name="eps_name" defaultValue={player.eps_name ?? ""} className={inputClass} />
              </Field>
              <Field label="Tipo de sangre">
                <select name="blood_type" defaultValue={player.blood_type ?? ""} className={inputClass}>
                  <option value="">Sin definir</option>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Alergias">
              <input name="allergies" defaultValue={player.allergies ?? ""} className={inputClass} />
            </Field>
            <Field label="Condiciones médicas relevantes">
              <textarea name="medical_conditions" rows={2} defaultValue={player.medical_conditions ?? ""} className={inputClass} />
            </Field>
            <div className="space-y-2 rounded-xl bg-jaguar-mist/50 p-3.5">
              <label className="flex items-start gap-2.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/75">
                <input
                  name="medical_authorization"
                  type="checkbox"
                  value="true"
                  defaultChecked={player.medical_authorization}
                  className="mt-0.5 h-4 w-4 rounded border-jaguar-ink/20 text-jaguar-green-600 focus:ring-jaguar-green-500/30"
                />
                El acudiente autoriza atención médica de emergencia para el jugador.
              </label>
              <label className="flex items-start gap-2.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/75">
                <input
                  name="image_authorization"
                  type="checkbox"
                  value="true"
                  defaultChecked={player.image_authorization}
                  className="mt-0.5 h-4 w-4 rounded border-jaguar-ink/20 text-jaguar-green-600 focus:ring-jaguar-green-500/30"
                />
                El acudiente autoriza el uso de la imagen del jugador (fotos/videos institucionales).
              </label>
            </div>
          </div>

          {state.error ? (
            <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
              {state.error}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-jaguar-ink/6 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isJerseyTaken}
              className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
              {isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
