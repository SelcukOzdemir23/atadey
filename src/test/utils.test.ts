import { describe, it, expect } from 'vitest';
import { cn, shuffleArray, sampleSize } from '../lib/utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-blue-500', 'bg-white');
      expect(result).toBe('text-blue-500 bg-white');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should handle Tailwind conflicts correctly', () => {
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8'); // Last padding wins
    });

    it('should handle undefined/null values', () => {
      const result = cn('text-blue-500', undefined, null, 'bg-white');
      expect(result).toBe('text-blue-500 bg-white');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      
      expect(result).toHaveLength(input.length);
    });

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      
      expect(result.sort()).toEqual(input.sort());
    });

    it('should not modify original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      shuffleArray(input);
      
      expect(input).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const result = shuffleArray([1]);
      expect(result).toEqual([1]);
    });

    it('should work with strings', () => {
      const input = ['a', 'b', 'c', 'd'];
      const result = shuffleArray(input);
      
      expect(result).toHaveLength(4);
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('c');
      expect(result).toContain('d');
    });

    it('should work with objects', () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = shuffleArray(input);
      
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ id: 1 });
      expect(result).toContainEqual({ id: 2 });
      expect(result).toContainEqual({ id: 3 });
    });
  });

  describe('sampleSize', () => {
    it('should return requested number of items', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = sampleSize(input, 5);
      
      expect(result).toHaveLength(5);
    });

    it('should return all items if count >= array length', () => {
      const input = [1, 2, 3];
      const result = sampleSize(input, 5);
      
      expect(result).toHaveLength(3);
    });

    it('should return all items if count equals array length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = sampleSize(input, 5);
      
      expect(result).toHaveLength(5);
    });

    it('should not modify original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      sampleSize(input, 3);
      
      expect(input).toEqual(original);
    });

    it('should return unique items (no duplicates)', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = sampleSize(input, 5);
      const uniqueResult = [...new Set(result)];
      
      expect(uniqueResult).toHaveLength(result.length);
    });

    it('should handle empty array', () => {
      const result = sampleSize([], 3);
      expect(result).toEqual([]);
    });

    it('should handle zero count', () => {
      const input = [1, 2, 3, 4, 5];
      const result = sampleSize(input, 0);
      
      expect(result).toEqual([]);
    });

    it('should return items from original array', () => {
      const input = ['a', 'b', 'c', 'd', 'e'];
      const result = sampleSize(input, 3);
      
      result.forEach(item => {
        expect(input).toContain(item);
      });
    });

    it('should work with objects', () => {
      const input = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
      ];
      const result = sampleSize(input, 2);
      
      expect(result).toHaveLength(2);
      result.forEach(item => {
        expect(input).toContainEqual(item);
      });
    });

    it('should handle edge case: negative count', () => {
      const input = [1, 2, 3, 4, 5];
      const result = sampleSize(input, -1);
      
      expect(result).toEqual([]);
    });
  });
});
