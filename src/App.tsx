import { useState, useCallback, useRef } from 'react';
import type { Item, ShopData } from './types/item';
import { useItems } from './hooks/useItems';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DmInventory } from './components/DmInventory';
import { ShopDisplay } from './components/ShopDisplay';
import { PlayerCart } from './components/PlayerCart';
import type { DisplayMode } from './components/ItemCard';

type Mode = 'dm' | 'player';

const DEFAULT_SHOPS: ShopData[] = [
  { id: 'shop-1', name: 'Shop 1', items: [] },
];

function App() {
  const [mode, setMode] = useState<Mode>('dm');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('image');
  const [leftPct, setLeftPct] = useState(40);
  const dragging = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(80, Math.max(20, pct)));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const { items: inventory, loading, editItem } = useItems();
  const [shops, setShops] = useLocalStorage<ShopData[]>('dnd-shops-v1', DEFAULT_SHOPS);
  const [activeShopId, setActiveShopId] = useState<string>(() => shops[0]?.id ?? 'shop-1');
  const [cart, setCart] = useLocalStorage<Item[]>('dnd-cart-v2', []);

  // Ensure activeShopId is always valid
  const safeActiveShopId = shops.some((s) => s.id === activeShopId)
    ? activeShopId
    : (shops[0]?.id ?? '');

  const activeShopItems = shops.find((s) => s.id === safeActiveShopId)?.items ?? [];

  let nextId = 0;
  const uniqueId = () => `copy-${Date.now()}-${nextId++}`;

  const updateActiveItems = (updater: (items: Item[]) => Item[]) => {
    setShops((prev) =>
      prev.map((s) => (s.id === safeActiveShopId ? { ...s, items: updater(s.items) } : s))
    );
  };

  // Drag from Inventory → Shop: create copy. Drag from Cart → Shop: move
  const handleDropToShop = (item: Item) => {
    const fromCart = item.id.startsWith('copy-');
    if (fromCart) {
      setCart((prev) => prev.filter((i) => i.id !== item.id));
      updateActiveItems((items) => [...items, item]);
    } else {
      updateActiveItems((items) => [...items, { ...item, id: uniqueId() }]);
    }
  };

  // Drag from Shop → Cart
  const handleDropToCart = (item: Item) => {
    updateActiveItems((items) => items.filter((i) => i.id !== item.id));
    setCart((prev) => [...prev, item]);
  };

  // Drag back to Inventory: remove from all shops + cart
  const handleReturnToInventory = (item: Item) => {
    setShops((prev) =>
      prev.map((s) => ({ ...s, items: s.items.filter((i) => i.id !== item.id) }))
    );
    setCart((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Buy item
  const handleBuyItem = (item: Item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Shop management
  const handleAddShop = () => {
    const id = `shop-${Date.now()}`;
    const name = `Shop ${shops.length + 1}`;
    setShops((prev) => [...prev, { id, name, items: [] }]);
    setActiveShopId(id);
  };

  const handleRemoveShop = (id: string) => {
    setShops((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeShopId === id) setActiveShopId(next[0]?.id ?? '');
      return next;
    });
  };

  const handleRenameShop = (id: string, name: string) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const shopProps = {
    shops,
    activeShopId: safeActiveShopId,
    items: activeShopItems,
    onDropItem: handleDropToShop,
    displayMode,
    onEditItem: editItem,
    onSelectShop: setActiveShopId,
    onAddShop: handleAddShop,
    onRemoveShop: handleRemoveShop,
    onRenameShop: handleRenameShop,
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p className="text-lg">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight">D&D Item Shop</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">View as:</span>
          <button
            onClick={() => setMode('dm')}
            className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${
              mode === 'dm' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            DM
          </button>
          <button
            onClick={() => setMode('player')}
            className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${
              mode === 'player' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Player
          </button>
        </div>
      </header>

      {/* Panel Layout */}
      <main ref={mainRef} className="flex-1 flex p-4 overflow-hidden">
        {/* DM mode */}
        {mode === 'dm' && (
          <>
            <section
              className="bg-gray-800/50 rounded-lg p-4 overflow-hidden shrink-0"
              style={{ width: `${leftPct}%` }}
            >
              <DmInventory
                items={inventory}
                onReturnFromShop={handleReturnToInventory}
                displayMode={displayMode}
                onToggleDisplayMode={() => setDisplayMode((d) => d === 'image' ? 'text' : 'image')}
                onEditItem={editItem}
              />
            </section>

            <div
              className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group"
              onMouseDown={onMouseDown}
            >
              <div className="w-1 h-12 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors" />
            </div>

            <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden flex-1 min-w-0">
              <ShopDisplay {...shopProps} />
            </section>
          </>
        )}

        {/* Player mode */}
        {mode === 'player' && (
          <>
            <section
              className="bg-gray-800/50 rounded-lg p-4 overflow-hidden shrink-0"
              style={{ width: `${leftPct}%` }}
            >
              <ShopDisplay {...shopProps} hideTabs />
            </section>

            <div
              className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group"
              onMouseDown={onMouseDown}
            >
              <div className="w-1 h-12 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors" />
            </div>

            <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden flex-1 min-w-0">
              <PlayerCart items={cart} onDropItem={handleDropToCart} onEditItem={editItem} onBuyItem={handleBuyItem} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
