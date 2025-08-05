import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface Part1Question {
  id: string;
  questionNumber: number;
  level: string;
  type: string;
  imageDescription: string;
  image: string;
  audio: string;
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

export const part1Service = {
  // Lấy tất cả câu hỏi Part 1 từ Firebase
  async getAllQuestions(): Promise<Part1Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'ai_practice_questions'),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part1Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part1Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 1 questions:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo loại (people, objects, scenes)
  async getQuestionsByType(type: string): Promise<Part1Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'ai_practice_questions'),
        where('type', '==', type),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part1Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part1Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 1 questions by type:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo level
  async getQuestionsByLevel(level: string): Promise<Part1Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'ai_practice_questions'),
        where('level', '==', level),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part1Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part1Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 1 questions by level:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo loại và level
  async getQuestionsByTypeAndLevel(type: string, level: string): Promise<Part1Question[]> {
    try {
      const questionsQuery = query(
        collection(db, 'ai_practice_questions'),
        where('type', '==', type),
        where('level', '==', level),
        orderBy('questionNumber', 'asc')
      );
      const querySnapshot = await getDocs(questionsQuery);
      const questions: Part1Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Part1Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching Part 1 questions by type and level:', error);
      throw error;
    }
  }
}; 