import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the bugService
jest.mock('../../services/bugService', () => ({
  getAllBugs: jest.fn(),
  createBug: jest.fn(),
  updateBug: jest.fn(),
  deleteBug: jest.fn()
}));

import bugService from '../../services/bugService';

// Mock window.confirm and window.alert
global.confirm = jest.fn();
global.alert = jest.fn();

describe('App Integration Tests', () => {
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
    jest.clearAllMocks();
    bugService.getAllBugs.mockResolvedValue(sampleBugs);
    global.confirm.mockReturnValue(true);
    global.alert.mockImplementation(() => {});
  });

  test('renders app header and main sections', async () => {
    render(<App />);
    
    expect(screen.getByText('Bug Tracker')).toBeInTheDocument();
    expect(screen.getByText('Track and manage software bugs efficiently')).toBeInTheDocument();
    expect(screen.getByText('Bug Tracker - MERN Testing & Debugging Demo')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
  });

  test('loads and displays bugs on initial render', async () => {
    render(<App />);
    
    expect(bugService.getAllBugs).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Bug 2')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    bugService.getAllBugs.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows error state when loading fails', async () => {
    const errorMessage = 'Failed to fetch bugs';
    bugService.getAllBugs.mockRejectedValue(new Error(errorMessage));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test('toggles form visibility when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Form should be visible initially
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    
    // Hide form
    const toggleButton = screen.getByText('Hide Form');
    await user.click(toggleButton);
    
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    expect(screen.getByText('Report New Bug')).toBeInTheDocument();
    
    // Show form again
    const showButton = screen.getByText('Report New Bug');
    await user.click(showButton);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByText('Hide Form')).toBeInTheDocument();
  });

  test('creates new bug successfully', async () => {
    const user = userEvent.setup();
    const newBug = {
      _id: '3',
      title: 'New Bug',
      description: 'New Description',
      status: 'open',
      priority: 'medium',
      reportedBy: 'Test User',
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z'
    };
    
    bugService.createBug.mockResolvedValue(newBug);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'New Bug');
    await user.type(screen.getByLabelText(/description/i), 'New Description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(bugService.createBug).toHaveBeenCalledWith({
        title: 'New Bug',
        description: 'New Description',
        reportedBy: 'Test User',
        priority: 'medium',
        status: 'open',
        assignedTo: ''
      });
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bug reported successfully!');
  });

  test('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Click edit button for first bug
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    // Form should be visible and populated
    expect(screen.getByDisplayValue('Bug 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Edit Bug')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update bug/i })).toBeInTheDocument();
    
    // Cancel edit button should be visible
    expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
  });

  test('updates bug successfully', async () => {
    const user = userEvent.setup();
    const updatedBug = {
      ...sampleBugs[0],
      title: 'Updated Bug 1',
      description: 'Updated Description 1'
    };
    
    bugService.updateBug.mockResolvedValue(updatedBug);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    // Update form fields
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Bug 1');
    
    // Submit update
    const updateButton = screen.getByRole('button', { name: /update bug/i });
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(bugService.updateBug).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Bug 1'
      }));
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bug updated successfully!');
  });

  test('cancels edit mode when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Enter edit mode
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    expect(screen.getByText('Edit Bug')).toBeInTheDocument();
    
    // Cancel edit
    const cancelButton = screen.getByText('Cancel Edit');
    await user.click(cancelButton);
    
    expect(screen.queryByText('Edit Bug')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel Edit')).not.toBeInTheDocument();
  });

  test('deletes bug successfully after confirmation', async () => {
    const user = userEvent.setup();
    bugService.deleteBug.mockResolvedValue({ message: 'Bug deleted successfully' });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this bug?');
    
    await waitFor(() => {
      expect(bugService.deleteBug).toHaveBeenCalledWith('1');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Bug deleted successfully!');
  });

  test('does not delete bug when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    global.confirm.mockReturnValue(false);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this bug?');
    expect(bugService.deleteBug).not.toHaveBeenCalled();
  });

  test('refreshes bug list when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    expect(bugService.getAllBugs).toHaveBeenCalledTimes(1);
    
    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    
    expect(bugService.getAllBugs).toHaveBeenCalledTimes(2);
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    bugService.createBug.mockRejectedValue(new Error('Network error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/title/i), 'New Bug');
    await user.type(screen.getByLabelText(/description/i), 'New Description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    // Error should be displayed in form
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('shows delete error when delete fails', async () => {
    const user = userEvent.setup();
    bugService.deleteBug.mockRejectedValue(new Error('Delete failed'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug Reports (2)')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to delete bug: Delete failed');
    });
  });
});
