import Dexie, { type EntityTable } from 'dexie';

export interface Question {
  id?: number;
  type: 'mcq' | 'text';
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  categories: string[];
  explanation?: string;
  createdAt: Date;
}

export interface Exam {
  id?: number;
  title: string;
  description: string;
  questionIds: number[];
  createdAt: Date;
}

const db = new Dexie('TestMeDB') as Dexie & {
  questions: EntityTable<Question, 'id'>;
  exams: EntityTable<Exam, 'id'>;
};

// Schema declaration
db.version(1).stores({
  questions: '++id, type, createdAt, *categories',
  exams: '++id, title, createdAt'
});

export type { EntityTable };
export { db };
