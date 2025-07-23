export interface Test {
  id: string | number;
  title: string;
  category: string;
  level?: number;
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
    name: 'Basic',
    tests: [
      { id: 1, title: 'Basic Objects in a Room', category: 'objects', questions: 6, completed: true, score: 80 },
      { id: 2, title: 'Simple Actions', category: 'people', questions: 6, completed: true, score: 90 },
      { id: 3, title: 'Outdoor Scenes', category: 'environment', questions: 6, completed: false, score: 0 },
      { id: 4, title: 'Daily Activities', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 5, title: 'Nature Landscapes', category: 'environment', questions: 6, completed: false, score: 0 },
    ],
  },
  '2': {
    name: 'Intermediate',
    tests: [
      { id: 6, title: 'Workplace Scenarios', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 7, title: 'Office Objects', category: 'objects', questions: 6, completed: false, score: 0 },
      { id: 8, title: 'City Environments', category: 'environment', questions: 6, completed: false, score: 0 },
      { id: 9, title: 'Group Activities', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 10, title: 'Public Places', category: 'environment', questions: 6, completed: false, score: 0 },
      { id: 11, title: 'Team Activities', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 12, title: 'Urban Settings', category: 'environment', questions: 6, completed: false, score: 0 }
    ],
  },
  '3': {
    name: 'Advanced',
    tests: [
      { id: 13, title: 'Complex Actions', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 14, title: 'Detailed Objects', category: 'objects', questions: 6, completed: false, score: 0 },
      { id: 15, title: 'Urban Landscapes', category: 'environment', questions: 6, completed: false, score: 0 },
      { id: 16, title: 'Social Events', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 17, title: 'Advanced Scenarios', category: 'people', questions: 6, completed: false, score: 0 },
      { id: 18, title: 'Complex Environments', category: 'environment', questions: 6, completed: false, score: 0 },
      { id: 19, title: 'Challenging Settings', category: 'environment', questions: 6, completed: false, score: 0 }
    ],
  }
};
