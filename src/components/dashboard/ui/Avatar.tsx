import Image from "next/image";

/** Avatar — foto real del jugador/usuario si existe, o silueta genérica por defecto. */
export function Avatar({
  initials,
  size = 40,
  photoUrl,
}: {
  initials: string;
  size?: number;
  photoUrl?: string | null;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className="relative block shrink-0 overflow-hidden rounded-full bg-jaguar-mist ring-1 ring-jaguar-ink/8"
      title={initials}
    >
      <Image src={photoUrl || "/brand/default-avatar.png"} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
