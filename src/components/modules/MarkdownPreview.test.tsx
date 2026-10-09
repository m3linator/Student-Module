import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

describe('MarkdownPreview', () => {
  it('renders headings, lists, task lists, code and links', () => {
    render(
      <MarkdownPreview
        source={'# Titel\n\n- Punkt\n- [x] erledigt\n\n`code`\n\n[Moodle](https://moodle.example)'}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Titel' })).toBeInTheDocument();
    expect(screen.getByText('Punkt')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('code').tagName).toBe('CODE');
    const link = screen.getByRole('link', { name: 'Moodle' });
    expect(link).toHaveAttribute('href', 'https://moodle.example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('never renders raw HTML or javascript: links', () => {
    const { container } = render(
      <MarkdownPreview
        source={
          '<script>alert(1)</script><img src=x onerror=alert(1)>\n\n[böse](javascript:alert(1))'
        }
      />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('böse').getAttribute('href') ?? '').not.toMatch(/javascript/i);
  });

  it('shows a hint for empty notes', () => {
    render(<MarkdownPreview source="  " />);
    expect(screen.getByText('Noch keine Notizen.')).toBeInTheDocument();
  });
});
