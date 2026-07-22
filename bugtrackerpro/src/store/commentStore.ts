import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Comment } from '../types';

interface CommentStore {
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Comment;
  deleteComment: (id: string) => void;
  getCommentsByTicket: (ticketId: string) => Comment[];
}

const initialComments: Comment[] = [
  {
    id: '1',
    content: 'I have started working on this issue. Will update once I have more progress.',
    ticketId: '1',
    authorId: '3',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'This is a critical bug that needs immediate attention.',
    ticketId: '1',
    authorId: '2',
    createdAt: new Date().toISOString(),
  },
];

export const useCommentStore = create<CommentStore>()(
  persist(
    (set, get) => ({
      comments: initialComments,
      
      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ comments: [...state.comments, newComment] }));
        return newComment;
      },
      
      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        }));
      },
      
      getCommentsByTicket: (ticketId) => {
        return get().comments.filter((c) => c.ticketId === ticketId);
      },
    }),
    {
      name: 'comment-storage',
    }
  )
);
