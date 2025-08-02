import { collection, getDocs, query, orderBy, limit, addDoc, doc, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Vocabulary {
  id?: string;
  word: string;
  type: string;
  phonetic: string;
  meaning: string;
  audio: string;
  topic?: string; // Thêm trường chủ đề
  createdAt?: string;
  updatedAt?: string;
}

export const vocabularyService = {
  // Lấy tất cả vocabulary
  async getAllVocabulary(limitCount: number = 100): Promise<Vocabulary[]> {
    try {
      const vocabQuery = query(
        collection(db, 'vocabulary'),
        orderBy('word'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(vocabQuery);
      
      const vocabulary: Vocabulary[] = [];
      querySnapshot.forEach((doc) => {
        vocabulary.push({ id: doc.id, ...doc.data() } as Vocabulary);
      });
      
      return vocabulary;
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  },

  // Lấy vocabulary theo type
  async getVocabularyByType(type: string, limitCount: number = 50): Promise<Vocabulary[]> {
    try {
      const vocabQuery = query(
        collection(db, 'vocabulary'),
        where('type', '==', type),
        orderBy('word'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(vocabQuery);
      
      const vocabulary: Vocabulary[] = [];
      querySnapshot.forEach((doc) => {
        vocabulary.push({ id: doc.id, ...doc.data() } as Vocabulary);
      });
      
      return vocabulary;
    } catch (error) {
      console.error('Error fetching vocabulary by type:', error);
      throw error;
    }
  },

  // Lấy vocabulary theo chủ đề
  async getVocabularyByTopic(topic: string, limitCount: number = 50): Promise<Vocabulary[]> {
    try {
      const vocabQuery = query(
        collection(db, 'vocabulary'),
        where('topic', '==', topic),
        orderBy('word'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(vocabQuery);
      
      const vocabulary: Vocabulary[] = [];
      querySnapshot.forEach((doc) => {
        vocabulary.push({ id: doc.id, ...doc.data() } as Vocabulary);
      });
      
      return vocabulary;
    } catch (error) {
      console.error('Error fetching vocabulary by topic:', error);
      throw error;
    }
  },

  // Lấy tất cả chủ đề có sẵn
  async getAllTopics(): Promise<string[]> {
    try {
      const vocabQuery = query(collection(db, 'vocabulary'));
      const querySnapshot = await getDocs(vocabQuery);
      
      const topics = new Set<string>();
      querySnapshot.forEach((doc) => {
        const vocab = doc.data() as Vocabulary;
        if (vocab.topic) {
          topics.add(vocab.topic);
        }
      });
      
      return Array.from(topics).sort();
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Tìm kiếm vocabulary theo từ khóa
  async searchVocabulary(keyword: string, limitCount: number = 20): Promise<Vocabulary[]> {
    try {
      // Lấy tất cả vocabulary và filter theo keyword
      const vocabQuery = query(collection(db, 'vocabulary'));
      const querySnapshot = await getDocs(vocabQuery);
      
      const vocabulary: Vocabulary[] = [];
      const lowerKeyword = keyword.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const vocab = { id: doc.id, ...doc.data() } as Vocabulary;
        if (vocab.word.toLowerCase().includes(lowerKeyword) || 
            vocab.meaning.toLowerCase().includes(lowerKeyword)) {
          vocabulary.push(vocab);
        }
      });
      
      // Sắp xếp theo từ khóa và giới hạn số lượng
      vocabulary.sort((a, b) => {
        const aStartsWithKeyword = a.word.toLowerCase().startsWith(lowerKeyword);
        const bStartsWithKeyword = b.word.toLowerCase().startsWith(lowerKeyword);
        
        if (aStartsWithKeyword && !bStartsWithKeyword) return -1;
        if (!aStartsWithKeyword && bStartsWithKeyword) return 1;
        return a.word.localeCompare(b.word);
      });
      
      return vocabulary.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching vocabulary:', error);
      throw error;
    }
  },

  // Thêm vocabulary mới
  async addVocabulary(vocab: Omit<Vocabulary, 'id'>): Promise<string> {
    try {
      const vocabWithTimestamp = {
        ...vocab,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'vocabulary'), vocabWithTimestamp);
      console.log('Vocabulary added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      throw error;
    }
  },

  // Thêm nhiều vocabulary cùng lúc
  async addMultipleVocabulary(vocabularyList: Omit<Vocabulary, 'id'>[]): Promise<string[]> {
    try {
      const promises = vocabularyList.map(vocab => this.addVocabulary(vocab));
      const ids = await Promise.all(promises);
      console.log('Multiple vocabulary added:', ids.length);
      return ids;
    } catch (error) {
      console.error('Error adding multiple vocabulary:', error);
      throw error;
    }
  },

  // Cập nhật vocabulary
  async updateVocabulary(id: string, vocab: Partial<Vocabulary>): Promise<void> {
    try {
      const vocabWithTimestamp = {
        ...vocab,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'vocabulary', id), vocabWithTimestamp, { merge: true });
      console.log('Vocabulary updated:', id);
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  },

  // Lấy số lượng vocabulary
  async getVocabularyCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, 'vocabulary'));
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting vocabulary count:', error);
      throw error;
    }
  },

  // Lấy vocabulary theo batch (cho pagination)
  async getVocabularyBatch(offset: number = 0, limitCount: number = 20): Promise<Vocabulary[]> {
    try {
      const vocabQuery = query(
        collection(db, 'vocabulary'),
        orderBy('word'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(vocabQuery);
      
      const vocabulary: Vocabulary[] = [];
      querySnapshot.forEach((doc) => {
        vocabulary.push({ id: doc.id, ...doc.data() } as Vocabulary);
      });
      
      // Simulate offset (Firestore doesn't support offset directly)
      return vocabulary.slice(offset, offset + limitCount);
    } catch (error) {
      console.error('Error fetching vocabulary batch:', error);
      throw error;
    }
  }
}; 