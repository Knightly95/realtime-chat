import type { Message } from '@/types/chat';
import { mockMessages } from './data/messages';

const STORAGE_KEY = 'realtime-chat:mock-messages:v1';

/**
 * Message store for the in-browser mock API.
 *
 * Messages live in localStorage, so they survive reloads and are shared by
 * every tab of the same browser. Falls back to memory if storage is blocked.
 */
let memory: Message[] | null = null;

export function readMessages(): Message[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch {
    // ignore: fall through to the in-memory copy
  }
  return memory ?? [...mockMessages];
}

export function appendMessage(message: Message): void {
  const next = [...readMessages(), message];
  memory = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore: data stays in memory for this session
  }
}

export function resetMessages(): void {
  memory = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
