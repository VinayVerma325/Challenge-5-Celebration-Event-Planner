import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Alert } from '../components/Alert.js';
import { formatCurrency, getDaysRemaining } from '../utils/formatters.js';

describe('Frontend Accessible Components & Formatters', () => {
  it('should render Button with text and respond to clicks', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Plan Celebration</Button>);

    const button = screen.getByRole('button', { name: /plan celebration/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should disable Button and display spinner when isLoading is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Saving
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render ProgressBar with correct accessibility attributes', () => {
    render(<ProgressBar value={65} label="Checklist Progress" />);

    const progressbar = screen.getByRole('progressbar', { name: /checklist progress/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('should render Alert banner and trigger onDismiss callback', () => {
    const handleDismiss = vi.fn();
    render(
      <Alert
        type="warning"
        title="Budget Warning"
        message="Actual expenses exceeded allocation"
        onDismiss={handleDismiss}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/budget warning/i)).toBeInTheDocument();
    expect(screen.getByText(/actual expenses exceeded allocation/i)).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('should format currency accurately across different currency codes', () => {
    const usd = formatCurrency(5000, 'USD');
    expect(usd).toContain('5,000');

    const inr = formatCurrency(150000, 'INR');
    expect(inr).toContain('150,000');
  });

  it('should calculate remaining countdown days accurately', () => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 10);

    const info = getDaysRemaining(futureDate);
    expect(info.isPast).toBe(false);
    expect(info.days).toBe(10);
    expect(info.label).toContain('10 days');
  });
});
