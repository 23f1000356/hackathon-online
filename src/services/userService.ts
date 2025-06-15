import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from './authService';

export const userService = {
  // Get all users (Admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      // Filter users by name or email (client-side filtering)
      return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Follow/Unfollow user
  async toggleFollow(currentUserId: string, targetUserId: string): Promise<void> {
    try {
      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', targetUserId);

      const currentUserDoc = await getDoc(currentUserRef);
      if (!currentUserDoc.exists()) {
        throw new Error('Current user not found');
      }

      const currentUserData = currentUserDoc.data() as User;
      const isFollowing = currentUserData.following?.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUserId)
        });
      } else {
        // Follow
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUserId)
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user followers
  async getUserFollowers(userId: string): Promise<User[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      const followerIds = userData.followers || [];

      if (followerIds.length === 0) return [];

      const followers: User[] = [];
      for (const followerId of followerIds) {
        const followerDoc = await getDoc(doc(db, 'users', followerId));
        if (followerDoc.exists()) {
          followers.push({ id: followerDoc.id, ...followerDoc.data() } as User);
        }
      }

      return followers;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user following
  async getUserFollowing(userId: string): Promise<User[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      const followingIds = userData.following || [];

      if (followingIds.length === 0) return [];

      const following: User[] = [];
      for (const followingId of followingIds) {
        const followingDoc = await getDoc(doc(db, 'users', followingId));
        if (followingDoc.exists()) {
          following.push({ id: followingDoc.id, ...followingDoc.data() } as User);
        }
      }

      return following;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};