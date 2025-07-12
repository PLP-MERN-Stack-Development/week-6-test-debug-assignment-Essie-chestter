import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../../components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    console.error.mockClear();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We're sorry, but something unexpected happened.")).toBeInTheDocument();
  });

  test('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error Details (Development Mode)')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Error Details (Development Mode)')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('logs error to console when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  test('resets error state when try again button is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    
    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  test('reloads page when reload button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByText('Reload Page');
    await user.click(reloadButton);
    
    expect(window.location.reload).toHaveBeenCalled();
    
    // Restore original reload function
    window.location.reload = originalReload;
  });

  test('displays error message in error details', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const details = screen.getByText('Error Details (Development Mode)');
    fireEvent.click(details);
    
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('maintains error state after multiple renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    
    // Re-render the same error boundary
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  test('catches errors from deeply nested components', () => {
    const DeepComponent = () => (
      <div>
        <div>
          <div>
            <ThrowError shouldThrow={true} />
          </div>
        </div>
      </div>
    );
    
    render(
      <ErrorBoundary>
        <DeepComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  test('does not catch errors from event handlers', () => {
    const ComponentWithEventHandler = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };
      
      return <button onClick={handleClick}>Click me</button>;
    };
    
    render(
      <ErrorBoundary>
        <ComponentWithEventHandler />
      </ErrorBoundary>
    );
    
    const button = screen.getByText('Click me');
    
    // Error boundaries don't catch errors in event handlers
    expect(() => {
      fireEvent.click(button);
    }).toThrow('Event handler error');
    
    // Error boundary should not show error UI
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  test('renders action buttons with correct text', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });
});

