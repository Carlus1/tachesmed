import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RoleBadge from '../components/RoleBadge';

describe('RoleBadge', () => {
  it('does not render when role is undefined or null', () => {
    const { container } = render(<RoleBadge role={undefined} /> as any);
    expect(container).toBeEmptyDOMElement();

    const { container: c2 } = render(<RoleBadge role={null} /> as any);
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders Owner variant with correct label and class', () => {
    render(<RoleBadge role="owner" />);
    const el = screen.getByText('Owner');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('bg-primary-600');
    expect(el.className).toContain('text-white');
  });

  it('renders Admin variant with correct label and class', () => {
    render(<RoleBadge role="admin" />);
    const el = screen.getByText('Admin');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('bg-accent-600');
    expect(el.className).toContain('text-white');
  });

  it('renders User variant with correct label and class', () => {
    render(<RoleBadge role="user" />);
    const el = screen.getByText('User');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('bg-primary-100');
  });
});
