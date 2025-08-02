export interface GrammarOption {
  label: string;
  text: string;
  type: string;
  translation: string;
}

export interface GrammarTrap {
  type: string;
  description: string;
  commonMistakes: string[];
}

export interface GrammarQuestion {
  id: string;
  grammarTopic: string;
  topicId?: string; // ID của topic để liên kết
  question: string;
  options: GrammarOption[];
  correctAnswer: string;
  explanation: string;
  translation: string;
  level: string;
  trap: GrammarTrap;
}

export interface GrammarTopic {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  icon?: string;
  createdAt?: string;
} 