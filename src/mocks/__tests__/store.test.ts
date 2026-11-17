import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Message } from '@/types/chat';
import { mockMessages } from '../data/messages';
import { appendMessage, readMessages, resetMessages } from '../store';

const STORAGE_KEY = 'realtime-chat:mock-messages:v1';

const newMessage: Message = {
  _id: 'new',
  message: 'Hello',
  author: 'Tester',
  createdAt: '2026-03-01T10:00:00Z',
};

describe('mock API: message store', () => {
  beforeEach(() => {
    resetMessages();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetMessages();
  });

  it('returns the seed conversation when nothing has been saved', () => {
    expect(readMessages()).toEqual(mockMessages);
  });

  it('saves an appended message in localStorage', () => {
    appendMessage(newMessage);

    expect(readMessages()).toEqual([...mockMessages, newMessage]);
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    ).toHaveLength(mockMessages.length + 1);
  });

  it('does not change the seed data when a message is appended', () => {
    const seedLength = mockMessages.length;

    appendMessage(newMessage);

    expect(mockMessages).toHaveLength(seedLength);
  });

  it('goes back to the seed conversation after a reset', () => {
    appendMessage(newMessage);

    resetMessages();

    expect(readMessages()).toEqual(mockMessages);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('keeps messages in memory when storage is blocked', () => {
    const blocked = () => {
      throw new Error('storage is blocked');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

    appendMessage(newMessage);

    expect(readMessages()).toEqual([...mockMessages, newMessage]);
  });
});
