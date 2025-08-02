import { collection, getDocs, query, where, orderBy, limit, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GrammarQuestion, GrammarTopic } from '../types/grammar';

export const grammarService = {
  // Lấy tất cả các chủ đề ngữ pháp
  async getGrammarTopics(): Promise<GrammarTopic[]> {
    try {
      const topicsQuery = query(
        collection(db, 'grammar_topics'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(topicsQuery);
      
      const topics: GrammarTopic[] = [];
      querySnapshot.forEach((doc) => {
        topics.push({ id: doc.id, ...doc.data() } as GrammarTopic);
      });
      
      return topics;
    } catch (error) {
      console.error('Error fetching grammar topics:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo tên chủ đề (sử dụng topic name)
  async getQuestionsByTopicName(topicName: string, limitCount: number = 10): Promise<GrammarQuestion[]> {
    try {
      console.log('🔍 Searching for questions with topic name:', topicName);
      
      // Lấy tất cả câu hỏi và filter theo topic name (case-insensitive)
      const questionsQuery = query(collection(db, 'grammar_questions'));
      const querySnapshot = await getDocs(questionsQuery);
      const questions: GrammarQuestion[] = [];
      
      querySnapshot.forEach((doc) => {
        const question = { id: doc.id, ...doc.data() } as GrammarQuestion;
        // So sánh case-insensitive và trim whitespace
        if (question.grammarTopic && 
            question.grammarTopic.trim().toLowerCase() === topicName.trim().toLowerCase()) {
          questions.push(question);
        }
      });
      
      console.log(`📊 Found ${questions.length} questions with topic name "${topicName}"`);
      
      // Giới hạn số lượng câu hỏi
      const limitedQuestions = questions.slice(0, limitCount);
      
      // Sắp xếp theo ID sau khi lấy dữ liệu
      limitedQuestions.sort((a, b) => a.id.localeCompare(b.id));
      
      return limitedQuestions;
    } catch (error) {
      console.error('Error fetching grammar questions by topic name:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo chủ đề (sử dụng topicId hoặc tên topic)
  async getQuestionsByTopic(topicId: string, limitCount: number = 10): Promise<GrammarQuestion[]> {
    try {
      console.log('🔍 Searching for questions with topicId:', topicId);
      
      // Lấy thông tin topic để có tên
      const topics = await this.getGrammarTopics();
      const topic = topics.find(t => t.id === topicId);
      
      if (!topic) {
        console.log('❌ Topic not found:', topicId);
        return [];
      }
      
      console.log('📝 Topic found:', topic.name);
      
      // Lấy tất cả câu hỏi và filter theo topic name (case-insensitive)
      const questionsQuery = query(collection(db, 'grammar_questions'));
      const querySnapshot = await getDocs(questionsQuery);
      const questions: GrammarQuestion[] = [];
      
      querySnapshot.forEach((doc) => {
        const question = { id: doc.id, ...doc.data() } as GrammarQuestion;
        // So sánh case-insensitive và trim whitespace
        if (question.grammarTopic && 
            question.grammarTopic.trim().toLowerCase() === topic.name.trim().toLowerCase()) {
          questions.push(question);
        }
      });
      
      console.log(`📊 Found ${questions.length} questions with topic name "${topic.name}"`);
      
      // Giới hạn số lượng câu hỏi
      const limitedQuestions = questions.slice(0, limitCount);
      
      // Sắp xếp theo ID sau khi lấy dữ liệu
      limitedQuestions.sort((a, b) => a.id.localeCompare(b.id));
      
      return limitedQuestions;
    } catch (error) {
      console.error('Error fetching grammar questions:', error);
      throw error;
    }
  },

  // Lấy câu hỏi theo level
  async getQuestionsByLevel(level: string, limitCount: number = 10): Promise<GrammarQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'grammar_questions'),
        where('level', '==', level),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: GrammarQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as GrammarQuestion);
      });
      
      // Sắp xếp theo ID sau khi lấy dữ liệu
      questions.sort((a, b) => a.id.localeCompare(b.id));
      
      return questions;
    } catch (error) {
      console.error('Error fetching grammar questions by level:', error);
      throw error;
    }
  },

  // Lấy tất cả câu hỏi (có thể dùng cho practice mode)
  async getAllQuestions(limitCount: number = 20): Promise<GrammarQuestion[]> {
    try {
      const questionsQuery = query(
        collection(db, 'grammar_questions'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(questionsQuery);
      
      const questions: GrammarQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as GrammarQuestion);
      });
      
      // Sắp xếp theo ID sau khi lấy dữ liệu
      questions.sort((a, b) => a.id.localeCompare(b.id));
      
      return questions;
    } catch (error) {
      console.error('Error fetching all grammar questions:', error);
      throw error;
    }
  },

  // Thêm chủ đề ngữ pháp mới
  async addGrammarTopic(topic: Omit<GrammarTopic, 'id'>): Promise<string> {
    try {
      const topicWithTimestamp = {
        ...topic,
        createdAt: new Date().toISOString() // Thêm timestamp khi tạo
      };
      const docRef = await addDoc(collection(db, 'grammar_topics'), topicWithTimestamp);
      console.log('Grammar topic added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding grammar topic:', error);
      throw error;
    }
  },

  // Thêm câu hỏi ngữ pháp mới
  async addGrammarQuestion(question: Omit<GrammarQuestion, 'id'>): Promise<string> {
    try {
      // Tự động tìm topicId nếu chưa có
      let questionData = { ...question };
      
      if (!question.topicId && question.grammarTopic) {
        const topics = await this.getGrammarTopics();
        const topic = topics.find(t => t.name === question.grammarTopic);
        if (topic) {
          questionData.topicId = topic.id;
          console.log(`🔗 Auto-linked question to topic: ${topic.name} (${topic.id})`);
        }
      }
      
      const docRef = await addDoc(collection(db, 'grammar_questions'), questionData);
      console.log('Grammar question added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding grammar question:', error);
      throw error;
    }
  },

  // Thêm nhiều câu hỏi cùng lúc
  async addMultipleGrammarQuestions(questions: Omit<GrammarQuestion, 'id'>[]): Promise<string[]> {
    try {
      const promises = questions.map(question => this.addGrammarQuestion(question));
      const ids = await Promise.all(promises);
      console.log('Multiple grammar questions added:', ids.length);
      return ids;
    } catch (error) {
      console.error('Error adding multiple grammar questions:', error);
      throw error;
    }
  },

  // Cập nhật số lượng câu hỏi cho tất cả topics
  async updateTopicQuestionCounts(): Promise<void> {
    try {
      console.log('🔄 Updating topic question counts...');
      
      // Lấy tất cả topics
      const topics = await this.getGrammarTopics();
      
      // Lấy tất cả questions
      const questionsQuery = query(collection(db, 'grammar_questions'));
      const questionsSnapshot = await getDocs(questionsQuery);
      
      const questions: GrammarQuestion[] = [];
      questionsSnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as GrammarQuestion);
      });
      
      // Đếm số câu hỏi cho mỗi topic
      const topicCounts: { [key: string]: number } = {};
      
      questions.forEach(question => {
        if (question.grammarTopic) {
          const topicName = question.grammarTopic.trim().toLowerCase();
          topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
        }
      });
      
      console.log('📊 Topic counts:', topicCounts);
      
      // Cập nhật questionCount cho mỗi topic
      const updatePromises = topics.map(async (topic) => {
        const topicName = topic.name.trim().toLowerCase();
        const count = topicCounts[topicName] || 0;
        
        if (topic.questionCount !== count) {
          console.log(`📝 Updating ${topic.name}: ${topic.questionCount} -> ${count}`);
          await setDoc(doc(db, 'grammar_topics', topic.id), {
            ...topic,
            questionCount: count
          }, { merge: true });
        }
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Topic question counts updated successfully');
      
    } catch (error) {
      console.error('Error updating topic question counts:', error);
      throw error;
    }
  }
}; 