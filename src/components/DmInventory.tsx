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

type InventoryTab = 'adventuring' | 'magic';

const MAGIC_CATEGORY = 'Magical Items';

const TABS: { id: InventoryTab; label: string }[] = [
  { id: 'adventuring', label: 'Adventuring Gear' },
  { id: 'magic',       label: 'Magic Items' },
];

export function DmInventory({
  items, onReturnFromShop, displayMode, onToggleDisplayMode,
  itemSize, onSizeChange, onEditItem, onCreateItem, onDeleteItem,
}: DmInventoryProps) {
  const [activeTab, setActiveTab] = useState<InventoryTab>('adventuring');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Split items by tab
  const tabItems = activeTab === 'magic'
    ? items.filter((i) => i.category === MAGIC_CATEGORY)
    : items.filter((i) => i.category !== MAGIC_CATEGORY);

  // Filter by search then group by category
  const filtered = search
    ? tabItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : tabItems;

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
  const sortedCategories = Object.keys(grouped).sort();

  const toggle = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // Categories available for CreateItemModal — scoped to active tab
  const existingCategories = activeTab === 'magic'
    ? [MAGIC_CATEGORY, ...new Set(items.filter((i) => i.category === MAGIC_CATEGORY).map((i) => i.category))].filter((v, i, a) => a.indexOf(v) === i).sort()
    : [...new Set(items.filter((i) => i.category !== MAGIC_CATEGORY).map((i) => i.category))].sort();

  const magicCount = items.filter((i) => i.category === MAGIC_CATEGORY).length;
  const advCount   = items.filter((i) => i.category !== MAGIC_CATEGORY).length;

  return (
    <>
      {showCreateModal && onCreateItem && (
        <CreateItemModal
          categories={existingCategories.length ? existingCategories : [activeTab === 'magic' ? MAGIC_CATEGORY : 'Adventuring Gear']}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
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

        {/* Tabs */}
        <div className="flex items-end gap-0.5 shrink-0 overflow-x-auto border-b border-gray-600/40 mb-0">
          {TABS.map((tab) => {
            const count = tab.id === 'magic' ? magicCount : advCount;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`
                  relative px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer
                  select-none transition-colors border-t border-l border-r shrink-0
                  ${isActive
                    ? 'bg-gray-700 text-white border-gray-500 z-10 mb-[-1px]'
                    : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border-gray-600/40'
                  }
                `}
              >
                {tab.label}
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden border border-t-0 border-gray-600/40 rounded-b-lg rounded-tr-lg px-3 pt-2.5 pb-3">
          {/* Search + New Item */}
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

          {/* Item list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sortedCategories.length === 0 ? (
              <div className="text-center mt-10">
                {activeTab === 'magic'
                  ? (
                    <div className="space-y-2">
                      <p className="text-2xl">✨</p>
                      <p className="text-gray-500 text-sm">No magic items yet</p>
                      <p className="text-gray-600 text-xs">Coming soon...</p>
                    </div>
                  )
                  : <p className="text-gray-500 text-sm">No items</p>
                }
              </div>
            ) : (
              sortedCategories.map((cat) => (
                <div key={cat}>
                  <button
                    onClick={() => toggle(cat)}
                    className="flex items-center gap-1 w-full text-left text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="text-xs">{collapsed[cat] ? '›' : '⌄'}</span>
                    {cat}
                    <span className="text-xs text-gray-500 ml-auto">{grouped[cat].length}</span>
                  </button>
                  {!collapsed[cat] && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {grouped[cat].map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          displayMode={displayMode}
                          itemSize={itemSize}
                          dragSource="dm-inventory"
                          onEdit={onEditItem}
                          onDelete={onDeleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
