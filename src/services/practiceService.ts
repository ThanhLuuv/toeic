import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Cloudinary configuration
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/deroljhou/auto/upload';
const CLOUDINARY_UPLOAD_PRESET = 'part1_test'; // Preset từ ảnh bạn gửi
const CLOUDINARY_FOLDER = 'ai_practice_questions';

export interface PracticeQuestion {
  questionNumber: number;
  level: string;
  type: string;
  imageDescription: string;
  image: string; // base64
  audio: string; // base64
  mcqSteps: {
    stepNumber: number;
    options: {
      value: string;
      text: string;
      pronunciation: string;
      meaning: string;
      isCorrect: boolean;
    }[];
  }[];
  audioQuestion: {
    choices: { [key: string]: { english: string; vietnamese: string } };
    correctAnswer: string;
    traps: string;
  };
}

export interface PracticeData {
  originalQuestionIndex: number;
  originalQuestion: any;
  analysis: {
    mainError: string;
    reasons: string[];
    solutions: string[];
  };
  practiceQuestion: PracticeQuestion;
  createdAt: any;
}

export const practiceService = {
  // Upload file lên Cloudinary
  async uploadToCloudinary(base64Data: string, fileName: string, resourceType: 'image' | 'video'): Promise<string> {
    try {
      console.log('Cloudinary upload started for:', fileName);
      
      // Kiểm tra base64 data
      if (!base64Data || !base64Data.includes(',')) {
        throw new Error('Invalid base64 data format');
      }
      
      // Convert base64 to blob
      const base64 = base64Data.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileExtension = resourceType === 'image' ? 'png' : 'mp3';
      const mimeType = resourceType === 'image' ? 'image/png' : 'audio/mp3';
      const blob = new Blob([byteArray], { type: mimeType });
      
      const formData = new FormData();
      formData.append('file', blob, `${fileName}.${fileExtension}`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', CLOUDINARY_FOLDER);
      formData.append('resource_type', resourceType);
      
      console.log('Sending request to Cloudinary...');
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log('Cloudinary response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Cloudinary upload successful:', result.secure_url);
      return result.secure_url;
    } catch (error) {
      throw error;
    }
  },

  async savePracticeToFirebase(practiceData: PracticeData): Promise<string> {
    try {
      // Kiểm tra dữ liệu trước khi upload
      if (!practiceData.practiceQuestion.image || !practiceData.practiceQuestion.audio) {
        throw new Error('Missing image or audio data');
      }
      
      // Upload ảnh và audio lên Cloudinary trước
      const timestamp = Date.now();
      const imageFileName = `practice_img_${timestamp}`;
      const audioFileName = `practice_audio_${timestamp}`;
      
      const [imageUrl, audioUrl] = await Promise.all([
        this.uploadToCloudinary(practiceData.practiceQuestion.image, imageFileName, 'image'),
        this.uploadToCloudinary(practiceData.practiceQuestion.audio, audioFileName, 'video')
      ]);
      
      // Tạo cấu trúc dữ liệu theo format toeic_part1.json với Cloudinary URLs
      const practiceQuestionData = {
        questionNumber: practiceData.practiceQuestion.questionNumber,
        level: practiceData.practiceQuestion.level,
        type: practiceData.practiceQuestion.type,
        imageDescription: practiceData.practiceQuestion.imageDescription,
        image: imageUrl, // Cloudinary URL thay vì base64
        audio: audioUrl, // Cloudinary URL thay vì base64
        mcqSteps: practiceData.practiceQuestion.mcqSteps,
        audioQuestion: practiceData.practiceQuestion.audioQuestion,
        // Thêm metadata
        originalQuestionIndex: practiceData.originalQuestionIndex,
        createdAt: serverTimestamp(),
        status: 'active',
        source: 'ai_generated'
      };
      
      const docRef = await addDoc(collection(db, 'ai_practice_questions'), practiceQuestionData);
      
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  async savePracticeToUserCollection(userId: string, practiceData: PracticeData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/practice_questions`), {
        ...practiceData,
        createdAt: serverTimestamp(),
        status: 'active',
        source: 'ai_generated'
      });
      
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }
};

// Hàm lấy câu hỏi mới nhất từ database
export async function getLatestQuestion(): Promise<string | null> {
  try {
    const q = query(
      collection(db, 'ai_practice_questions'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0];
      const data = latestDoc.data();
      return data.correctAnswer || null;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy câu hỏi mới nhất:', error);
    return null;
  }
}

// Hàm lấy phân bố đáp án trong database
export async function getAnswerDistribution(): Promise<{A: number, B: number, C: number, D: number}> {
  try {
    const q = query(
      collection(db, 'ai_practice_questions'),
      orderBy('createdAt', 'desc'),
      limit(50) // Lấy 50 câu gần nhất
    );
    
    const querySnapshot = await getDocs(q);
    const distribution = { A: 0, B: 0, C: 0, D: 0 };
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const answer = data.correctAnswer;
      if (answer && distribution.hasOwnProperty(answer)) {
        distribution[answer as keyof typeof distribution]++;
      }
    });
    
    return distribution;
  } catch (error) {
    console.error('Lỗi khi lấy phân bố đáp án:', error);
    return { A: 0, B: 0, C: 0, D: 0 };
  }
} 