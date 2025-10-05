import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ModernHeader from '../components/ModernHeader';

describe('smoke', () => {
  it('renders header without crashing', () => {
    const user = { id: '1', email: 'test@example.com' } as any;
    const { getByText } = render(<ModernHeader user={user} onToggleSidebar={() => {}} onToggleDark={() => {}} dark={false} />);
    expect(getByText(/TachesMed/)).toBeTruthy();
  });
});
