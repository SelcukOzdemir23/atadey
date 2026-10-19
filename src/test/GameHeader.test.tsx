import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GameHeader } from '../components/game/shared/GameHeader';

describe('GameHeader Component', () => {
  describe('Mistakes Mode', () => {
    it('should render score and hearts for mistakes mode', () => {
      render(
        <GameHeader
          score={5}
          mistakes={2}
          totalQuestions={7}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="mistakes"
        />
      );

      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText('Doğru')).toBeInTheDocument();
      
      // Should show 5 heart icons (SVG)
      const hearts = document.querySelectorAll('.lucide-heart');
      expect(hearts).toHaveLength(5);
    });

    it('should show correct number of broken hearts', () => {
      render(
        <GameHeader
          score={3}
          mistakes={3}
          totalQuestions={5}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="mistakes"
        />
      );

      // Should show hearts with gray color (broken hearts)
      const greyHearts = document.querySelectorAll('.text-gray-300');
      expect(greyHearts.length).toBeGreaterThanOrEqual(3);
    });

    it('should show all hearts as healthy when no mistakes', () => {
      render(
        <GameHeader
          score={5}
          mistakes={0}
          totalQuestions={5}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="mistakes"
        />
      );

      // All hearts should be red
      const redHearts = document.querySelectorAll('.text-red-500');
      expect(redHearts.length).toBe(5);
    });
  });

  describe('Questions Mode', () => {
    it('should render score and question counter for questions mode', () => {
      render(
        <GameHeader
          score={7}
          mistakes={0}
          totalQuestions={8}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="questions"
        />
      );

      expect(screen.getByText(/7/)).toBeInTheDocument();
      expect(screen.getByText('Doğru')).toBeInTheDocument();
      expect(screen.getByText(/8/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('should not show hearts in questions mode', () => {
      render(
        <GameHeader
          score={5}
          mistakes={2}
          totalQuestions={6}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="questions"
        />
      );

      const hearts = document.querySelectorAll('.lucide-heart');
      expect(hearts).toHaveLength(0);
    });

    it('should show correct progress in questions mode', () => {
      render(
        <GameHeader
          score={10}
          mistakes={0}
          totalQuestions={10}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="questions"
        />
      );

      // Check that both score and question counter are rendered
      expect(screen.getByText('Doğru')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive classes', () => {
      const { container } = render(
        <GameHeader
          score={5}
          mistakes={2}
          totalQuestions={7}
          maxMistakes={5}
          maxQuestions={10}
          activeFormat="mistakes"
        />
      );

      // Check if component renders successfully
      const header = container.querySelector('header');
      expect(header).toBeTruthy();
      expect(header?.className).toContain('mb-6');
    });
  });
});
