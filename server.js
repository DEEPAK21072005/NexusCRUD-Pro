// server.js
const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// DB setup (file-based)
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
// provide default data as the second argument to Low
const db = new Low(adapter, { items: [] });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize db with default structure
async function initDb() {
  await db.read();
  db.data = db.data || { items: [] };
  await db.write();
}

// REST endpoints

// GET all items
app.get('/api/items', async (req, res) => {
  await db.read();
  res.json(db.data.items);
});

// GET one item by id
app.get('/api/items/:id', async (req, res) => {
  await db.read();
  const item = db.data.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// CREATE item
app.post('/api/items', async (req, res) => {
  await db.read();
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const newItem = { id: nanoid(), name, description: description || '' };
  db.data.items.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

// UPDATE item
app.put('/api/items/:id', async (req, res) => {
  await db.read();
  const idx = db.data.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Item not found' });
  const { name, description } = req.body;
  if (name !== undefined) db.data.items[idx].name = name;
  if (description !== undefined) db.data.items[idx].description = description;
  await db.write();
  res.json(db.data.items[idx]);
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
  await db.read();
  const idx = db.data.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Item not found' });
  const deleted = db.data.items.splice(idx, 1)[0];
  await db.write();
  res.json(deleted);
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
