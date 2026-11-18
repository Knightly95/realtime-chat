import { http, HttpResponse } from 'msw';
import type { CreateMessageRequest, Message } from '@/types/chat';
import { API_CONFIG } from '@/constants/api';
import { createMockMessage } from './data/messages';
import { appendMessage, readMessages } from './store';

/**
 * In-browser implementation of the chat REST API:
 *
 *   GET  /messages?after=<ISO date>&before=<ISO date>&limit=<n>
 *   POST /messages  { message, author }
 *   GET  /typing    { typing: string[] }, who is writing a reply right now
 *
 * Requests are intercepted by MSW, so the app talks HTTP exactly as it would
 * to a real server. Set VITE_API_URL to use a real backend instead.
 */
const MESSAGES_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MESSAGES}`;
const TYPING_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TYPING}`;

const TEAMMATES = ['John', 'Luka', 'Maddie', 'Nina'];
const REPLIES = [
  'Got it, thanks!',
  'Makes sense to me.',
  'Good point. I will take a look this afternoon.',
  'Agreed. Shall we go with that?',
  'Nice one 👍',
  'Can you share a bit more detail?',
];
// Long enough to see the typing dots, short enough not to wait.
const REPLY_DELAY_MS = { min: 2000, max: 4500 };

const pick = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/**
 * Simulates another participant answering, so the demo feels alive.
 *
 * The reply is stored right away with a timestamp a few seconds in the future
 * and stays hidden until then, while its author shows as typing. Unlike a
 * timer, this survives a page reload.
 */
function scheduleTeammateReply(): void {
  const delay =
    REPLY_DELAY_MS.min +
    Math.random() * (REPLY_DELAY_MS.max - REPLY_DELAY_MS.min);
  appendMessage({
    ...createMockMessage({ author: pick(TEAMMATES), message: pick(REPLIES) }),
    createdAt: new Date(Date.now() + delay).toISOString(),
  });
}

/** Messages whose time has come; scheduled replies stay hidden until then. */
export function visibleMessages(messages: Message[], now = Date.now()) {
  return messages.filter((m) => new Date(m.createdAt).getTime() <= now);
}

/** Authors of replies that are scheduled but not shown yet, each once. */
export function typingAuthors(messages: Message[], now = Date.now()) {
  const pending = messages.filter((m) => new Date(m.createdAt).getTime() > now);
  return [...new Set(pending.map((m) => m.author))];
}

export function filterMessages(
  messages: Message[],
  params: URLSearchParams
): Message[] {
  const after = params.get('after');
  const before = params.get('before');
  const limit =
    Number(params.get('limit')) || API_CONFIG.DEFAULTS.MESSAGE_LIMIT;
  const time = (m: Message) => new Date(m.createdAt).getTime();

  let result = [...messages].sort((a, b) => time(a) - time(b));
  if (after) {
    result = result.filter((m) => time(m) > new Date(after).getTime());
  }
  if (before) {
    result = result.filter((m) => time(m) < new Date(before).getTime());
  }
  // Keep the most recent `limit` messages, oldest first.
  return result.slice(-limit);
}

export const handlers = [
  http.get(MESSAGES_URL, ({ request }) => {
    const { searchParams } = new URL(request.url);
    return HttpResponse.json(
      filterMessages(visibleMessages(readMessages()), searchParams)
    );
  }),

  http.get(TYPING_URL, () =>
    HttpResponse.json({ typing: typingAuthors(readMessages()) })
  ),

  http.post(MESSAGES_URL, async ({ request }) => {
    const data = (await request.json()) as Partial<CreateMessageRequest>;
    if (!data?.message?.trim() || !data?.author?.trim()) {
      return HttpResponse.json(
        { error: 'message and author are required' },
        { status: 400 }
      );
    }
    const created = createMockMessage(data as CreateMessageRequest);
    appendMessage(created);
    scheduleTeammateReply();
    return HttpResponse.json(created, { status: 201 });
  }),
];
