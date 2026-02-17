import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';

interface PlayerCartProps {
  items: Item[];
  onRemoveFromCart: (item: Item) => void;
}

export function PlayerCart({ items, onRemoveFromCart }: PlayerCartProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Player Cart</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Cart is empty</p>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} actionLabel="Remove" onAction={onRemoveFromCart} />
          ))
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-yellow-400 font-mono font-bold">{total.toLocaleString()} gp</span>
      </div>
    </div>
  );
}
