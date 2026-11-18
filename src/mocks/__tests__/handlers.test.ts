import { describe, it, expect, vi } from 'vitest';
import type { Message } from '@/types/chat';
import { filterMessages, visibleMessages } from '../handlers';
import { createMockMessage } from '../data/messages';

const message = (id: string, createdAt: string): Message => ({
  _id: id,
  message: `message ${id}`,
  author: 'Tester',
  createdAt,
});

const messages = [
  message('c', '2026-01-03T10:00:00Z'),
  message('a', '2026-01-01T10:00:00Z'),
  message('b', '2026-01-02T10:00:00Z'),
];

const ids = (list: Message[]) => list.map((m) => m._id);

describe('mock API: filterMessages', () => {
  it('returns messages oldest first', () => {
    expect(ids(filterMessages(messages, new URLSearchParams()))).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('keeps only the most recent messages when a limit is given', () => {
    const params = new URLSearchParams({ limit: '2' });
    expect(ids(filterMessages(messages, params))).toEqual(['b', 'c']);
  });

  it('filters by the after and before dates', () => {
    const after = new URLSearchParams({ after: '2026-01-01T10:00:00Z' });
    expect(ids(filterMessages(messages, after))).toEqual(['b', 'c']);

    const before = new URLSearchParams({ before: '2026-01-03T10:00:00Z' });
    expect(ids(filterMessages(messages, before))).toEqual(['a', 'b']);
  });
});

describe('mock API: visibleMessages', () => {
  it('hides scheduled replies until their time comes', () => {
    const now = new Date('2026-01-02T12:00:00Z').getTime();
    expect(ids(visibleMessages(messages, now))).toEqual(['a', 'b']);
  });
});

describe('mock API: createMockMessage', () => {
  it('gives messages made in the same millisecond different ids', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const sent = createMockMessage({ message: 'Hello', author: 'Eve' });
    const reply = createMockMessage({
      message: 'Got it, thanks!',
      author: 'Nina',
    });
    vi.restoreAllMocks();

    expect(sent._id).not.toBe(reply._id);
  });
});
