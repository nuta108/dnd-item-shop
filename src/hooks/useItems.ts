import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../types/item';
import { fetchItems, updateItem } from '../api/items';

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

  return { items, loading, editItem };
}
