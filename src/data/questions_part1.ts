export interface Question {
  questionNumber: number;
  imageDescription: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  explanation: string;
  traps: string;
  audioScript: string;
  image: string;
}