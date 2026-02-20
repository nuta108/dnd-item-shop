import { useState } from 'react';
import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';
import type { DisplayMode } from './ItemCard';
import { CreateItemModal } from './CreateItemModal';

interface DmInventoryProps {
  items: Item[];
  onReturnFromShop: (item: Item) => void;
  displayMode: DisplayMode;
  onToggleDisplayMode: () => void;
  itemSize: number;
  onSizeChange: (delta: number) => void;
  onEditItem?: (id: string, patch: Partial<Item>) => Promise<unknown>;
  onCreateItem?: (data: Omit<Item, 'id'>) => Promise<Item>;
  onDeleteItem?: (id: string) => Promise<void>;
}

export function DmInventory({ items, onReturnFromShop, displayMode, onToggleDisplayMode, itemSize, onSizeChange, onEditItem, onCreateItem, onDeleteItem }: DmInventoryProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter by search then group by category
  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
  const sortedCategories = Object.keys(grouped).sort();

  const toggle = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // Unique categories from existing items (sorted)
  const existingCategories = [...new Set(items.map((i) => i.category))].sort();

  return (
    <>
      {showCreateModal && onCreateItem && (
        <CreateItemModal
          categories={existingCategories}
          onCreateItem={onCreateItem}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      <div
        className={`flex flex-col h-full rounded-lg transition-colors ${dragOver ? 'ring-2 ring-indigo-500' : ''}`}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const data = e.dataTransfer.getData('application/json');
          if (!data) return;
          const { _dragSource, ...item } = JSON.parse(data);
          if (_dragSource === 'dm-inventory') return;
          onReturnFromShop(item as Item);
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">DM Inventory</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{items.length} items</span>
            {/* Size controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onSizeChange(-1)}
                disabled={itemSize <= 1}
                className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold cursor-pointer transition-colors"
                title="Decrease size"
              >−</button>
              <button
                onClick={() => onSizeChange(1)}
                disabled={itemSize >= 5}
                className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold cursor-pointer transition-colors"
                title="Increase size"
              >+</button>
            </div>
            <button
              onClick={onToggleDisplayMode}
              className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {displayMode === 'icon' ? 'Text' : 'Icon'}
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 border border-gray-600 focus:border-gray-400 focus:outline-none text-gray-200 placeholder-gray-500"
          />
          {onCreateItem && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-2 py-1 text-xs rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold cursor-pointer transition-colors whitespace-nowrap"
              title="Create new item"
            >
              + New Item
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sortedCategories.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">No items</p>
          ) : (
            sortedCategories.map((cat) => (
              <div key={cat}>
                <button
                  onClick={() => toggle(cat)}
                  className="flex items-center gap-1 w-full text-left text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-xs">{collapsed[cat] ? '>' : 'v'}</span>
                  {cat}
                  <span className="text-xs text-gray-500 ml-auto">{grouped[cat].length}</span>
                </button>
                {!collapsed[cat] && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {grouped[cat].map((item) => (
                      <ItemCard key={item.id} item={item} displayMode={displayMode} itemSize={itemSize} dragSource="dm-inventory" onEdit={onEditItem} onDelete={onDeleteItem} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
