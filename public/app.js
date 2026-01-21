const apiBase = '/api/items';
let editingId = null;

async function fetchItems() {
  const res = await fetch(apiBase);
  const items = await res.json();
  renderItems(items);
}

function renderItems(items) {
  const ul = document.getElementById('items');
  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.description || '')}
      <button data-id="${item.id}" class="edit">Edit</button>
      <button data-id="${item.id}" class="delete">Delete</button>
    `;
    ul.appendChild(li);
  });
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}

// form handling
const form = document.getElementById('item-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!name) return alert('Name required');

  if (editingId) {
    // update
    await fetch(`${apiBase}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    editingId = null;
  } else {
    // create
    await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
  }

  form.reset();
  fetchItems();
});

// cancel button
document.getElementById('cancel').addEventListener('click', () => {
  editingId = null; form.reset();
});

// delegate edit/delete clicks
document.getElementById('items').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete')) {
    const id = e.target.dataset.id;
    if (!confirm('Delete this item?')) return;
    await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    fetchItems();
  }

  if (e.target.classList.contains('edit')) {
    const id = e.target.dataset.id;
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) return alert('Could not fetch item');
    const item = await res.json();
    document.getElementById('name').value = item.name;
    document.getElementById('description').value = item.description || '';
    editingId = id;
  }
});

// initial load
fetchItems();
