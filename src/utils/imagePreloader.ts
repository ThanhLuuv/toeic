/**
 * Preload một ảnh duy nhất
 * @param src URL của ảnh
 * @returns Promise resolve khi ảnh đã load xong
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve();
    };
    
    img.onerror = (error) => {
      console.warn(`Failed to preload image: ${src}`, error);
      // Vẫn resolve để không block toàn bộ flow
      resolve();
    };
    
    img.src = src;
  });
};

/**
 * Preload nhiều ảnh cùng lúc
 * @param imageUrls Mảng các URL ảnh
 * @param onProgress Callback được gọi khi mỗi ảnh load xong
 * @returns Promise resolve khi tất cả ảnh đã load xong
 */
export const preloadImages = (
  imageUrls: string[], 
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    if (imageUrls.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalCount = imageUrls.length;
    
    const checkComplete = () => {
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount, totalCount);
      }
      
      if (loadedCount === totalCount) {
        resolve();
      }
    };

    // Preload tất cả ảnh song song
    imageUrls.forEach(url => {
      preloadImage(url).then(checkComplete);
    });
  });
};

/**
 * Lấy tất cả URL ảnh từ một bài test
 * @param questions Mảng các câu hỏi
 * @returns Mảng URL ảnh
 */
export const getImageUrlsFromQuestions = (questions: any[]): string[] => {
  return questions
    .map(q => q.image)
    .filter(url => url && typeof url === 'string');
}; 