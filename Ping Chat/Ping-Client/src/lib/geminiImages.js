const geminiImages = new Map();

export const saveGeminiImage = (id, file) => {
  geminiImages.set(id, file);
};

export const getGeminiImage = (id) => {
  return geminiImages.get(id);
};

export const clearGeminiImages = () => {
  geminiImages.clear();
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image!"));
    };

    reader.readAsDataURL(file);
  });
};
