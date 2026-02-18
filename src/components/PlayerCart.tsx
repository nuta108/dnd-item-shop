import { useState } from 'react';
import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';

interface PlayerCartProps {
  items: Item[];
  onDropItem: (item: Item) => void;
}

export function PlayerCart({ items, onDropItem }: PlayerCartProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col h-full rounded-lg transition-colors ${dragOver ? 'ring-2 ring-green-500' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (data) onDropItem(JSON.parse(data) as Item);
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Player Cart</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">Drag items here to buy</p>
      <div className="flex-1 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Cart is empty</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} displayMode="image" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
