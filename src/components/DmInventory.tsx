import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';

interface DmInventoryProps {
  items: Item[];
  onAddToShop: (item: Item) => void;
}

export function DmInventory({ items, onAddToShop }: DmInventoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">DM Inventory</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">No items in inventory</p>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} actionLabel="Add to Shop +" onAction={onAddToShop} />
          ))
        )}
      </div>
    </div>
  );
}
