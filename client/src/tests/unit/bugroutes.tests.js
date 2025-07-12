const request = require('supertest');
const app = require('../../src/app.test');
const Bug = require('../../src/models/Bug');

describe('Bug Routes Integration Tests', () => {
  describe('GET /api/bugs', () => {
    test('should return empty array when no bugs exist', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all bugs', async () => {
      // Create test bugs
      const bug1 = await Bug.create({
        title: 'Bug 1',
        description: 'Description 1',
        reportedBy: 'User 1'
      });

      const bug2 = await Bug.create({
        title: 'Bug 2',
        description: 'Description 2',
        reportedBy: 'User 2',
        priority: 'high'
      });

      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Bug 2'); // Should be sorted by createdAt desc
      expect(response.body[1].title).toBe('Bug 1');
    });
  });

  describe('GET /api/bugs/:id', () => {
    test('should return a specific bug', async () => {
      const bug = await Bug.create({
        title: 'Test Bug',
        description: 'Test Description',
        reportedBy: 'Test User'
      });

      const response = await request(app)
        .get(`/api/bugs/${bug._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Bug');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.reportedBy).toBe('Test User');
    });

    test('should return 404 for non-existent bug', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Bug not found');
    });

    test('should return 400 for invalid bug ID', async () => {
      const response = await request(app)
        .get('/api/bugs/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format');
    });
  });

  describe('POST /api/bugs', () => {
    test('should create a new bug with valid data', async () => {
      const bugData = {
        title: 'New Bug',
        description: 'New bug description',
        reportedBy: 'Test User',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(bugData)
        .expect(201);

      expect(response.body.title).toBe(bugData.title);
      expect(response.body.description).toBe(bugData.description);
      expect(response.body.reportedBy).toBe(bugData.reportedBy);
      expect(response.body.priority).toBe(bugData.priority);
      expect(response.body.status).toBe('open'); // default value
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      // Verify bug was saved to database
      const savedBug = await Bug.findById(response.body._id);
      expect(savedBug).toBeTruthy();
      expect(savedBug.title).toBe(bugData.title);
    });

    test('should return 400 when required fields are missing', async () => {
      const invalidData = {
        description: 'Missing title and reportedBy'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Title is required');
      expect(response.body.errors).toContain('Reporter name is required');
    });

    test('should return 400 for invalid status', async () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'Test Description',
        reportedBy: 'Test User',
        status: 'invalid-status'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Invalid status value');
    });

    test('should return 400 for invalid priority', async () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'Test Description',
        reportedBy: 'Test User',
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Invalid priority value');
    });
  });

  describe('PUT /api/bugs/:id', () => {
    test('should update an existing bug', async () => {
      const bug = await Bug.create({
        title: 'Original Bug',
        description: 'Original Description',
        reportedBy: 'Test User'
      });

      const updateData = {
        title: 'Updated Bug',
        description: 'Updated Description',
        reportedBy: 'Test User',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 'Developer'
      };

      const response = await request(app)
        .put(`/api/bugs/${bug._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.priority).toBe(updateData.priority);
      expect(response.body.assignedTo).toBe(updateData.assignedTo);

      // Verify bug was updated in database
      const updatedBug = await Bug.findById(bug._id);
      expect(updatedBug.title).toBe(updateData.title);
      expect(updatedBug.status).toBe(updateData.status);
    });

    test('should return 404 for non-existent bug', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Bug',
        description: 'Updated Description',
        reportedBy: 'Test User'
      };

      const response = await request(app)
        .put(`/api/bugs/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Bug not found');
    });

    test('should return 400 for invalid update data', async () => {
      const bug = await Bug.create({
        title: 'Test Bug',
        description: 'Test Description',
        reportedBy: 'Test User'
      });

      const invalidData = {
        title: '',
        description: '',
        reportedBy: ''
      };

      const response = await request(app)
        .put(`/api/bugs/${bug._id}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Title is required');
      expect(response.body.errors).toContain('Description is required');
      expect(response.body.errors).toContain('Reporter name is required');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    test('should delete an existing bug', async () => {
      const bug = await Bug.create({
        title: 'Bug to Delete',
        description: 'This bug will be deleted',
        reportedBy: 'Test User'
      });

      const response = await request(app)
        .delete(`/api/bugs/${bug._id}`)
        .expect(200);

      expect(response.body.message).toBe('Bug deleted successfully');

      // Verify bug was deleted from database
      const deletedBug = await Bug.findById(bug._id);
      expect(deletedBug).toBeNull();
    });

    test('should return 404 for non-existent bug', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Bug not found');
    });

    test('should return 400 for invalid bug ID', async () => {
      const response = await request(app)
        .delete('/api/bugs/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format');
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });
  });
});
