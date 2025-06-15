import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  createdAt?: Date;
  createdBy?: string;
}

export interface TestResult {
  id?: string;
  userId: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: number[];
  timeSpent: number;
  completedAt: Date;
}

export const testService = {
  // Add new question (Admin only)
  async addQuestion(question: Omit<Question, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'questions'), {
        ...question,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all questions
  async getQuestions(): Promise<Question[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'questions'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get questions by subject
  async getQuestionsBySubject(subject: string): Promise<Question[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'questions'), 
          where('subject', '==', subject),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update question
  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
    try {
      await updateDoc(doc(db, 'questions', questionId), updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete question
  async deleteQuestion(questionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Save test result
  async saveTestResult(result: Omit<TestResult, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'testResults'), {
        ...result,
        completedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user test results
  async getUserTestResults(userId: string): Promise<TestResult[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'testResults'), 
          where('userId', '==', userId),
          orderBy('completedAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestResult));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all test results (Admin only)
  async getAllTestResults(): Promise<TestResult[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'testResults'), orderBy('completedAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestResult));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};