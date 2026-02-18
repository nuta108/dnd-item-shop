import { useState } from 'react';
import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';
import type { DisplayMode } from './ItemCard';

interface ShopDisplayProps {
  items: Item[];
  onDropItem: (item: Item) => void;
  displayMode: DisplayMode;
}

export function ShopDisplay({ items, onDropItem, displayMode }: ShopDisplayProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col h-full rounded-lg transition-colors ${dragOver ? 'ring-2 ring-yellow-500' : ''}`}
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
        <h2 className="text-lg font-bold">Shop</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">Drop items here to stock the shop</p>
      <div className="flex-1 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Shop is empty — drag items here</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} displayMode={displayMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
