import { useState, useRef, useEffect } from 'react';
import type { Item, ShopData } from '../types/item';
import { ItemCard } from './ItemCard';
import type { DisplayMode } from './ItemCard';
import { SHOP_PRESETS } from '../data/presets';
import type { ShopPreset } from '../data/presets';

interface ShopDisplayProps {
  shops: ShopData[];
  activeShopId: string;
  items: Item[];
  onDropItem: (item: Item) => void;
  displayMode: DisplayMode;
  itemSize?: number;
  onEditItem?: (id: string, patch: Partial<Item>) => Promise<unknown>;
  onSelectShop: (id: string) => void;
  onAddShop: () => void;
  onRemoveShop: (id: string) => void;
  onRenameShop: (id: string, name: string) => void;
  hideTabs?: boolean;
  onLoadPreset?: (preset: ShopPreset) => void;
  onSaveShop?: () => void;
  onImportShop?: (file: File) => void;
}

export function ShopDisplay({
  shops, activeShopId, items, onDropItem, displayMode, itemSize = 3, onEditItem,
  onSelectShop, onAddShop, onRemoveShop, onRenameShop, hideTabs = false,
  onLoadPreset, onSaveShop, onImportShop,
}: ShopDisplayProps) {
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const presetBtnRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Close preset dropdown when clicking outside
  useEffect(() => {
    if (!showPresetMenu) return;
    const handler = (e: MouseEvent) => {
      if (presetBtnRef.current && !presetBtnRef.current.contains(e.target as Node)) {
        setShowPresetMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPresetMenu]);

  const startRename = (shop: ShopData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(shop.id);
    setEditName(shop.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) onRenameShop(editingId, editName.trim());
    setEditingId(null);
  };

  const activeShop = shops.find((s) => s.id === activeShopId);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view when switching
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector<HTMLElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeShopId]);

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportShop) {
      onImportShop(file);
    }
    // Reset so the same file can be imported again
    e.target.value = '';
  };

  return (
    <div
      className={`flex flex-col h-full rounded-lg transition-colors ${dragOver ? 'ring-2 ring-yellow-500' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const { _dragSource, ...item } = JSON.parse(data);
        if (_dragSource === 'shop') return;
        onDropItem(item as Item);
      }}
    >
      {/* Tab bar — hidden in player view */}
      {!hideTabs && (
        <div className="flex items-end shrink-0 border-b border-gray-600/40">
          {/* Scrollable shop tabs */}
          <div
            ref={tabsRef}
            className="flex items-end gap-0.5 flex-1 overflow-x-auto min-w-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 transparent' }}
          >
            {shops.map((shop) => {
              const isActive = shop.id === activeShopId;
              return (
                <div
                  key={shop.id}
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => onSelectShop(shop.id)}
                  className={`
                    relative flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-xs font-medium
                    cursor-pointer select-none transition-colors border-t border-l border-r shrink-0
                    ${isActive
                      ? 'bg-gray-700 text-white border-gray-500 z-10 mb-[-1px]'
                      : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border-gray-600/40'
                    }
                  `}
                >
                  {editingId === shop.id ? (
                    <input
                      ref={inputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingId(null);
                        e.stopPropagation();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 bg-gray-600 text-white text-xs rounded px-1 py-0 outline-none border border-indigo-400"
                    />
                  ) : (
                    <span onDoubleClick={(e) => startRename(shop, e)}>{shop.name}</span>
                  )}
                  {shops.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveShop(shop.id); }}
                      className="text-gray-500 hover:text-red-400 cursor-pointer leading-none ml-0.5 text-sm"
                      title="Remove shop"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons — outside overflow container so dropdown isn't clipped */}
          <div className="flex items-center gap-0.5 shrink-0 pb-0.5 pl-0.5">
            {shops.length < 20 && (
              <button
                onClick={onAddShop}
                className="px-2 py-1.5 rounded-t-lg text-xs text-gray-500 hover:text-gray-200 hover:bg-gray-700/50 cursor-pointer transition-colors border-t border-l border-r border-gray-600/30"
                title="Add shop (max 20)"
              >
                + New
              </button>
            )}

            {shops.length < 20 && onLoadPreset && (
              <div ref={presetBtnRef} className="relative">
                <button
                  onClick={() => setShowPresetMenu((v) => !v)}
                  className="px-2 py-1.5 rounded-t-lg text-xs text-amber-400 hover:text-amber-300 hover:bg-gray-700/50 cursor-pointer transition-colors border-t border-l border-r border-amber-700/40 hover:border-amber-600/60"
                  title="Load a preset shop"
                >
                  ⚡ Preset ▾
                </button>
                {showPresetMenu && (
                  <div className="absolute z-20 top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 w-52">
                    {SHOP_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          onLoadPreset(preset);
                          setShowPresetMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className={`flex flex-col flex-1 overflow-hidden px-4 pt-3 pb-4 ${
        hideTabs ? '' : 'border border-t-0 border-gray-600/40 rounded-b-lg rounded-tr-lg'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{activeShop?.name ?? 'Shop'}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{items.length} items</span>
            {!hideTabs && (
              <>
                {onSaveShop && (
                  <button
                    onClick={onSaveShop}
                    className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Save shop as JSON"
                  >
                    💾
                  </button>
                )}
                {onImportShop && (
                  <>
                    <input
                      ref={importRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportChange}
                    />
                    <button
                      onClick={() => importRef.current?.click()}
                      className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Import shop from JSON"
                    >
                      📂
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">Drop items here to stock the shop</p>
        <div className="flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">Shop is empty — drag items here</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} displayMode={displayMode} itemSize={itemSize} dragSource="shop" onEdit={onEditItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
