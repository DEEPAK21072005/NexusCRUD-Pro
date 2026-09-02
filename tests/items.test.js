import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { itemRepository } from '../src/repositories/itemRepository.js';

describe('NexusCRUD Pro API Integration Tests', () => {
  beforeEach(async () => {
    await itemRepository.resetData();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 and healthy status information', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(res.body.data.nodeVersion).toBeDefined();
    });
  });

  describe('GET /api/v1/items', () => {
    it('should retrieve a paginated list of items with default pagination metadata', async () => {
      const res = await request(app).get('/api/v1/items');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.pagination).toBeDefined();
      expect(res.body.meta.pagination.currentPage).toBe(1);
    });

    it('should filter items by category', async () => {
      const res = await request(app).get('/api/v1/items?category=Hardware');
      expect(res.status).toBe(200);
      expect(res.body.data.every((i) => i.category === 'Hardware')).toBe(true);
    });

    it('should search items by keyword query', async () => {
      const res = await request(app).get('/api/v1/items?q=OLED');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('OLED');
    });

    it('should sort items by price in ascending order', async () => {
      const res = await request(app).get('/api/v1/items?sortBy=price&sortOrder=asc');
      expect(res.status).toBe(200);
      const prices = res.body.data.map((i) => i.price);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });
  });

  describe('GET /api/v1/items/:id', () => {
    it('should return a single item by valid ID', async () => {
      const res = await request(app).get('/api/v1/items/item_pro_01');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('item_pro_01');
      expect(res.body.data.name).toBe('Quantum Edge Server X1');
    });

    it('should return 404 for a non-existent item ID', async () => {
      const res = await request(app).get('/api/v1/items/non_existing_999');
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('POST /api/v1/items', () => {
    it('should successfully create a new item with valid data', async () => {
      const newItem = {
        name: 'Neural Accelerator Core V9',
        description: 'Next generation tensor computing processor',
        category: 'Hardware',
        price: 1299.99,
        stock: 25,
        status: 'active',
        priority: 'high',
        tags: ['AI', 'Silicon', 'NPU'],
        isFavorite: true,
      };

      const res = await request(app).post('/api/v1/items').send(newItem);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe(newItem.name);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.version).toBe(1);
    });

    it('should return 422 if required name is missing', async () => {
      const res = await request(app).post('/api/v1/items').send({
        description: 'Missing name',
        price: 100,
      });
      expect(res.status).toBe(422);
      expect(res.body.status).toBe('fail');
    });

    it('should return 409 if creating an item with duplicate name', async () => {
      const res = await request(app).post('/api/v1/items').send({
        name: 'Quantum Edge Server X1',
        category: 'Hardware',
      });
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('PUT /api/v1/items/:id', () => {
    it('should update an existing item and increment version', async () => {
      const updateData = {
        name: 'Quantum Edge Server X1 Enterprise Edition',
        price: 4999.00,
        status: 'active',
      };

      const res = await request(app).put('/api/v1/items/item_pro_01').send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(updateData.name);
      expect(res.body.data.price).toBe(4999.00);
      expect(res.body.data.version).toBe(2);
    });
  });

  describe('PATCH /api/v1/items/:id', () => {
    it('should partially update item fields', async () => {
      const res = await request(app).patch('/api/v1/items/item_pro_01').send({
        isFavorite: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.isFavorite).toBe(false);
    });
  });

  describe('DELETE /api/v1/items/:id', () => {
    it('should delete an existing item and return 200', async () => {
      const res = await request(app).delete('/api/v1/items/item_pro_01');
      expect(res.status).toBe(200);

      const checkRes = await request(app).get('/api/v1/items/item_pro_01');
      expect(checkRes.status).toBe(404);
    });
  });

  describe('POST /api/v1/items/bulk-delete', () => {
    it('should batch delete multiple items by ID', async () => {
      const res = await request(app)
        .post('/api/v1/items/bulk-delete')
        .send({ ids: ['item_pro_02', 'item_pro_03'] });
      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(2);
    });
  });

  describe('GET /api/v1/items/stats/summary', () => {
    it('should calculate aggregate inventory statistics', async () => {
      const res = await request(app).get('/api/v1/items/stats/summary');
      expect(res.status).toBe(200);
      expect(res.body.data.totalItems).toBe(5);
      expect(res.body.data.totalValuation).toBeGreaterThan(0);
      expect(res.body.data.categoryBreakdown).toBeDefined();
    });
  });

  describe('GET /api/v1/items/export', () => {
    it('should export items as JSON by default', async () => {
      const res = await request(app).get('/api/v1/items/export?format=json');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should export items as CSV formatted attachment', async () => {
      const res = await request(app).get('/api/v1/items/export?format=csv');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('ID,Name,Category,Price');
    });
  });
});
