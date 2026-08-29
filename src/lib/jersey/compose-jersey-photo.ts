import sharp from "sharp";
import { JERSEY_TEMPLATES, type JerseyTemplateKey } from "./jersey-templates";

/**
 * Compone la foto tipo carnet de un jugador sobre la plantilla oficial de
 * camiseta (campo o portero), dejando el resultado como si el jugador
 * estuviera posando con la camiseta puesta.
 *
 * Cómo funciona (plantilla "fija", sin IA generativa):
 * 1. La plantilla es una foto real de la camiseta con una silueta de
 *    cabeza/cuello de relleno.
 * 2. La máscara (misma resolución) tiene alpha=255 exactamente en esa
 *    silueta (con difuminado en el borde) y alpha=0 en el resto.
 * 3. Recortamos la foto del jugador para llenar ese recuadro (cover-fit,
 *    centrado) y la pegamos en un lienzo base.
 * 4. "Perforamos" la plantilla restándole su propia alpha con la máscara
 *    (blend dest-out) y la pegamos encima del lienzo — así la camiseta,
 *    el fondo, el escudo y los patrocinadores quedan intactos, y solo la
 *    cabeza/cuello del jugador reemplaza la silueta gris.
 */
export async function composeJerseyPhoto(photoBuffer: Buffer, templateKey: JerseyTemplateKey): Promise<Buffer> {
  const spec = JERSEY_TEMPLATES[templateKey];
  const { canvasSize, photoBox } = spec;

  const [templateBuffer, maskBuffer] = await Promise.all([
    sharp(spec.imagePath).ensureAlpha().png().toBuffer(),
    sharp(spec.maskPath).ensureAlpha().png().toBuffer(),
  ]);

  const templateWithHole = await sharp(templateBuffer)
    .composite([{ input: maskBuffer, blend: "dest-out" }])
    .png()
    .toBuffer();

  // La plantilla solo deja libre cabeza + un poco de cuello (nada de
  // hombros ni ropa). Las fotos reales que suben los jugadores sí traen
  // hombros/camisa visibles, y si se cuela ese tramo justo donde empieza
  // el cuello de la camiseta se ve como una "prenda" superpuesta y falsa.
  // Por eso recortamos primero el tercio inferior de la foto (donde suele
  // estar la ropa) antes de encajarla en el recuadro.
  const rotatedBuffer = await sharp(photoBuffer).rotate().toBuffer();
  const sourceMeta = await sharp(rotatedBuffer).metadata();
  const sourceWidth = sourceMeta.width ?? photoBox.width;
  const sourceHeight = sourceMeta.height ?? photoBox.height;
  const keepHeight = Math.max(1, Math.round(sourceHeight * 0.66));

  const faceAndNeckOnly = await sharp(rotatedBuffer)
    .extract({ left: 0, top: 0, width: sourceWidth, height: keepHeight })
    .toBuffer();

  const croppedPhoto = await sharp(faceAndNeckOnly)
    .resize(photoBox.width, photoBox.height, { fit: "cover", position: "attention" })
    .toBuffer();

  const composed = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: croppedPhoto, left: photoBox.x, top: photoBox.y },
      { input: templateWithHole, left: 0, top: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  return composed;
}
