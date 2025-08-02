import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ToeicQuestion {
  id?: string;
  questionNumber: number;
  level: string;
  type: string;
  part: 'part1' | 'part2' | 'part3';
  imageDescription?: string;
  subjectVocabulary?: any[];
  descriptiveVocabulary?: any[];
  question?: string;
  conversation?: any;
  questions?: any[];
  choices: any;
  choicesVi: any;
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
  explanations?: string[];
  traps?: string;
  image?: string;
  audio: string;
  createdAt?: string;
  updatedAt?: string;
}

export const toeicService = {
  // Lấy tất cả câu hỏi TOEIC
  async getAllQuestions(limitCount: number = 1000): Promise<ToeicQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_questions'),
        orderBy('questionNumber'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: ToeicQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as ToeicQuestion);
      });
      
      return questions;
    } catch (error) {
      console.error('Error fetching TOEIC questions:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo part
  async getQuestionsByPart(part: 'part1' | 'part2' | 'part3', limitCount: number = 500): Promise<ToeicQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_questions'),
        where('part', '==', part),
        orderBy('questionNumber'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: ToeicQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as ToeicQuestion);
      });
      
      return questions;
    } catch (error) {
      console.error(`Error fetching TOEIC ${part} questions:`, error);
      throw error;
    }
  },

  // Lấy câu hỏi theo level
  async getQuestionsByLevel(level: string, limitCount: number = 500): Promise<ToeicQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_questions'),
        where('level', '==', level),
        orderBy('questionNumber'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: ToeicQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as ToeicQuestion);
      });
      
      return questions;
    } catch (error) {
      console.error(`Error fetching TOEIC questions by level ${level}:`, error);
      throw error;
    }
  },

  // Lấy câu hỏi theo part và level
  async getQuestionsByPartAndLevel(part: 'part1' | 'part2' | 'part3', level: string, limitCount: number = 500): Promise<ToeicQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_questions'),
        where('part', '==', part),
        where('level', '==', level),
        orderBy('questionNumber'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: ToeicQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as ToeicQuestion);
      });
      
      return questions;
    } catch (error) {
      console.error(`Error fetching TOEIC ${part} questions by level ${level}:`, error);
      throw error;
    }
  },

  // Lấy câu hỏi theo type
  async getQuestionsByType(type: string, limitCount: number = 500): Promise<ToeicQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'toeic_questions'),
        where('type', '==', type),
        orderBy('questionNumber'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: ToeicQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as ToeicQuestion);
      });
      
      return questions;
    } catch (error) {
      console.error(`Error fetching TOEIC questions by type ${type}:`, error);
      throw error;
    }
  }
}; 