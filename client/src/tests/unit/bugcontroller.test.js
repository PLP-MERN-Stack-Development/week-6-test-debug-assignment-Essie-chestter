const Bug = require('../models/Bug');

// Helper function for validation
const validateBugData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!data.reportedBy || data.reportedBy.trim().length === 0) {
    errors.push('Reporter name is required');
  }
  
  if (data.status && !['open', 'in-progress', 'resolved'].includes(data.status)) {
    errors.push('Invalid status value');
  }
  
  if (data.priority && !['low', 'medium', 'high', 'critical'].includes(data.priority)) {
    errors.push('Invalid priority value');
  }
  
  return errors;
};

// Get all bugs
const getAllBugs = async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 });
    res.json(bugs);
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
};

// Get a single bug by ID
const getBugById = async (req, res) => {
  try {
    // Check if ID is valid ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }
    res.json(bug);
  } catch (error) {
    console.error('Error fetching bug:', error);
    res.status(500).json({ error: 'Failed to fetch bug' });
  }
};

// Create a new bug
const createBug = async (req, res) => {
  try {
    const validationErrors = validateBugData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const bug = new Bug(req.body);
    const savedBug = await bug.save();
    res.status(201).json(savedBug);
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ error: 'Failed to create bug' });
  }
};

// Update a bug
const updateBug = async (req, res) => {
  try {
    // Check if ID is valid ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const validationErrors = validateBugData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }
    
    res.json(bug);
  } catch (error) {
    console.error('Error updating bug:', error);
    res.status(500).json({ error: 'Failed to update bug' });
  }
};

// Delete a bug
const deleteBug = async (req, res) => {
  try {
    // Check if ID is valid ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }
    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    console.error('Error deleting bug:', error);
    res.status(500).json({ error: 'Failed to delete bug' });
  }
};

module.exports = {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  validateBugData // Export for testing
};
