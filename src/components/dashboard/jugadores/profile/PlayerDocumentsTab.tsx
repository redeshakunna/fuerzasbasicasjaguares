"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, FileImage, ExternalLink, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import {
  deletePlayerDocument,
  uploadPlayerDocument,
  type DocumentActionState,
} from "@/app/plataforma/(dashboard)/jugadores/document-actions";
import type { PlayerDocumentWithUrl } from "@/lib/data/player-documents";

// No puede vivir en document-actions.ts: un archivo "use server" solo puede exportar funciones async.
const documentCategories = ["Consentimiento", "Certificado médico", "Documento de identidad", "Otro"] as const;

const initialState: DocumentActionState = {};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentRow({ doc, isAdmin, playerId }: { doc: PlayerDocumentWithUrl; isAdmin: boolean; playerId: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();
  const isPdf = doc.file_type === "application/pdf";
  const Icon = isPdf ? FileText : FileImage;

  function handleDelete() {
    startTransition(async () => {
      await deletePlayerDocument(doc.id, doc.file_path, playerId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-jaguar-ink/8 px-3.5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jaguar-mist text-jaguar-ink/45">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{doc.file_name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{doc.category}</Badge>
          <span className="text-[11px] lg:text-[12px] text-jaguar-ink/40">
            {formatDate(doc.created_at)}
            {doc.size_bytes ? ` · ${formatSize(doc.size_bytes)}` : ""}
          </span>
        </div>
      </div>

      {doc.signedUrl ? (
        <a
          href={doc.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/70 hover:text-jaguar-green-600"
          aria-label="Ver documento"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
        </a>
      ) : null}

      {isAdmin ? (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setConfirmOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-jaguar-ink/35 hover:bg-jaguar-maroon-500/8 hover:text-jaguar-maroon-600"
            aria-label="Eliminar documento"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          {confirmOpen ? (
            <div className="absolute right-0 top-full z-10 mt-2 w-[240px] rounded-2xl border border-jaguar-ink/10 bg-white p-3.5 shadow-xl">
              <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">¿Eliminar este documento?</p>
              <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">No se puede deshacer.</p>
              <div className="mt-2.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg px-2.5 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-jaguar-maroon-600 px-2.5 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
                >
                  {isDeleting ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Pestaña Documentos del perfil — sube y consulta PDFs/imágenes de la hoja de vida del jugador. */
export function PlayerDocumentsTab({
  playerId,
  documents,
  isAdmin,
}: {
  playerId: string;
  documents: PlayerDocumentWithUrl[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(uploadPlayerDocument, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardHeader title="Subir documento" subtitle="PDF, JPG o PNG — máximo 10 MB." />
        <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="playerId" value={playerId} />
          <div className="sm:w-[200px]">
            <label className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">Categoría</label>
            <select
              name="category"
              defaultValue={documentCategories[0]}
              className="mt-1.5 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3 py-2.5 text-[13px] lg:text-[14px] text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none"
            >
              {documentCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">Archivo</label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-jaguar-ink/15 bg-jaguar-mist/30 px-3.5 py-2.5 text-[13px] lg:text-[14px] text-jaguar-ink/60 hover:border-jaguar-green-500/40">
              <UploadCloud className="h-4 w-4 shrink-0 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
              <span className="truncate">{fileName ?? "Elegir archivo…"}</span>
              <input
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
            {isPending ? "Subiendo…" : "Subir"}
          </button>
        </form>
        {state.error ? (
          <p className="mt-3 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
            {state.error}
          </p>
        ) : null}
      </Card>

      {documents.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <FileText className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay documentos.</p>
          <p className="max-w-md text-[13px] lg:text-[14px] text-jaguar-ink/45">
            Sube consentimientos, certificados médicos u otros documentos de este jugador.
          </p>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} isAdmin={isAdmin} playerId={playerId} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
