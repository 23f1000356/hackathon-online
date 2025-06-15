import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  bio?: string;
  skills?: string[];
  achievements?: string[];
  following?: string[];
  followers?: string[];
  createdAt?: Date;
  lastActive?: Date;
}

export const authService = {
  // Sign up new user
  async signUp(name: string, email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: email === 'admin@test.com' ? 'admin' : 'student',
        bio: '',
        skills: [],
        achievements: [],
        following: [],
        followers: [],
        createdAt: new Date(),
        lastActive: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign in existing user or create demo user if doesn't exist
  async signIn(email: string, password: string): Promise<User> {
    try {
      // First try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || email,
          role: email === 'admin@test.com' ? 'admin' : 'student',
          bio: '',
          skills: [],
          achievements: [],
          following: [],
          followers: [],
          createdAt: new Date(),
          lastActive: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        return userData;
      }

      const userData = userDoc.data() as User;
      
      // Update last active
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastActive: new Date()
      });

      return userData;
    } catch (error: any) {
      // If user doesn't exist and it's a demo account, create it
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        if (email === 'student@test.com' || email === 'admin@test.com') {
          return await this.createDemoUser(email, password);
        }
      }
      throw new Error(error.message);
    }
  },

  // Create demo users
  async createDemoUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const name = email === 'admin@test.com' ? 'Admin User' : 'Student User';
      
      // Update the user's display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: email === 'admin@test.com' ? 'admin' : 'student',
        bio: email === 'admin@test.com' 
          ? 'Platform administrator with full access to manage users and content.' 
          : 'Student exploring the world of programming and technology.',
        skills: email === 'admin@test.com' 
          ? ['Platform Management', 'User Administration', 'Content Moderation']
          : ['JavaScript', 'React', 'HTML/CSS'],
        achievements: [],
        following: [],
        followers: [],
        createdAt: new Date(),
        lastActive: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'admin@test.com' ? 'admin' : 'student',
          bio: '',
          skills: [],
          achievements: [],
          following: [],
          followers: [],
          createdAt: new Date(),
          lastActive: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        return userData;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        lastActive: new Date()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
};