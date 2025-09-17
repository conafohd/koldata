
export async function resizeImage(file: File, size: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Compute aspect ratio
        const aspectRatio = img.width / img.height;

        let targetWidth: number;
        let targetHeight: number;

        if (img.width > img.height) {
          targetWidth = size;
          targetHeight = Math.round(size / aspectRatio);
        } else {
          targetHeight = size;
          targetWidth = Math.round(size * aspectRatio);
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get canvas context"));

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas is empty"));
          const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
          resolve(resizedFile);
        }, "image/jpeg");
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}