/**
 * Compresses an image file on the client side using HTML5 Canvas.
 * Clamps maximum dimensions and applies JPEG compression to minimize database footprint.
 * 
 * @param {File} file - The file uploaded by the user.
 * @param {number} maxDimension - Maximum width or height of the compressed image.
 * @param {number} quality - Compression quality between 0.0 and 1.0.
 * @returns {Promise<string>} - Resolves to the compressed base64 data URL.
 */
export function compressImage(file, maxDimension = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('O arquivo fornecido não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and clamp to maxDimension
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to compressed JPEG format base64
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = event.target.result;
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}
