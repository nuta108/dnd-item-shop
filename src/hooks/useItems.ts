import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../types/item';
import { fetchItems, updateItem, createItem as createItemApi, deleteItem as deleteItemApi } from '../api/items';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));
  }, []);

  const editItem = useCallback(async (id: string, patch: Partial<Item>) => {
    const updated = await updateItem(id, patch);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const createItem = useCallback(async (data: Omit<Item, 'id'>) => {
    const created = await createItemApi(data);
    setItems((prev) => [...prev, created]);
    return created;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await deleteItemApi(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, loading, editItem, createItem, deleteItem };
}
