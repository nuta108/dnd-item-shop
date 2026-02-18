import type { Item } from '../types/item';

const API = 'http://localhost:3001';

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
