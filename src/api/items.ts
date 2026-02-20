import type { Item } from '../types/item';

// Dev (WSL2): use Vite proxy at /api → localhost:3001
// Production (start.bat on Windows): connect directly
const API = import.meta.env.DEV ? '/api' : 'http://localhost:3001';

export async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${API}/items`);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  return res.json();
}

export async function updateItem(id: string, data: Partial<Item>): Promise<Item> {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update item ${id}: ${res.status}`);
  return res.json();
}

export async function createItem(data: Omit<Item, 'id'>): Promise<Item> {
  const res = await fetch(`${API}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create item: ${res.status}`);
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API}/items/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete item ${id}: ${res.status}`);
}
