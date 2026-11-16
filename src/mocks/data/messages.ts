import type { Message, CreateMessageRequest } from '@/types/chat';

export const mockMessages: Message[] = [
  {
    _id: '1',
    message: 'Morning! The release notes draft is in the shared folder.',
    author: 'John',
    createdAt: new Date('2026-02-08T06:14:44Z').toISOString(),
  },
  {
    _id: '2',
    message:
      'Could everyone review it by tomorrow? Then we can publish on Thursday.',
    author: 'Luka',
    createdAt: new Date('2026-02-08T07:16:44Z').toISOString(),
  },
  {
    _id: '3',
    message: 'Done! I left two small comments on the migration section.',
    author: 'Maddie',
    createdAt: new Date('2026-02-08T08:19:14Z').toISOString(),
  },
  {
    _id: '4',
    message: 'Reading it now. Looks good so far 😊',
    author: 'Nina',
    createdAt: new Date('2026-02-08T09:21:44Z').toISOString(),
  },
];

export const createMockMessage = (data: CreateMessageRequest): Message => ({
  _id: `${Date.now()}`,
  message: data.message,
  author: data.author,
  createdAt: new Date().toISOString(),
});
