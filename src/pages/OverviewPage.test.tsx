import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { habit } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { OverviewPage } from './OverviewPage';

vi.mock('@/components/layout/AppHeader', () => ({ AppHeader: () => null }));

describe('OverviewPage', () => {
  it('orders the sections like on the phone (also the keyboard order)', () => {
    renderWithData(<OverviewPage />, { habits: [habit] });
    expect(
      screen.getAllByRole('region').map((region) => region.getAttribute('aria-label')),
    ).toEqual(['Aufgaben', 'Module', 'Stundenplan', 'Aktivität']);
  });
});
