import { describe, it, expect } from 'vitest';
import { isValidMessage, typingLabel } from '../message';

describe('message utils', () => {
  describe('typingLabel', () => {
    it('names one or two people, and groups more', () => {
      expect(typingLabel([])).toBe('');
      expect(typingLabel(['Nina'])).toBe('Nina is typing');
      expect(typingLabel(['Nina', 'Luka'])).toBe('Nina and Luka are typing');
      expect(typingLabel(['Nina', 'Luka', 'John'])).toBe(
        'Several people are typing'
      );
    });
  });

  describe('isValidMessage', () => {
    it('returns true for valid messages', () => {
      expect(isValidMessage('Hello')).toBe(true);
      expect(isValidMessage('Test message')).toBe(true);
      expect(isValidMessage('a')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(isValidMessage('')).toBe(false);
    });

    it('returns false for whitespace-only strings', () => {
      expect(isValidMessage(' ')).toBe(false);
      expect(isValidMessage('   ')).toBe(false);
      expect(isValidMessage('\t')).toBe(false);
      expect(isValidMessage('\n')).toBe(false);
      expect(isValidMessage('  \n  \t  ')).toBe(false);
    });
  });
});
