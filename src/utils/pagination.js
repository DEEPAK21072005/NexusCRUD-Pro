export const getPagination = (page = 1, limit = 10, totalItems = 0) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const offset = (currentPage - 1) * perPage;

  return {
    currentPage,
    limit: perPage,
    totalPages,
    totalItems,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
