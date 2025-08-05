import { collection, addDoc, getDocs, query, orderBy, where, doc, setDoc, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ImagePractice {
  id?: string;
  imageUrl: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  choicesVi: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  type: string;
  userQuestion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const imagePracticeService = {
  // Thêm bài tập mới từ ảnh
  async addImagePractice(practice: Omit<ImagePractice, 'id'>): Promise<string> {
    try {
      const practiceWithTimestamp = {
        ...practice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'imagePractice'), practiceWithTimestamp);
      console.log('Image practice added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding image practice:', error);
      throw error;
    }
  },

  // Lấy tất cả bài tập từ ảnh
  async getAllImagePractice(limitCount: number = 100): Promise<ImagePractice[]> {
    try {
      const practiceQuery = query(
        collection(db, 'imagePractice'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(practiceQuery);
      
      const practices: ImagePractice[] = [];
      querySnapshot.forEach((doc) => {
        practices.push({ id: doc.id, ...doc.data() } as ImagePractice);
      });
      
      return practices;
    } catch (error) {
      console.error('Error fetching image practice:', error);
      throw error;
    }
  },

  // Lấy bài tập theo level
  async getImagePracticeByLevel(level: number, limitCount: number = 50): Promise<ImagePractice[]> {
    try {
      const practiceQuery = query(
        collection(db, 'imagePractice'),
        where('level', '==', level),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(practiceQuery);
      
      const practices: ImagePractice[] = [];
      querySnapshot.forEach((doc) => {
        practices.push({ id: doc.id, ...doc.data() } as ImagePractice);
      });
      
      return practices;
    } catch (error) {
      console.error('Error fetching image practice by level:', error);
      throw error;
    }
  },

  // Lấy bài tập theo topic
  async getImagePracticeByTopic(topic: string, limitCount: number = 50): Promise<ImagePractice[]> {
    try {
      const practiceQuery = query(
        collection(db, 'imagePractice'),
        where('topic', '==', topic),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(practiceQuery);
      
      const practices: ImagePractice[] = [];
      querySnapshot.forEach((doc) => {
        practices.push({ id: doc.id, ...doc.data() } as ImagePractice);
      });
      
      return practices;
    } catch (error) {
      console.error('Error fetching image practice by topic:', error);
      throw error;
    }
  },

  // Tìm kiếm bài tập theo từ khóa
  async searchImagePractice(keyword: string, limitCount: number = 20): Promise<ImagePractice[]> {
    try {
      const practiceQuery = query(collection(db, 'imagePractice'));
      const querySnapshot = await getDocs(practiceQuery);
      
      const practices: ImagePractice[] = [];
      const lowerKeyword = keyword.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const practice = { id: doc.id, ...doc.data() } as ImagePractice;
        if (practice.question.toLowerCase().includes(lowerKeyword) || 
            practice.explanation.toLowerCase().includes(lowerKeyword) ||
            practice.type?.toLowerCase().includes(lowerKeyword)) {
          practices.push(practice);
        }
      });
      
      return practices.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching image practice:', error);
      throw error;
    }
  },

  // Cập nhật bài tập
  async updateImagePractice(id: string, practice: Partial<ImagePractice>): Promise<void> {
    try {
      const practiceWithTimestamp = {
        ...practice,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'imagePractice', id), practiceWithTimestamp, { merge: true });
      console.log('Image practice updated:', id);
    } catch (error) {
      console.error('Error updating image practice:', error);
      throw error;
    }
  },

  // Lấy số lượng bài tập
  async getImagePracticeCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, 'imagePractice'));
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting image practice count:', error);
      throw error;
    }
  }
}; 