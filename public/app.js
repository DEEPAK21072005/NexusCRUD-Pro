// NexusCRUD Pro Client State & Reactive Controller
const API_BASE = '/api/v1';

const state = {
  items: [],
  selectedIds: new Set(),
  currentView: 'table', // 'table' | 'card'
  searchQuery: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentPage: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
  isLoading: false,
};

// DOM Selectors
const elements = {
  itemsTableBody: document.getElementById('items-tbody'),
  cardsWrapper: document.getElementById('cards-wrapper'),
  tableWrapper: document.getElementById('table-wrapper'),
  loadingSpinner: document.getElementById('loading-spinner'),
  emptyState: document.getElementById('empty-state'),
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search'),
  categoryFilter: document.getElementById('category-filter'),
  statusFilter: document.getElementById('status-filter'),
  sortFilter: document.getElementById('sort-filter'),
  tableViewBtn: document.getElementById('table-view-btn'),
  cardViewBtn: document.getElementById('card-view-btn'),
  selectAllCheckbox: document.getElementById('select-all-checkbox'),
  bulkBar: document.getElementById('bulk-bar'),
  selectedCount: document.getElementById('selected-count'),
  bulkDeleteBtn: document.getElementById('bulk-delete-btn'),
  exportSelectedBtn: document.getElementById('export-selected-btn'),
  prevPageBtn: document.getElementById('prev-page-btn'),
  nextPageBtn: document.getElementById('next-page-btn'),
  pageIndicator: document.getElementById('page-indicator'),
  paginationInfo: document.getElementById('pagination-info'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  seedBtn: document.getElementById('seed-btn'),
  openCreateModalBtn: document.getElementById('open-create-modal-btn'),
  emptyCreateBtn: document.getElementById('empty-create-btn'),
  itemModal: document.getElementById('item-modal'),
  itemForm: document.getElementById('item-form'),
  modalTitle: document.getElementById('modal-title'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  cancelModalBtn: document.getElementById('cancel-modal-btn'),
  formItemId: document.getElementById('form-item-id'),
  formName: document.getElementById('form-name'),
  formDescription: document.getElementById('form-description'),
  formCategory: document.getElementById('form-category'),
  formStatus: document.getElementById('form-status'),
  formPrice: document.getElementById('form-price'),
  formStock: document.getElementById('form-stock'),
  formPriority: document.getElementById('form-priority'),
  formTags: document.getElementById('form-tags'),
  formFavorite: document.getElementById('form-favorite'),
  jsonModal: document.getElementById('json-modal'),
  jsonCodeViewer: document.getElementById('json-code-viewer'),
  closeJsonModalBtn: document.getElementById('close-json-modal-btn'),
  closeJsonBtn: document.getElementById('close-json-btn'),
  copyJsonBtn: document.getElementById('copy-json-btn'),
  toastContainer: document.getElementById('toast-container'),
  statTotal: document.getElementById('stat-total'),
  statActive: document.getElementById('stat-active'),
  statValuation: document.getElementById('stat-valuation'),
  statFavorites: document.getElementById('stat-favorites'),
};

// Toast Notification Manager
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Fetch Stats
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/items/stats/summary`);
    const json = await res.json();
    if (json.status === 'success') {
      const { totalItems, activeCount, totalValuation, favoriteCount } = json.data;
      elements.statTotal.textContent = totalItems.toLocaleString();
      elements.statActive.textContent = activeCount.toLocaleString();
      elements.statValuation.textContent = `$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elements.statFavorites.textContent = favoriteCount.toLocaleString();
    }
  } catch (err) {
    console.warn('Failed to fetch stats:', err);
  }
}

// Fetch Items
async function fetchItems() {
  state.isLoading = true;
  updateLoadingUI();

  try {
    const params = new URLSearchParams({
      page: state.currentPage,
      limit: state.limit,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    });

    if (state.searchQuery) params.append('q', state.searchQuery);
    if (state.categoryFilter !== 'all') params.append('category', state.categoryFilter);
    if (state.statusFilter !== 'all') params.append('status', state.statusFilter);

    const res = await fetch(`${API_BASE}/items?${params.toString()}`);
    const json = await res.json();

    if (json.status === 'success') {
      state.items = json.data;
      state.totalItems = json.meta.pagination.totalItems;
      state.totalPages = json.meta.pagination.totalPages;
      state.currentPage = json.meta.pagination.currentPage;
      renderItems();
      updatePaginationUI();
    } else {
      showToast(json.message || 'Failed to fetch items', 'error');
    }
  } catch (err) {
    showToast('Network error connecting to API', 'error');
  } finally {
    state.isLoading = false;
    updateLoadingUI();
    fetchStats();
  }
}

// Render Table & Cards
function renderItems() {
  elements.itemsTableBody.innerHTML = '';
  elements.cardsWrapper.innerHTML = '';

  if (state.items.length === 0) {
    elements.emptyState.style.display = 'block';
    elements.tableWrapper.style.display = 'none';
    elements.cardsWrapper.style.display = 'none';
    return;
  }

  elements.emptyState.style.display = 'none';
  if (state.currentView === 'table') {
    elements.tableWrapper.style.display = 'block';
    elements.cardsWrapper.style.display = 'none';
  } else {
    elements.tableWrapper.style.display = 'none';
    elements.cardsWrapper.style.display = 'grid';
  }

  // Render Table
  state.items.forEach((item) => {
    const isSelected = state.selectedIds.has(item.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="checkbox" class="row-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} />
      </td>
      <td>
        <div class="item-title">
          <span class="fav-star" data-action="toggle-fav" data-id="${item.id}">${item.isFavorite ? '★' : '☆'}</span>
          <span>${escapeHtml(item.name)}</span>
        </div>
        <div class="item-desc">${escapeHtml(item.description || 'No description provided')}</div>
      </td>
      <td><span class="badge" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color);">${item.category}</span></td>
      <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">$${Number(item.price).toFixed(2)}</td>
      <td style="font-family: 'JetBrains Mono', monospace;">${item.stock}</td>
      <td><span class="badge badge-${item.status}">${item.status}</span></td>
      <td><span class="priority-tag priority-${item.priority}">${item.priority}</span></td>
      <td>
        ${(item.tags || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
      </td>
      <td class="text-right">
        <div class="action-btns">
          <button class="icon-btn" data-action="inspect" data-id="${item.id}" title="Inspect JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </button>
          <button class="icon-btn" data-action="edit" data-id="${item.id}" title="Edit Item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
          <button class="icon-btn danger" data-action="delete" data-id="${item.id}" title="Delete Item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    elements.itemsTableBody.appendChild(tr);
  });

  // Render Cards
  state.items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card glass-panel';
    card.innerHTML = `
      <div>
        <div class="card-header">
          <span class="badge badge-${item.status}">${item.status}</span>
          <span class="card-price">$${Number(item.price).toFixed(2)}</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: 700; margin: 10px 0 6px 0; color: #fff;">
          ${item.isFavorite ? '<span style="color:#fbbf24">★</span> ' : ''}${escapeHtml(item.name)}
        </h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">${escapeHtml(item.description || 'No description')}</p>
        <div style="margin-bottom: 12px;">
          ${(item.tags || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-dim);">Stock: <strong>${item.stock}</strong></span>
        <div class="action-btns">
          <button class="icon-btn" data-action="inspect" data-id="${item.id}">JSON</button>
          <button class="icon-btn" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="icon-btn danger" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;
    elements.cardsWrapper.appendChild(card);
  });

  updateBulkBar();
}

function updateLoadingUI() {
  elements.loadingSpinner.style.display = state.isLoading ? 'flex' : 'none';
}

function updatePaginationUI() {
  elements.pageIndicator.textContent = `Page ${state.currentPage} of ${state.totalPages || 1}`;
  elements.paginationInfo.textContent = `Showing ${state.items.length} of ${state.totalItems} items`;
  elements.prevPageBtn.disabled = state.currentPage <= 1;
  elements.nextPageBtn.disabled = state.currentPage >= state.totalPages;
}

function updateBulkBar() {
  const count = state.selectedIds.size;
  if (count > 0) {
    elements.bulkBar.style.display = 'flex';
    elements.selectedCount.textContent = count;
  } else {
    elements.bulkBar.style.display = 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Modal Handlers
function openModal(item = null) {
  elements.itemForm.reset();
  document.getElementById('error-name').textContent = '';

  if (item) {
    elements.modalTitle.textContent = 'Edit Item';
    elements.formItemId.value = item.id;
    elements.formName.value = item.name;
    elements.formDescription.value = item.description || '';
    elements.formCategory.value = item.category || 'Other';
    elements.formStatus.value = item.status || 'active';
    elements.formPrice.value = item.price || 0;
    elements.formStock.value = item.stock || 0;
    elements.formPriority.value = item.priority || 'medium';
    elements.formTags.value = (item.tags || []).join(', ');
    elements.formFavorite.checked = !!item.isFavorite;
  } else {
    elements.modalTitle.textContent = 'Create New Item';
    elements.formItemId.value = '';
    elements.formPrice.value = '0.00';
    elements.formStock.value = '1';
    elements.formFavorite.checked = false;
  }

  elements.itemModal.style.display = 'flex';
  elements.formName.focus();
}

function closeModal() {
  elements.itemModal.style.display = 'none';
}

// Form Submit Handler
elements.itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = elements.formItemId.value;
  const rawTags = elements.formTags.value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const payload = {
    name: elements.formName.value.trim(),
    description: elements.formDescription.value.trim(),
    category: elements.formCategory.value,
    status: elements.formStatus.value,
    price: parseFloat(elements.formPrice.value) || 0,
    stock: parseInt(elements.formStock.value, 10) || 0,
    priority: elements.formPriority.value,
    tags: rawTags,
    isFavorite: elements.formFavorite.checked,
  };

  try {
    const url = id ? `${API_BASE}/items/${id}` : `${API_BASE}/items`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.ok && json.status === 'success') {
      showToast(id ? 'Item updated successfully!' : 'Item created successfully!', 'success');
      closeModal();
      fetchItems();
    } else {
      showToast(json.message || 'Validation error occurred', 'error');
    }
  } catch (err) {
    showToast('Failed to save item', 'error');
  }
});

// Event Delegation for Table & Card Actions
document.addEventListener('click', async (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.getAttribute('data-action');
  const id = target.getAttribute('data-id');
  const item = state.items.find((i) => i.id === id);

  if (action === 'edit' && item) {
    openModal(item);
  } else if (action === 'delete') {
    if (confirm(`Are you sure you want to delete "${item?.name || 'this item'}"?`)) {
      try {
        const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Item deleted', 'success');
          state.selectedIds.delete(id);
          fetchItems();
        }
      } catch (err) {
        showToast('Failed to delete item', 'error');
      }
    }
  } else if (action === 'inspect' && item) {
    elements.jsonCodeViewer.textContent = JSON.stringify(item, null, 2);
    elements.jsonModal.style.display = 'flex';
  } else if (action === 'toggle-fav' && item) {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !item.isFavorite }),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      showToast('Failed to toggle favorite', 'error');
    }
  }
});

// Checkbox selection
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('row-checkbox')) {
    const id = e.target.getAttribute('data-id');
    if (e.target.checked) {
      state.selectedIds.add(id);
    } else {
      state.selectedIds.delete(id);
    }
    updateBulkBar();
  }
});

elements.selectAllCheckbox.addEventListener('change', (e) => {
  if (e.target.checked) {
    state.items.forEach((i) => state.selectedIds.add(i.id));
  } else {
    state.selectedIds.clear();
  }
  renderItems();
});

// Bulk Delete
elements.bulkDeleteBtn.addEventListener('click', async () => {
  const ids = Array.from(state.selectedIds);
  if (ids.length === 0) return;

  if (confirm(`Delete ${ids.length} selected items?`)) {
    try {
      const res = await fetch(`${API_BASE}/items/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        showToast(`Deleted ${ids.length} items`, 'success');
        state.selectedIds.clear();
        fetchItems();
      }
    } catch (err) {
      showToast('Bulk delete failed', 'error');
    }
  }
});

// Search & Debounce
let searchTimeout;
elements.searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const val = e.target.value;
  elements.clearSearchBtn.style.display = val ? 'block' : 'none';

  searchTimeout = setTimeout(() => {
    state.searchQuery = val;
    state.currentPage = 1;
    fetchItems();
  }, 300);
});

elements.clearSearchBtn.addEventListener('click', () => {
  elements.searchInput.value = '';
  elements.clearSearchBtn.style.display = 'none';
  state.searchQuery = '';
  state.currentPage = 1;
  fetchItems();
});

// Filters
elements.categoryFilter.addEventListener('change', (e) => {
  state.categoryFilter = e.target.value;
  state.currentPage = 1;
  fetchItems();
});

elements.statusFilter.addEventListener('change', (e) => {
  state.statusFilter = e.target.value;
  state.currentPage = 1;
  fetchItems();
});

elements.sortFilter.addEventListener('change', (e) => {
  const [field, order] = e.target.value.split(':');
  state.sortBy = field;
  state.sortOrder = order;
  fetchItems();
});

// View Toggle
elements.tableViewBtn.addEventListener('click', () => {
  state.currentView = 'table';
  elements.tableViewBtn.classList.add('active');
  elements.cardViewBtn.classList.remove('active');
  renderItems();
});

elements.cardViewBtn.addEventListener('click', () => {
  state.currentView = 'card';
  elements.cardViewBtn.classList.add('active');
  elements.tableViewBtn.classList.remove('active');
  renderItems();
});

// Pagination
elements.prevPageBtn.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    fetchItems();
  }
});

elements.nextPageBtn.addEventListener('click', () => {
  if (state.currentPage < state.totalPages) {
    state.currentPage++;
    fetchItems();
  }
});

// Export CSV / JSON
elements.exportCsvBtn.addEventListener('click', () => {
  window.open(`${API_BASE}/items/export?format=csv`, '_blank');
});

elements.exportJsonBtn.addEventListener('click', () => {
  window.open(`${API_BASE}/items/export?format=json`, '_blank');
});

// Seed Data
elements.seedBtn.addEventListener('click', async () => {
  if (confirm('Reset database with professional sample data?')) {
    try {
      const res = await fetch(`${API_BASE}/items/reset`, { method: 'POST' });
      if (res.ok) {
        showToast('Database seeded successfully!', 'success');
        state.selectedIds.clear();
        fetchItems();
      }
    } catch (err) {
      showToast('Failed to seed data', 'error');
    }
  }
});

// Modal Open/Close Controls
elements.openCreateModalBtn.addEventListener('click', () => openModal());
elements.emptyCreateBtn.addEventListener('click', () => openModal());
elements.closeModalBtn.addEventListener('click', closeModal);
elements.cancelModalBtn.addEventListener('click', closeModal);

elements.closeJsonModalBtn.addEventListener('click', () => {
  elements.jsonModal.style.display = 'none';
});
elements.closeJsonBtn.addEventListener('click', () => {
  elements.jsonModal.style.display = 'none';
});

elements.copyJsonBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(elements.jsonCodeViewer.textContent);
  showToast('JSON copied to clipboard!', 'info');
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    elements.searchInput.focus();
  }
  if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    openModal();
  }
  if (e.key === 'Escape') {
    closeModal();
    elements.jsonModal.style.display = 'none';
  }
});

// Initial Startup
fetchItems();
