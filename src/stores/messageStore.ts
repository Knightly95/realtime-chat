import { create } from 'zustand';

import type { Message, CreateMessageRequest } from '@/types/chat';
import {
  messageService,
  type GetMessagesParams,
} from '@/services/messageService';
import { API_CONFIG } from '@/constants/api';
import { getErrorMessage, ERROR_MESSAGES } from '@/utils/error';

interface MessageStore {
  messages: Message[];
  loading: boolean;
  error: string | null;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  fetchMessages: (params?: GetMessagesParams) => Promise<void>;
  /**
   * Adds messages that arrived since the last fetch, such as a teammate's
   * reply. Messages already shown are kept as they are, so nothing re-renders
   * or scrolls when there is nothing new.
   */
  fetchNewMessages: () => Promise<void>;
  sendMessage: (data: CreateMessageRequest) => Promise<void>;
}

const time = (message: Message) => new Date(message.createdAt).getTime();

export type { MessageStore };

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchMessages: async (params?: GetMessagesParams) => {
    set({ loading: true, error: null });
    try {
      const queryParams = {
        limit: API_CONFIG.DEFAULTS.MESSAGE_LIMIT,
        ...params,
      };
      const messages = await messageService.getMessages(queryParams);
      set({ messages, loading: false });
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        ERROR_MESSAGES.FETCH_MESSAGES_FAILED
      );
      set({ error: errorMessage, loading: false });
    }
  },

  fetchNewMessages: async () => {
    try {
      // The latest page, not "after my last message": a reply that became
      // visible just before the visitor sent another message is older than
      // that message and would be skipped.
      const latest = await messageService.getMessages({
        limit: API_CONFIG.DEFAULTS.MESSAGE_LIMIT,
      });
      const known = new Set(get().messages.map((message) => message._id));
      const fresh = latest.filter((message) => !known.has(message._id));
      if (fresh.length === 0) return;
      set((state) => ({
        messages: [...state.messages, ...fresh].sort(
          (a, b) => time(a) - time(b)
        ),
      }));
    } catch {
      // A failed background check is retried on the next one.
    }
  },

  sendMessage: async (data: CreateMessageRequest) => {
    set({ loading: true, error: null });
    try {
      const message = await messageService.createMessage(data);
      get().addMessage(message);
      set({ loading: false });
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        ERROR_MESSAGES.SEND_MESSAGE_FAILED
      );
      set({ error: errorMessage, loading: false });
    }
  },
}));
