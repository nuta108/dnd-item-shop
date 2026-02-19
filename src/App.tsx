import { useState, useCallback, useRef, useEffect } from 'react';
import type { Item, ShopData } from './types/item';
import { useItems } from './hooks/useItems';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DmInventory } from './components/DmInventory';
import { ShopDisplay } from './components/ShopDisplay';
import { PlayerCart } from './components/PlayerCart';
import type { DisplayMode } from './components/ItemCard';

type Mode = 'dm' | 'player';

function AboutModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-amber-400 mb-1">D&D Item Shop</h2>
        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Free Version v0.1.0</span>

        <p className="text-gray-300 text-sm mt-4 leading-relaxed">
          Created by <span className="text-white font-semibold">TarMee</span>
          <br />
          A tool to help DMs manage item shops for D&amp;D campaigns.
        </p>

        <div className="mt-4 border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-400 mb-3">
            Enjoying this tool? Support on Patreon to unlock the
            <span className="text-amber-400 font-semibold"> Supporter Version</span> with more features.
          </p>
          <a
            href="https://www.patreon.com/cw/TarMeeTRPGTools"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#FF424D] hover:bg-[#e03a45] text-white font-bold py-2 rounded-lg transition-colors"
          >
            Support on Patreon
          </a>
        </div>

        <div className="mt-3 bg-gray-900/60 rounded-lg p-3 text-xs text-gray-400 space-y-1">
          <p className="text-gray-300 font-semibold text-xs mb-1">Supporter Version includes:</p>
          <p>• Up to 20 shops (currently 3)</p>
          <p>• Freely add &amp; remove items</p>
          <p>• Custom item card images</p>
          <p>• Magic Items category (coming soon)</p>
          <p>• Random item generator (coming soon)</p>
        </div>

        <div className="mt-3 border-t border-gray-700 pt-3 text-xs text-gray-400 space-y-1.5">
          <p className="text-gray-300 font-semibold">Card Image Credits</p>
          <p>
            All card images are free assets created by{' '}
            <a
              href="https://www.facebook.com/groups/dmweber/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Paul Weber
            </a>
            . You can download them at:
          </p>
          <p>
            <a
              href="https://www.facebook.com/groups/dmweber/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline break-all"
            >
              facebook.com/groups/dmweber
            </a>
          </p>
          <p>
            <a
              href="https://www.sageadvice.eu/dd-equipment-treasure-and-condition-cards/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline break-all"
            >
              D&amp;D Equipment, Treasure and Condition Cards! — sageadvice.eu
            </a>
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-300 text-sm cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const DEFAULT_SHOPS: ShopData[] = [
  { id: 'shop-1', name: 'Shop 1', items: [] },
];

function App() {
  const [mode, setMode] = useLocalStorage<Mode>('dnd-mode', 'dm');
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>('dnd-display-mode', 'image');
  const [showAbout, setShowAbout] = useState(false);
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
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {/* Header */}
      <header className="border-b border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">D&D Item Shop</h1>
          <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full leading-none">Free v0.1.0</span>
        </div>
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
          <button
            onClick={() => setShowAbout(true)}
            className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors cursor-pointer"
            title="About"
          >
            ?
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
