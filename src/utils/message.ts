import { STORAGE_KEYS, USER_CONFIG } from '@/constants/chat';

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString();
};

/** "Nina is typing", "Nina and Luka are typing", "Several people are typing". */
export const typingLabel = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return 'Several people are typing';
};

export const isValidMessage = (message: string): boolean => {
  return message.trim().length > 0;
};

const USER_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Ivy',
  'Jack',
];

export const getCurrentUser = (): string => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    return stored;
  }

  const randomName = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
  const randomId = Math.floor(Math.random() * USER_CONFIG.RANDOM_ID_MAX);
  const userName = `${randomName}${randomId}`;

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userName);
  return userName;
};
