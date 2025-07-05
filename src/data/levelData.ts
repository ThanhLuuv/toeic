export interface Test {
    id: number;
    title: string;
    category: string;
    questions: number;
    completed: boolean;
    score: number;
  }
  
  export interface Level {
    name: string;
    tests: Test[];
  }
  
  export const levelData: { [key: string]: Level } = {
    '1': {
      name: 'Level 1 - Beginner',
      tests: [
        { id: 1, title: 'Basic Objects in a Room', category: 'objects', questions: 6, completed: true, score: 80 },
        { id: 2, title: 'Simple Actions', category: 'people', questions: 6, completed: true, score: 90 },
        { id: 3, title: 'Outdoor Scenes', category: 'environment', questions: 6, completed: false, score: 0 },
        { id: 4, title: 'Daily Activities', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 5, title: 'Nature Landscapes', category: 'environment', questions: 6, completed: false, score: 0 },
      ],
    },
    '2': {
      name: 'Level 2 - Elementary',
      tests: [
        { id: 6, title: 'Workplace Scenarios', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 7, title: 'Office Objects', category: 'objects', questions: 6, completed: false, score: 0 },
        { id: 8, title: 'City Environments', category: 'environment', questions: 6, completed: false, score: 0 },
        { id: 9, title: 'Group Activities', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 10, title: 'Public Places', category: 'environment', questions: 6, completed: false, score: 0 },
      ],
    },
    '3': {
      name: 'Level 3 - Pre-Inter',
      tests: [
        { id: 11, title: 'Complex Actions', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 12, title: 'Detailed Objects', category: 'objects', questions: 6, completed: false, score: 0 },
        { id: 13, title: 'Urban Landscapes', category: 'environment', questions: 6, completed: false, score: 0 },
        { id: 14, title: 'Social Events', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 15, title: 'Natural Settings', category: 'environment', questions: 6, completed: false, score: 0 },
      ],
    },
    '4': {
      name: 'Level 4 - Intermediate',
      tests: [
        { id: 16, title: 'Professional Scenarios', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 17, title: 'Complex Objects', category: 'objects', questions: 6, completed: false, score: 0 },
        { id: 18, title: 'Mixed Environments', category: 'environment', questions: 6, completed: false, score: 0 },
        { id: 19, title: 'Team Activities', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 20, title: 'Urban Settings', category: 'environment', questions: 6, completed: false, score: 0 },
      ],
    },
    '5': {
      name: 'Level 5 - Advanced',
      tests: [
        { id: 21, title: 'Advanced Scenarios', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 22, title: 'Intricate Objects', category: 'objects', questions: 6, completed: false, score: 0 },
        { id: 23, title: 'Complex Environments', category: 'environment', questions: 6, completed: false, score: 0 },
        { id: 24, title: 'Dynamic Activities', category: 'people', questions: 6, completed: false, score: 0 },
        { id: 25, title: 'Challenging Settings', category: 'environment', questions: 6, completed: false, score: 0 },
      ],
    },
  };