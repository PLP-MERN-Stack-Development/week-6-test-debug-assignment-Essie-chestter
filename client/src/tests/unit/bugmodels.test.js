const Bug = require('../../src/models/Bug');

describe('Bug Model Unit Tests', () => {
  test('should create a valid bug with required fields', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    const savedBug = await bug.save();

    expect(savedBug._id).toBeDefined();
    expect(savedBug.title).toBe(bugData.title);
    expect(savedBug.description).toBe(bugData.description);
    expect(savedBug.reportedBy).toBe(bugData.reportedBy);
    expect(savedBug.status).toBe('open'); // default value
    expect(savedBug.priority).toBe('medium'); // default value
    expect(savedBug.createdAt).toBeDefined();
    expect(savedBug.updatedAt).toBeDefined();
  });

  test('should create a bug with all fields', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reportedBy: 'John Doe',
      assignedTo: 'Jane Smith',
      status: 'in-progress',
      priority: 'high'
    };

    const bug = new Bug(bugData);
    const savedBug = await bug.save();

    expect(savedBug.title).toBe(bugData.title);
    expect(savedBug.description).toBe(bugData.description);
    expect(savedBug.reportedBy).toBe(bugData.reportedBy);
    expect(savedBug.assignedTo).toBe(bugData.assignedTo);
    expect(savedBug.status).toBe(bugData.status);
    expect(savedBug.priority).toBe(bugData.priority);
  });

  test('should fail validation when title is missing', async () => {
    const bugData = {
      description: 'This is a test bug description',
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should fail validation when description is missing', async () => {
    const bugData = {
      title: 'Test Bug',
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should fail validation when reportedBy is missing', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should fail validation for invalid status', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reportedBy: 'John Doe',
      status: 'invalid-status'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should fail validation for invalid priority', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reportedBy: 'John Doe',
      priority: 'invalid-priority'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should trim whitespace from string fields', async () => {
    const bugData = {
      title: '  Test Bug  ',
      description: '  This is a test bug description  ',
      reportedBy: '  John Doe  ',
      assignedTo: '  Jane Smith  '
    };

    const bug = new Bug(bugData);
    const savedBug = await bug.save();

    expect(savedBug.title).toBe('Test Bug');
    expect(savedBug.description).toBe('This is a test bug description');
    expect(savedBug.reportedBy).toBe('John Doe');
    expect(savedBug.assignedTo).toBe('Jane Smith');
  });

  test('should enforce maximum length for title', async () => {
    const longTitle = 'a'.repeat(101); // 101 characters
    const bugData = {
      title: longTitle,
      description: 'This is a test bug description',
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should enforce maximum length for description', async () => {
    const longDescription = 'a'.repeat(1001); // 1001 characters
    const bugData = {
      title: 'Test Bug',
      description: longDescription,
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    
    await expect(bug.save()).rejects.toThrow();
  });

  test('should update updatedAt field on save', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reportedBy: 'John Doe'
    };

    const bug = new Bug(bugData);
    const savedBug = await bug.save();
    const originalUpdatedAt = savedBug.updatedAt;

    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    savedBug.title = 'Updated Test Bug';
    const updatedBug = await savedBug.save();

    expect(updatedBug.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  test('should accept valid status values', async () => {
    const validStatuses = ['open', 'in-progress', 'resolved'];
    
    for (const status of validStatuses) {
      const bugData = {
        title: `Test Bug ${status}`,
        description: 'This is a test bug description',
        reportedBy: 'John Doe',
        status: status
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();
      
      expect(savedBug.status).toBe(status);
    }
  });

  test('should accept valid priority values', async () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    
    for (const priority of validPriorities) {
      const bugData = {
        title: `Test Bug ${priority}`,
        description: 'This is a test bug description',
        reportedBy: 'John Doe',
        priority: priority
      };

      const bug = new Bug(bugData);
      const savedBug = await bug.save();
      
      expect(savedBug.priority).toBe(priority);
    }
  });
});
