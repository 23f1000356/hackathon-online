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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  type: 'achievement' | 'question' | 'discussion';
  likes: number;
  likedBy: string[];
  comments: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Date;
}

export const communityService = {
  // Create new post
  async createPost(post: Omit<Post, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        likes: 0,
        likedBy: [],
        comments: 0,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get all posts
  async getPosts(): Promise<Post[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get posts by user
  async getPostsByUser(userId: string): Promise<Post[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'posts'), 
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Like/Unlike post
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data() as Post;
      const isLiked = postData.likedBy?.includes(userId);

      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Add comment to post
  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Add comment
      const docRef = await addDoc(collection(db, 'comments'), {
        ...comment,
        createdAt: serverTimestamp()
      });

      // Increment comment count on post
      await updateDoc(doc(db, 'posts', comment.postId), {
        comments: increment(1)
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get comments for post
  async getComments(postId: string): Promise<Comment[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'comments'), 
          where('postId', '==', postId),
          orderBy('createdAt', 'asc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Delete post
  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update post
  async updatePost(postId: string, updates: Partial<Post>): Promise<void> {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};