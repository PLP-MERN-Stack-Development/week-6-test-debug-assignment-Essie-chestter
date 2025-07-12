import React, { useState, useEffect } from 'react';
import BugForm from './components/BugForm';
import BugList from './components/BugList';
import ErrorBoundary from './components/ErrorBoundary';
import DebugPanel from './components/DebugPanel';
import bugService from './services/bugService';
import DebugLogger from './utils/debugLogger';
import './App.css';

const logger = new DebugLogger('App');

function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBug, setEditingBug] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    logger.logComponentMount('App');
    loadBugs();
    
    return () => {
      logger.logComponentUnmount('App');
    };
  }, []);

  const loadBugs = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.logUserAction('Load Bugs');
      
      const bugsData = await bugService.getAllBugs();
      setBugs(bugsData);
      logger.log('Bugs loaded successfully', { count: bugsData.length });
    } catch (err) {
      setError(err.message);
      logger.error('Failed to load bugs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBug = async (bugData) => {
    try {
      logger.logUserAction('Create Bug', bugData);
      const newBug = await bugService.createBug(bugData);
      setBugs(prev => [newBug, ...prev]);
      setShowForm(false);
      
      logger.log('Bug created successfully', newBug);
      alert('Bug reported successfully!');
    } catch (err) {
      logger.error('Failed to create bug', err);
      throw err;
    }
  };

  const handleUpdateBug = async (bugData) => {
    try {
      logger.logUserAction('Update Bug', { id: editingBug._id, data: bugData });
      const updatedBug = await bugService.updateBug(editingBug._id, bugData);
      setBugs(prev => prev.map(bug => 
        bug._id === editingBug._id ? updatedBug : bug
      ));
      setEditingBug(null);
      setShowForm(false);
      
      logger.log('Bug updated successfully', updatedBug);
      alert('Bug updated successfully!');
    } catch (err) {
      logger.error('Failed to update bug', err);
      throw err;
    }
  };

  const handleEditBug = (bug) => {
    logger.logUserAction('Edit Bug', { id: bug._id });
    setEditingBug(bug);
    setShowForm(true);
  };

  const handleDeleteBug = async (bugId) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      logger.logUserAction('Delete Bug', { id: bugId });
      await bugService.deleteBug(bugId);
      setBugs(prev => prev.filter(bug => bug._id !== bugId));
      
      logger.log('Bug deleted successfully', { id: bugId });
      alert('Bug deleted successfully!');
    } catch (err) {
      logger.error('Failed to delete bug', err);
      alert('Failed to delete bug: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    logger.logUserAction('Cancel Edit');
    setEditingBug(null);
    setShowForm(false);
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="app-header">
          <h1>Bug Tracker</h1>
          <p>Track and manage software bugs efficiently</p>
        </header>

        <main className="app-main">
          <div className="form-section">
            <div className="form-controls">
              <button 
                onClick={() => {
                  setShowForm(!showForm);
                  logger.logUserAction('Toggle Form', { showForm: !showForm });
                }}
                className="toggle-form-button"
              >
                {showForm ? 'Hide Form' : 'Report New Bug'}
              </button>
              
              {editingBug && (
                <button 
                  onClick={handleCancelEdit}
                  className="cancel-edit-button"
                >
                  Cancel Edit
                </button>
              )}
              
              <button 
                onClick={() => {
                  loadBugs();
                  logger.logUserAction('Refresh Bugs');
                }}
                className="refresh-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {showForm && (
              <BugForm
                onSubmit={editingBug ? handleUpdateBug : handleCreateBug}
                initialData={editingBug}
                isEditing={!!editingBug}
              />
            )}
          </div>

          <div className="list-section">
            <BugList
              bugs={bugs}
              onEdit={handleEditBug}
              onDelete={handleDeleteBug}
              loading={loading}
              error={error}
            />
          </div>
        </main>

        <footer className="app-footer">
          <p>Bug Tracker - MERN Testing & Debugging Demo</p>
        </footer>

        {/* Debug Panel - only shows in development */}
        <DebugPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;
