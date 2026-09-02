import { itemService } from '../services/itemService.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const getItems = async (req, res) => {
  const query = req.validated?.query || req.query;
  const result = await itemService.listItems(query);
  return sendSuccess(res, {
    message: 'Items retrieved successfully',
    data: result.items,
    meta: {
      pagination: result.pagination,
      filter: query,
    },
  });
};

export const getItemById = async (req, res) => {
  const params = req.validated?.params || req.params;
  const item = await itemService.getItemById(params.id);
  return sendSuccess(res, {
    message: 'Item retrieved successfully',
    data: item,
  });
};

export const createItem = async (req, res) => {
  const body = req.validated?.body || req.body;
  const created = await itemService.createItem(body);
  return sendCreated(res, created, 'Item created successfully');
};

export const updateItem = async (req, res) => {
  const params = req.validated?.params || req.params;
  const body = req.validated?.body || req.body;
  const updated = await itemService.updateItem(params.id, body);
  return sendSuccess(res, {
    message: 'Item updated successfully',
    data: updated,
  });
};

export const patchItem = async (req, res) => {
  const params = req.validated?.params || req.params;
  const body = req.validated?.body || req.body;
  const updated = await itemService.patchItem(params.id, body);
  return sendSuccess(res, {
    message: 'Item partially updated successfully',
    data: updated,
  });
};

export const deleteItem = async (req, res) => {
  const params = req.validated?.params || req.params;
  const deleted = await itemService.deleteItem(params.id);
  return sendSuccess(res, {
    message: 'Item deleted successfully',
    data: deleted,
  });
};

export const bulkDeleteItems = async (req, res) => {
  const body = req.validated?.body || req.body;
  const result = await itemService.bulkDeleteItems(body.ids);
  return sendSuccess(res, {
    message: `Successfully deleted ${result.deletedCount} items`,
    data: result,
  });
};

export const bulkCreateItems = async (req, res) => {
  const body = req.validated?.body || req.body;
  const created = await itemService.bulkCreateItems(body.items);
  return sendCreated(res, created, `Successfully imported ${created.length} items`);
};

export const getItemStats = async (req, res) => {
  const stats = await itemService.getStats();
  return sendSuccess(res, {
    message: 'Analytics stats calculated successfully',
    data: stats,
  });
};

export const exportItems = async (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const exported = await itemService.exportData(format);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nexus-items-export.csv"');
    return res.status(HTTP_STATUS.OK).send(exported);
  }

  return sendSuccess(res, {
    message: 'Export completed',
    data: exported,
  });
};

export const resetData = async (req, res) => {
  const resetItems = await itemService.resetData();
  return sendSuccess(res, {
    message: 'Database reset to default seed items successfully',
    data: resetItems,
  });
};
