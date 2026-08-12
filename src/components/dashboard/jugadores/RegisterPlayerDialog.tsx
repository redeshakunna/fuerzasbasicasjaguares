"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, ChevronLeft, ChevronRight, Loader2, Plus, User, X } from "lucide-react";
import { registerPlayer, type RegisterPlayerState } from "@/app/plataforma/(dashboard)/jugadores/actions";
import { positionOptions } from "@/lib/data/positions";
import { categories, defaultCategory, getCategoryAgeWarning, type Category } from "@/lib/data/categories";
import { Field, inputClass, labelClass } from "./FormField";
import { LugarColombiaField } from "./LugarNacimientoField";
import { useTakenJerseyNumbers } from "./useTakenJerseyNumbers";

const initialState: RegisterPlayerState = {};
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const steps = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Acudiente" },
  { id: 3, label: "Deportivo" },
  { id: 4, label: "Salud" },
] as const;

/** Botón "Registrar jugador" + modal con la hoja de vida deportiva completa, en 4 pasos. */
export function RegisterPlayerDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(registerPlayer, initialState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [jerseyValue, setJerseyValue] = useState("");
  const [birthDateValue, setBirthDateValue] = useState("");
  const [categoryValue, setCategoryValue] = useState<Category>(defaultCategory);
  const formRef = useRef<HTMLFormElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLSelectElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const takenJerseyNumbers = useTakenJerseyNumbers(open);
  const jerseyNumber = jerseyValue ? Number(jerseyValue) : null;
  const isJerseyTaken = jerseyNumber !== null && takenJerseyNumbers.has(jerseyNumber);
  const ageWarning = getCategoryAgeWarning(birthDateValue, categoryValue);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setStep(1);
      setOpen(false);
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setJerseyValue("");
      setBirthDateValue("");
      setCategoryValue(defaultCategory);
    }
  }, [state.success]);

  function close() {
    setOpen(false);
    setStep(1);
    setStepError(null);
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PHOTO_BYTES) {
      setStepError("La foto pesa más de 8 MB. Usa una imagen más liviana.");
      e.target.value = "";
      return;
    }
    setStepError(null);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function goNext() {
    setStepError(null);
    if (step === 1) {
      if (!firstNameRef.current?.value.trim() || !lastNameRef.current?.value.trim() || !birthDateRef.current?.value) {
        setStepError("Nombres, apellidos y fecha de nacimiento son obligatorios.");
        return;
      }
    }
    if (step === 3) {
      if (!positionRef.current?.value) {
        setStepError("Selecciona la posición del jugador.");
        return;
      }
      if (isJerseyTaken) {
        setStepError(`El número ${jerseyNumber} ya está asignado a otro jugador de Sub-15.`);
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(13,18,16,0.08)] transition-colors hover:bg-jaguar-green-700"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        Registrar jugador
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-[18px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Registrar jugador</h2>
                <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">
                  Hoja de vida deportiva — Categoría Sub-15
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>

            {/* Indicador de pasos */}
            <div className="mt-5 flex items-center gap-2 px-6">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] lg:text-[13px] font-bold transition-colors ${
                      step > s.id
                        ? "bg-jaguar-green-600 text-white"
                        : step === s.id
                          ? "bg-jaguar-green-600 text-white"
                          : "bg-jaguar-ink/8 text-jaguar-ink/40"
                    }`}
                  >
                    {step > s.id ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                  </div>
                  <span
                    className={`hidden text-[11.5px] lg:text-[12.5px] font-semibold sm:block ${
                      step >= s.id ? "text-jaguar-ink" : "text-jaguar-ink/35"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 ? (
                    <div className={`h-px flex-1 ${step > s.id ? "bg-jaguar-green-600" : "bg-jaguar-ink/10"}`} />
                  ) : null}
                </div>
              ))}
            </div>

            <form ref={formRef} action={formAction} className="mt-5 flex-1 overflow-y-auto px-6 pb-2">
              {/* Paso 1 — Datos personales */}
              <div className={step === 1 ? "space-y-4" : "hidden"}>
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
                    <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/45">JPG o PNG, opcional.</p>
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
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombres *">
                    <input ref={firstNameRef} name="first_name" placeholder="Ej. Juan Fernando" className={inputClass} />
                  </Field>
                  <Field label="Apellidos *">
                    <input ref={lastNameRef} name="last_name" placeholder="Ej. Pérez Gómez" className={inputClass} />
                  </Field>
                </div>
                <Field label="Apodo">
                  <input name="nickname" placeholder="Ej. Cucho, Tornado, Pipa…" className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo de documento">
                    <select name="document_type" defaultValue="" className={inputClass}>
                      <option value="">Sin definir</option>
                      <option value="Registro Civil">Registro Civil</option>
                      <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                      <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                    </select>
                  </Field>
                  <Field label="Número de documento">
                    <input name="document_number" placeholder="Ej. 1004567890" className={inputClass} />
                  </Field>
                </div>
                <Field label="Fecha de nacimiento *">
                  <input
                    ref={birthDateRef}
                    name="birth_date"
                    type="date"
                    onChange={(e) => setBirthDateValue(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <LugarColombiaField name="birth_place" label="Lugar de nacimiento" />
                <Field label="Dirección de residencia">
                  <input name="address" placeholder="Barrio, calle…" className={inputClass} />
                </Field>
                <LugarColombiaField name="residence_place" label="Lugar de residencia" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Institución educativa">
                    <input name="school_name" placeholder="Ej. I.E. San José" className={inputClass} />
                  </Field>
                  <Field label="Grado escolar">
                    <select name="school_grade" defaultValue="" className={inputClass}>
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

              {/* Paso 2 — Acudiente y emergencia */}
              <div className={step === 2 ? "space-y-4" : "hidden"}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre del acudiente">
                    <input name="guardian_name" placeholder="Ej. María Pérez" className={inputClass} />
                  </Field>
                  <Field label="Parentesco">
                    <select name="guardian_relationship" defaultValue="" className={inputClass}>
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
                    <input name="phone" type="tel" placeholder="Ej. 300 111 2233" className={inputClass} />
                  </Field>
                  <Field label="Teléfono del acudiente">
                    <input name="guardian_phone" type="tel" placeholder="Ej. 300 123 4567" className={inputClass} />
                  </Field>
                </div>
                <Field label="Correo del acudiente">
                  <input name="guardian_email" type="email" placeholder="correo@ejemplo.com" className={inputClass} />
                </Field>
                <div className="rounded-xl border border-dashed border-jaguar-ink/12 p-3.5">
                  <p className="text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">
                    Contacto de emergencia alterno
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Nombre">
                      <input name="emergency_contact_name" placeholder="Si es distinto al acudiente" className={inputClass} />
                    </Field>
                    <Field label="Teléfono">
                      <input name="emergency_contact_phone" type="tel" placeholder="Ej. 300 987 6543" className={inputClass} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Paso 3 — Datos deportivos */}
              <div className={step === 3 ? "space-y-4" : "hidden"}>
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
                  <select ref={positionRef} name="position" defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Selecciona una posición
                    </option>
                    {positionOptions.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pie hábil">
                    <select name="dominant_foot" defaultValue="" className={inputClass}>
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
                      placeholder="Ej. 10"
                      defaultValue={jerseyValue}
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
                    <input name="height_cm" type="number" min="100" max="220" placeholder="171" className={inputClass} />
                  </Field>
                  <Field label="Peso (kg)">
                    <input name="weight_kg" type="number" min="30" max="120" placeholder="61" className={inputClass} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Club anterior">
                    <input name="previous_club" placeholder="Si jugó en otro club" className={inputClass} />
                  </Field>
                  <Field label="Años jugando fútbol">
                    <input name="years_playing" type="number" min="0" max="15" placeholder="Ej. 4" className={inputClass} />
                  </Field>
                </div>
              </div>

              {/* Paso 4 — Salud y autorizaciones */}
              <div className={step === 4 ? "space-y-4" : "hidden"}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="EPS">
                    <input name="eps_name" placeholder="Ej. Nueva EPS" className={inputClass} />
                  </Field>
                  <Field label="Tipo de sangre">
                    <select name="blood_type" defaultValue="" className={inputClass}>
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
                  <input name="allergies" placeholder="Ej. Penicilina, ninguna…" className={inputClass} />
                </Field>
                <Field label="Condiciones médicas relevantes">
                  <textarea
                    name="medical_conditions"
                    rows={2}
                    placeholder="Asma, lesiones previas, tratamientos en curso…"
                    className={inputClass}
                  />
                </Field>

                <div className="space-y-2 rounded-xl bg-jaguar-mist/50 p-3.5">
                  <label className="flex items-start gap-2.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/75">
                    <input
                      name="medical_authorization"
                      type="checkbox"
                      value="true"
                      className="mt-0.5 h-4 w-4 rounded border-jaguar-ink/20 text-jaguar-green-600 focus:ring-jaguar-green-500/30"
                    />
                    El acudiente autoriza atención médica de emergencia para el jugador.
                  </label>
                  <label className="flex items-start gap-2.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/75">
                    <input
                      name="image_authorization"
                      type="checkbox"
                      value="true"
                      className="mt-0.5 h-4 w-4 rounded border-jaguar-ink/20 text-jaguar-green-600 focus:ring-jaguar-green-500/30"
                    />
                    El acudiente autoriza el uso de la imagen del jugador (fotos/videos institucionales).
                  </label>
                </div>
              </div>

              {stepError ? (
                <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
                  {stepError}
                </p>
              ) : null}
              {state.error ? (
                <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
                  {state.error}
                </p>
              ) : null}

              <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between border-t border-jaguar-ink/6 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={step === 1 ? close : goBack}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
                >
                  {step === 1 ? null : <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />}
                  {step === 1 ? "Cancelar" : "Atrás"}
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
                    {isPending ? "Guardando…" : "Registrar jugador"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
