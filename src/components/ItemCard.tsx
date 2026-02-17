import type { Item, Rarity } from '../types/item';

const rarityStyles: Record<Rarity, { border: string; badge: string; label: string }> = {
  common:    { border: 'border-gray-500',   badge: 'bg-gray-600 text-gray-200',    label: 'Common' },
  uncommon:  { border: 'border-green-500',  badge: 'bg-green-700 text-green-100',  label: 'Uncommon' },
  rare:      { border: 'border-blue-500',   badge: 'bg-blue-700 text-blue-100',    label: 'Rare' },
  very_rare: { border: 'border-purple-500', badge: 'bg-purple-700 text-purple-100', label: 'Very Rare' },
  legendary: { border: 'border-yellow-500', badge: 'bg-yellow-700 text-yellow-100', label: 'Legendary' },
};

interface ItemCardProps {
  item: Item;
  actionLabel: string;
  onAction: (item: Item) => void;
}

export function ItemCard({ item, actionLabel, onAction }: ItemCardProps) {
  const style = rarityStyles[item.rarity];

  return (
    <div className={`border-2 ${style.border} rounded-lg bg-gray-800 p-3 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
        <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-mono text-sm">{item.price.toLocaleString()} gp</span>
        <button
          onClick={() => onAction(item)}
          className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
