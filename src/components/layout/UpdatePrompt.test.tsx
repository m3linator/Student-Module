import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdatePrompt } from './UpdatePrompt';

const updateServiceWorker = vi.fn(() => Promise.resolve());
let needRefresh = false;

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  }),
}));

describe('UpdatePrompt', () => {
  beforeEach(() => {
    updateServiceWorker.mockClear();
  });

  it('renders nothing while the app is up to date', () => {
    needRefresh = false;
    const { container } = render(<UpdatePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('offers a reload once a new version is available', async () => {
    needRefresh = true;
    render(<UpdatePrompt />);
    expect(screen.getByText('Neue Version verfügbar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Neu laden' }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
