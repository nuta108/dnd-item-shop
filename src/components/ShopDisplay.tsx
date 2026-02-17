import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';

interface ShopDisplayProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
  onRemoveFromShop: (item: Item) => void;
  mode: 'dm' | 'player';
}

export function ShopDisplay({ items, onAddToCart, onRemoveFromShop, mode }: ShopDisplayProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Shop</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Shop is empty</p>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              actionLabel={mode === 'dm' ? 'Remove' : 'Buy'}
              onAction={mode === 'dm' ? onRemoveFromShop : onAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}
