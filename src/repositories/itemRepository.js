import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || false;
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'nexus_data')
  : path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = [
  {
    id: 'item_pro_01',
    name: 'Quantum Edge Server X1',
    description: 'High-density edge computing server with built-in hardware acceleration and neural engine.',
    category: 'Hardware',
    price: 3499.99,
    stock: 15,
    status: 'active',
    priority: 'urgent',
    tags: ['Edge', 'AI', 'Server', 'Hardware'],
    isFavorite: true,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'item_pro_02',
    name: 'Nexus API Gateway Pro',
    description: 'Ultra-low latency API gateway with distributed rate limiting, JWT validation, and GraphQL federation.',
    category: 'Software',
    price: 499.00,
    stock: 999,
    status: 'active',
    priority: 'high',
    tags: ['API', 'Gateway', 'Cloud', 'Microservices'],
    isFavorite: true,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item_pro_03',
    name: 'Aura OLED Studio Monitor 32"',
    description: '4K OLED reference display with 99.8% DCI-P3 color gamut and calibrated HDR1000 master grade.',
    category: 'Electronics',
    price: 1899.50,
    stock: 8,
    status: 'active',
    priority: 'medium',
    tags: ['Display', '4K', 'OLED', 'Design'],
    isFavorite: false,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'item_pro_04',
    name: 'Design System Figma UI Kit',
    description: 'Comprehensive enterprise design token suite with 450+ responsive components and dark mode variants.',
    category: 'Design',
    price: 129.00,
    stock: 500,
    status: 'active',
    priority: 'low',
    tags: ['UI', 'UX', 'Figma', 'Tokens'],
    isFavorite: false,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item_pro_05',
    name: 'Automated Growth Marketing Pipeline',
    description: 'AI-driven campaign orchestrator connecting LinkedIn, Meta Ads, and HubSpot CRM with auto-bidding.',
    category: 'Marketing',
    price: 799.00,
    stock: 50,
    status: 'pending',
    priority: 'high',
    tags: ['Marketing', 'Automation', 'AI', 'CRM'],
    isFavorite: false,
    version: 1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

class ItemRepository {
  constructor() {
    this.memoryItems = [];
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        this.memoryItems = [...INITIAL_DATA];
        this.saveToFile();
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.memoryItems = Array.isArray(parsed.items) ? parsed.items : [...INITIAL_DATA];
      }
    } catch (err) {
      this.memoryItems = [...INITIAL_DATA];
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify({ items: this.memoryItems }, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      // In read-only or serverless cold starts, memory state is preserved
    }
  }

  async findAll({
    q = '',
    category,
    status,
    priority,
    isFavorite,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    offset = 0,
    limit = 10,
  } = {}) {
    let result = [...this.memoryItems];

    if (q && q.trim() !== '') {
      const term = q.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(term)))
      );
    }

    if (category && category !== 'all') {
      result = result.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'all') {
      result = result.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    if (priority && priority !== 'all') {
      result = result.filter((item) => item.priority.toLowerCase() === priority.toLowerCase());
    }

    if (isFavorite !== undefined) {
      const boolVal = isFavorite === 'true' || isFavorite === true;
      result = result.filter((item) => item.isFavorite === boolVal);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      result = result.filter((item) => item.price >= minPrice);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      result = result.filter((item) => item.price <= maxPrice);
    }

    const totalCount = result.length;

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const paginated = result.slice(offset, offset + limit);

    return {
      items: paginated,
      totalCount,
    };
  }

  async findById(id) {
    return this.memoryItems.find((item) => item.id === id) || null;
  }

  async findByName(name) {
    return this.memoryItems.find((item) => item.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async create(data) {
    const now = new Date().toISOString();
    const newItem = {
      id: `item_${nanoid(10)}`,
      ...data,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryItems.unshift(newItem);
    this.saveToFile();
    return newItem;
  }

  async update(id, updateData) {
    const index = this.memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.memoryItems[index];
    const updated = {
      ...current,
      ...updateData,
      id: current.id,
      version: (current.version || 1) + 1,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.memoryItems[index] = updated;
    this.saveToFile();
    return updated;
  }

  async delete(id) {
    const index = this.memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const [deleted] = this.memoryItems.splice(index, 1);
    this.saveToFile();
    return deleted;
  }

  async bulkDelete(ids) {
    const set = new Set(ids);
    const initialLen = this.memoryItems.length;
    this.memoryItems = this.memoryItems.filter((item) => !set.has(item.id));
    const deletedCount = initialLen - this.memoryItems.length;
    this.saveToFile();
    return { deletedCount };
  }

  async bulkCreate(items) {
    const now = new Date().toISOString();
    const createdItems = items.map((item) => ({
      id: `item_${nanoid(10)}`,
      ...item,
      version: 1,
      createdAt: now,
      updatedAt: now,
    }));

    this.memoryItems = [...createdItems, ...this.memoryItems];
    this.saveToFile();
    return createdItems;
  }

  async getStats() {
    const totalItems = this.memoryItems.length;
    const activeCount = this.memoryItems.filter((i) => i.status === 'active').length;
    const pendingCount = this.memoryItems.filter((i) => i.status === 'pending').length;
    const archivedCount = this.memoryItems.filter((i) => i.status === 'archived').length;
    const favoriteCount = this.memoryItems.filter((i) => i.isFavorite).length;

    const totalValuation = this.memoryItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.stock) || 0),
      0
    );

    const averagePrice =
      totalItems > 0
        ? this.memoryItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0) / totalItems
        : 0;

    const categoryBreakdown = this.memoryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalItems,
      activeCount,
      pendingCount,
      archivedCount,
      favoriteCount,
      totalValuation: Math.round(totalValuation * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      categoryBreakdown,
    };
  }

  async resetData() {
    this.memoryItems = [...INITIAL_DATA];
    this.saveToFile();
    return this.memoryItems;
  }
}

export const itemRepository = new ItemRepository();
