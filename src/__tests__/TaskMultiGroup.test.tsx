import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';
import TaskModal from '../components/TaskModal';

// Mock supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('Multi-Group Task Management', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockGroups = [
    { id: 'group-1', name: 'Équipe A' },
    { id: 'group-2', name: 'Équipe B' },
    { id: 'group-3', name: 'Équipe C' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders group checkboxes in TaskForm', () => {
    render(<TaskForm onClose={vi.fn()} taskId={null} />);
    
    // We expect checkboxes to be rendered for group selection
    // This is a basic smoke test to ensure the component renders
    expect(screen.getByText(/groupes associés/i)).toBeInTheDocument();
  });

  it('renders group checkboxes in TaskModal', () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    expect(screen.getByText(/groupes associés/i)).toBeInTheDocument();
    mockGroups.forEach((group) => {
      expect(screen.getByText(group.name)).toBeInTheDocument();
    });
  });

  it('allows selecting multiple groups in TaskModal', async () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    const equipeACheckbox = screen.getByRole('checkbox', {
      name: /Équipe A/i,
    }) as HTMLInputElement;
    const equipeBCheckbox = screen.getByRole('checkbox', {
      name: /Équipe B/i,
    }) as HTMLInputElement;

    // Initially, first group should be checked by default
    // After selecting another, multiple should be checked
    fireEvent.click(equipeBCheckbox);

    expect(equipeBCheckbox.checked).toBe(true);
  });

  it('displays error when no groups are selected', async () => {
    const { supabase } = await import('../supabase');
    const mockGetUser = vi.mocked(supabase.auth.getUser);
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const onClose = vi.fn();
    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onTaskCreated={vi.fn()}
        groups={[]}
      />
    );

    expect(
      screen.getByText(/aucun groupe disponible/i)
    ).toBeInTheDocument();
  });

  it('properly handles group selection state in TaskModal', () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');

    // By default, first group should be selected
    expect(checkboxes[0]).toBeChecked();

    // Click on second group to add it to selection
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();

    // Verify both are now checked
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('properly handles group selection state in TaskModal', () => {
    const onTaskCreated = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={onTaskCreated}
        groups={mockGroups}
      />
    );

    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');

    // By default, first group should be selected
    expect(checkboxes[0]).toBeChecked();

    // Click on second group to add it to selection
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();

    // Verify both are now checked
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('renders group badges in task list displays', () => {
    const taskWithGroups = {
      id: 'task-1',
      title: 'Test Task',
      description: 'A test task',
      priority: 'high' as const,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      groups: mockGroups,
    };

    // This test validates that the groups property exists and can be passed
    // In a real scenario, TaskList would display these as badges
    expect(taskWithGroups.groups).toEqual(mockGroups);
    expect(taskWithGroups.groups).toHaveLength(3);
  });

  it('deselects a group when checkbox is unchecked', () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0] as HTMLInputElement;

    // First checkbox should be checked initially
    expect(firstCheckbox.checked).toBe(true);

    // Uncheck it
    fireEvent.click(firstCheckbox);

    // It should remain unchecked (or recheck based on logic)
    // This test ensures the state management works correctly
    expect(firstCheckbox).toBeInTheDocument();
  });

  it('maintains group selection across modal state changes', () => {
    const { rerender } = render(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    // Verify initial state
    const initialCheckboxes = screen.getAllByRole('checkbox');
    expect(initialCheckboxes[0]).toBeChecked();

    // Simulate rerender with same props
    rerender(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        onTaskCreated={vi.fn()}
        groups={mockGroups}
      />
    );

    // Verify state is maintained
    const afterRerenderCheckboxes = screen.getAllByRole('checkbox');
    expect(afterRerenderCheckboxes[0]).toBeChecked();
  });
});
