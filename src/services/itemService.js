import { itemRepository } from '../repositories/itemRepository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/appError.js';
import { getPagination } from '../utils/pagination.js';

export class ItemService {
  async listItems(queryParams) {
    const { page = 1, limit = 10, ...filterParams } = queryParams;
    const tempResult = await itemRepository.findAll({ ...filterParams, offset: 0, limit: 100000 });
    const pagination = getPagination(page, limit, tempResult.totalCount);

    const { items } = await itemRepository.findAll({
      ...filterParams,
      offset: pagination.offset,
      limit: pagination.limit,
    });

    return {
      items,
      pagination,
    };
  }

  async getItemById(id) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Item with ID '${id}' was not found`);
    }
    return item;
  }

  async createItem(itemData) {
    const existing = await itemRepository.findByName(itemData.name);
    if (existing) {
      throw new ConflictError(`An item with name '${itemData.name}' already exists`);
    }
    return await itemRepository.create(itemData);
  }

  async updateItem(id, itemData) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw new NotFoundError(`Item with ID '${id}' not found`);
    }

    if (itemData.name && itemData.name.toLowerCase() !== item.name.toLowerCase()) {
      const existing = await itemRepository.findByName(itemData.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`An item with name '${itemData.name}' already exists`);
      }
    }

    return await itemRepository.update(id, itemData);
  }

  async patchItem(id, partialData) {
    return await this.updateItem(id, partialData);
  }

  async deleteItem(id) {
    const deleted = await itemRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Item with ID '${id}' not found`);
    }
    return deleted;
  }

  async bulkDeleteItems(ids) {
    return await itemRepository.bulkDelete(ids);
  }

  async bulkCreateItems(items) {
    return await itemRepository.bulkCreate(items);
  }

  async getStats() {
    return await itemRepository.getStats();
  }

  async exportData(format = 'json') {
    const { items } = await itemRepository.findAll({ offset: 0, limit: 100000 });

    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Priority', 'Tags', 'CreatedAt'];
      const rows = items.map((i) => [
        `"${i.id}"`,
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.category}"`,
        i.price,
        i.stock,
        `"${i.status}"`,
        `"${i.priority}"`,
        `"${(i.tags || []).join(';')}"`,
        `"${i.createdAt}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return items;
  }

  async resetData() {
    return await itemRepository.resetData();
  }
}

export const itemService = new ItemService();
