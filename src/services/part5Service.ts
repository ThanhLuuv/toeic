import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface Part5Question {
  id: string;
  questionNumber: number;
  type: string;
  level?: string;
  question: string;
  choices: {
    A: {
      english: string;
      vietnamese: string;
    };
    B: {
      english: string;
      vietnamese: string;
    };
    C: {
      english: string;
      vietnamese: string;
    };
    D: {
      english: string;
      vietnamese: string;
    };
  };
  correctAnswer: string;
  explanation: string;
  part: string;
}

export const part5Service = {
  // Lấy tất cả câu hỏi Part 5 từ Firebase
  async getAllQuestions(): Promise<Part5Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_part5_questions'),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part5Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part5Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 5 questions:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo loại (vocabulary, grammar)
  async getQuestionsByType(type: string): Promise<Part5Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_part5_questions'),
        where('type', '==', type),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part5Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part5Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 5 questions by type:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo level
  async getQuestionsByLevel(level: string): Promise<Part5Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_part5_questions'),
        where('level', '==', level),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part5Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part5Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 5 questions by level:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo loại và level
  async getQuestionsByTypeAndLevel(type: string, level: string): Promise<Part5Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_part5_questions'),
        where('type', '==', type),
        where('level', '==', level),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part5Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part5Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 5 questions by type and level:', error);
      throw error;
    }
  }
}; 