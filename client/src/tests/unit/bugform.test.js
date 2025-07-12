import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugForm from '../../components/BugForm';

describe('BugForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders form with all required fields', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reported by/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
  });

  test('displays correct title for editing mode', () => {
    const initialData = {
      title: 'Test Bug',
      description: 'Test Description',
      reportedBy: 'Test User'
    };

    render(<BugForm onSubmit={mockOnSubmit} initialData={initialData} isEditing={true} />);
    
    expect(screen.getByText('Edit Bug')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update bug/i })).toBeInTheDocument();
  });

  test('populates form with initial data when editing', () => {
    const initialData = {
      title: 'Test Bug',
      description: 'Test Description',
      reportedBy: 'Test User',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Developer'
    };

    render(<BugForm onSubmit={mockOnSubmit} initialData={initialData} isEditing={true} />);
    
    expect(screen.getByDisplayValue('Test Bug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();
    
    // Check select values
    const prioritySelect = screen.getByLabelText(/priority/i);
    const statusSelect = screen.getByLabelText(/status/i);
    expect(prioritySelect.value).toBe('high');
    expect(statusSelect.value).toBe('in-progress');
  });

  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Reporter name is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    // Trigger validation errors
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    
    // Start typing in title field
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test');
    
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue();
    
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.type(screen.getByLabelText(/assigned to/i), 'Developer');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Bug',
        description: 'Test Description',
        reportedBy: 'Test User',
        priority: 'high',
        status: 'open',
        assignedTo: 'Developer'
      });
    });
  });

  test('resets form after successful submission when not editing', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue();
    
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const reportedByInput = screen.getByLabelText(/reported by/i);
    
    await user.type(titleInput, 'Test Bug');
    await user.type(descriptionInput, 'Test Description');
    await user.type(reportedByInput, 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      expect(reportedByInput.value).toBe('');
    });
  });

  test('does not reset form after successful submission when editing', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue();
    
    const initialData = {
      title: 'Test Bug',
      description: 'Test Description',
      reportedBy: 'Test User'
    };
    
    render(<BugForm onSubmit={mockOnSubmit} initialData={initialData} isEditing={true} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Bug');
    
    const submitButton = screen.getByRole('button', { name: /update bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput.value).toBe('Updated Bug');
    });
  });

  test('shows error message when submission fails', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Network error'));
    
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    mockOnSubmit.mockImplementation(() => new Promise(resolve => {
      resolveSubmit = resolve;
    }));
    
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    
    resolveSubmit();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /report bug/i })).not.toBeDisabled();
    });
  });

  test('enforces maximum length for title and description', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    expect(titleInput).toHaveAttribute('maxLength', '100');
    expect(descriptionInput).toHaveAttribute('maxLength', '1000');
  });

  test('shows status field only when editing', () => {
    const { rerender } = render(<BugForm onSubmit={mockOnSubmit} />);
    
    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    
    rerender(<BugForm onSubmit={mockOnSubmit} isEditing={true} />);
    
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  test('handles form field changes correctly', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    
    await user.type(titleInput, 'New Bug Title');
    await user.selectOptions(prioritySelect, 'critical');
    
    expect(titleInput.value).toBe('New Bug Title');
    expect(prioritySelect.value).toBe('critical');
  });
});
