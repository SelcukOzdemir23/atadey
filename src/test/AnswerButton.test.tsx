import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AnswerButton } from '../components/game/shared/AnswerButton';

describe('AnswerButton Component', () => {
  const mockOnAnswer = vi.fn();
  const defaultProps = {
    option: 'Test Option',
    isSelected: false,
    isCorrect: false,
    isCorrectOption: false,
    showFeedback: false,
    onAnswer: mockOnAnswer,
  };

  it('should render button with option text', () => {
    render(<AnswerButton {...defaultProps} />);
    expect(screen.getByText('Test Option')).toBeInTheDocument();
  });

  it('should call onAnswer when clicked', () => {
    render(<AnswerButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnAnswer).toHaveBeenCalledWith('Test Option');
  });

  it('should show selected state when isSelected is true', () => {
    render(<AnswerButton {...defaultProps} isSelected={true} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('ring-2');
  });

  it('should show correct state with checkmark when answer is correct', () => {
    render(
      <AnswerButton
        {...defaultProps}
        isSelected={true}
        isCorrect={true}
        showFeedback={true}
      />
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-green-700');
  });

  it('should show error state with X when answer is wrong', () => {
    render(
      <AnswerButton
        {...defaultProps}
        isSelected={true}
        isCorrect={false}
        showFeedback={true}
      />
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('should highlight correct answer when showFeedback is true', () => {
    render(
      <AnswerButton
        {...defaultProps}
        isCorrectOption={true}
        showFeedback={true}
      />
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-green-100');
  });

  it('should keep label readable on hover (no white-on-white)', () => {
    render(<AnswerButton {...defaultProps} />);
    const button = screen.getByRole('button');
    // The resting style lightens the background on hover, so it must also
    // reset the text colour; otherwise the ghost variant's white wins.
    expect(button.className).toContain('hover:bg-primary/5');
    expect(button.className).toContain('hover:text-foreground');
    // twMerge must have dropped the ghost variant's white hover text.
    expect(button.className).not.toContain('hover:text-accent-foreground');
  });

  it('should be disabled when showFeedback is true', () => {
    render(<AnswerButton {...defaultProps} showFeedback={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not be clickable when disabled', () => {
    const onAnswer = vi.fn();
    render(
      <AnswerButton {...defaultProps} showFeedback={true} onAnswer={onAnswer} />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onAnswer).not.toHaveBeenCalled();
  });
});
