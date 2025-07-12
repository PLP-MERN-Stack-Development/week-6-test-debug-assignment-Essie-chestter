import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugList from '../../components/BugList';

describe('BugList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const sampleBugs = [
    {
      _id: '1',
      title: 'Bug 1',
      description: 'Description 1',
      status: 'open',
      priority: 'high',
      reportedBy: 'User 1',
      assignedTo: 'Developer 1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Bug 2',
      description: 'Description 2',
      status: 'in-progress',
      priority: 'medium',
      reportedBy: 'User 2',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  test('renders loading state', () => {
    render(<BugList bugs={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={true} />);
    
    expect(screen.getByText('Loading bugs...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to fetch bugs';
    render(<BugList bugs={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} error={errorMessage} />);
    
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders empty state when no bugs exist', () => {
    render(<BugList bugs={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('No bugs reported yet')).toBeInTheDocument();
    expect(screen.getByText('Start by reporting your first bug using the form above.')).toBeInTheDocument();
  });

  test('renders bug list with correct count', () => {
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
  });

  test('renders bug cards with all information', () => {
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // Check first bug
    expect(screen.getByText('Bug 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('Developer 1')).toBeInTheDocument();
    
    // Check second bug
    expect(screen.getByText('Bug 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('in-progress')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  test('applies correct CSS classes for priority badges', () => {
    const bugsWithDifferentPriorities = [
      { ...sampleBugs[0], priority: 'critical' },
      { ...sampleBugs[0], _id: '2', priority: 'high' },
      { ...sampleBugs[0], _id: '3', priority: 'medium' },
      { ...sampleBugs[0], _id: '4', priority: 'low' }
    ];

    render(<BugList bugs={bugsWithDifferentPriorities} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const criticalBadge = screen.getByText('critical');
    const highBadge = screen.getByText('high');
    const mediumBadge = screen.getByText('medium');
    const lowBadge = screen.getByText('low');
    
    expect(criticalBadge).toHaveClass('priority-critical');
    expect(highBadge).toHaveClass('priority-high');
    expect(mediumBadge).toHaveClass('priority-medium');
    expect(lowBadge).toHaveClass('priority-low');
  });

  test('applies correct CSS classes for status badges', () => {
    const bugsWithDifferentStatuses = [
      { ...sampleBugs[0], status: 'open' },
      { ...sampleBugs[0], _id: '2', status: 'in-progress' },
      { ...sampleBugs[0], _id: '3', status: 'resolved' }
    ];

    render(<BugList bugs={bugsWithDifferentStatuses} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const openBadge = screen.getByText('open');
    const inProgressBadge = screen.getByText('in-progress');
    const resolvedBadge = screen.getByText('resolved');
    
    expect(openBadge).toHaveClass('status-open');
    expect(inProgressBadge).toHaveClass('status-in-progress');
    expect(resolvedBadge).toHaveClass('status-resolved');
  });

  test('formats dates correctly', () => {
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    // Check that dates are formatted (exact format may vary based on locale)
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  test('shows updated date only when different from created date', () => {
    const bugWithSameDates = {
      ...sampleBugs[0],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };

    render(<BugList bugs={[bugWithSameDates]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const updatedTexts = screen.queryAllByText(/Updated:/);
    expect(updatedTexts).toHaveLength(0);
  });

  test('does not show assigned to field when not assigned', () => {
    const unassignedBug = {
      ...sampleBugs[0],
      assignedTo: undefined
    };

    render(<BugList bugs={[unassignedBug]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(sampleBugs[0]);
  });

  test('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(sampleBugs[0]._id);
  });

  test('edit and delete buttons have correct aria-labels', () => {
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByLabelText('Edit bug: Bug 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete bug: Bug 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit bug: Bug 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete bug: Bug 2')).toBeInTheDocument();
  });

  test('handles bugs without optional fields gracefully', () => {
    const minimalBug = {
      _id: '1',
      title: 'Minimal Bug',
      description: 'Minimal Description',
      status: 'open',
      priority: 'medium',
      reportedBy: 'User',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };

    render(<BugList bugs={[minimalBug]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Minimal Bug')).toBeInTheDocument();
    expect(screen.getByText('Minimal Description')).toBeInTheDocument();
    expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument();
  });

  test('renders multiple bugs correctly', () => {
    render(<BugList bugs={sampleBugs} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });
});
