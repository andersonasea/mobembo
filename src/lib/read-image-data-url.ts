export const MAX_IMAGE_BYTES = 350_000;

export async function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Veuillez choisir une image (JPEG, PNG ou WebP)");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image trop volumineuse (max 350 Ko)");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Impossible de lire l'image"));
    };
    reader.onerror = () => reject(new Error("Impossible de lire l'image"));
    reader.readAsDataURL(file);
  });
}
