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
  /** People writing a message right now, from the last live check. */
  typing: string[];
  /** The last live check failed; the next one retries. */
  connectionLost: boolean;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  fetchMessages: (params?: GetMessagesParams) => Promise<void>;
  /**
   * Adds messages that arrived since the last fetch, such as a teammate's
   * reply, and updates who is typing. Messages already shown are kept as they
   * are, so nothing re-renders or scrolls when there is nothing new.
   */
  fetchNewMessages: () => Promise<void>;
  /** Clears what live checks found, for when they are paused. */
  resetLiveState: () => void;
  sendMessage: (data: CreateMessageRequest) => Promise<void>;
}

const time = (message: Message) => new Date(message.createdAt).getTime();
const sameNames = (a: string[], b: string[]) =>
  a.length === b.length && a.every((name, i) => name === b[i]);

export type { MessageStore };

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  typing: [],
  connectionLost: false,

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
    const [latest, typing] = await Promise.allSettled([
      // The latest page, not "after my last message": a reply that became
      // visible just before the visitor sent another message is older than
      // that message and would be skipped.
      messageService.getMessages({ limit: API_CONFIG.DEFAULTS.MESSAGE_LIMIT }),
      messageService.getTyping(),
    ]);
    const state = get();
    const patch: Partial<MessageStore> = {};

    // Typing is optional: a backend without it simply shows no dots.
    const typingNow =
      typing.status === 'fulfilled' && Array.isArray(typing.value)
        ? typing.value
        : [];
    if (!sameNames(typingNow, state.typing)) patch.typing = typingNow;

    if (latest.status === 'rejected') {
      // Retried on the next check; say so instead of failing silently.
      if (!state.connectionLost) patch.connectionLost = true;
    } else {
      if (state.connectionLost) patch.connectionLost = false;
      const known = new Set(state.messages.map((message) => message._id));
      const fresh = (latest.value ?? []).filter((m) => !known.has(m._id));
      if (fresh.length > 0) {
        patch.messages = [...state.messages, ...fresh].sort(
          (a, b) => time(a) - time(b)
        );
      }
    }

    // One update, so a reply and the end of its typing dots appear together.
    if (Object.keys(patch).length > 0) set(patch);
  },

  resetLiveState: () => set({ typing: [], connectionLost: false }),

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
