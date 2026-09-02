import { z } from 'zod';
import { ITEM_CATEGORIES, ITEM_STATUSES, ITEM_PRIORITIES } from '../constants/itemCategories.js';

export const createItemSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Item name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    description: z.string().trim().max(500, 'Description cannot exceed 500 characters').default(''),
    category: z.enum(ITEM_CATEGORIES, {
      errorMap: () => ({ message: `Category must be one of: ${ITEM_CATEGORIES.join(', ')}` }),
    }).default('Other'),
    price: z.coerce.number().min(0, 'Price must be greater than or equal to 0').default(0),
    stock: z.coerce.number().int().min(0, 'Stock must be 0 or positive').default(0),
    status: z.enum(ITEM_STATUSES).default('active'),
    priority: z.enum(ITEM_PRIORITIES).default('medium'),
    tags: z.array(z.string().trim()).default([]),
    isFavorite: z.boolean().default(false),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required in URL'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    category: z.enum(ITEM_CATEGORIES).optional(),
    price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    status: z.enum(ITEM_STATUSES).optional(),
    priority: z.enum(ITEM_PRIORITIES).optional(),
    tags: z.array(z.string().trim()).optional(),
    isFavorite: z.boolean().optional(),
  }),
});

export const patchItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required in URL'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    category: z.enum(ITEM_CATEGORIES).optional(),
    price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    status: z.enum(ITEM_STATUSES).optional(),
    priority: z.enum(ITEM_PRIORITIES).optional(),
    tags: z.array(z.string().trim()).optional(),
    isFavorite: z.boolean().optional(),
  }),
});

export const itemParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
});

export const queryItemSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.enum([...ITEM_CATEGORIES, 'all']).optional(),
    status: z.enum([...ITEM_STATUSES, 'all']).optional(),
    priority: z.enum([...ITEM_PRIORITIES, 'all']).optional(),
    isFavorite: z.enum(['true', 'false']).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'price', 'stock', 'priority']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string().min(1)).min(1, 'At least one ID must be provided'),
  }),
});

export const bulkCreateSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        name: z.string().trim().min(2).max(100),
        description: z.string().trim().max(500).default(''),
        category: z.enum(ITEM_CATEGORIES).default('Other'),
        price: z.coerce.number().min(0).default(0),
        stock: z.coerce.number().int().min(0).default(0),
        status: z.enum(ITEM_STATUSES).default('active'),
        priority: z.enum(ITEM_PRIORITIES).default('medium'),
        tags: z.array(z.string().trim()).default([]),
        isFavorite: z.boolean().default(false),
      })
    ).min(1, 'Items array cannot be empty'),
  }),
});
