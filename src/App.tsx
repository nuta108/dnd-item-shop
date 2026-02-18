import { useState, useCallback, useRef } from 'react';
import type { Item } from './types/item';
import { allItems } from './data/items';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DmInventory } from './components/DmInventory';
import { ShopDisplay } from './components/ShopDisplay';
import { PlayerCart } from './components/PlayerCart';
import type { DisplayMode } from './components/ItemCard';

type Mode = 'dm' | 'player';

function App() {
  const [mode, setMode] = useState<Mode>('dm');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('image');
  const [leftPct, setLeftPct] = useState(40); // left panel width %
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
  const [inventory] = useLocalStorage<Item[]>('dnd-inventory-v2', allItems);
  const [shop, setShop] = useLocalStorage<Item[]>('dnd-shop-v2', []);
  const [cart, setCart] = useLocalStorage<Item[]>('dnd-cart-v2', []);

  let nextId = 0;
  const uniqueId = () => `copy-${Date.now()}-${nextId++}`;

  // Drag from Inventory → Shop: create copy. Drag from Cart → Shop: move (remove from cart)
  const handleDropToShop = (item: Item) => {
    const fromCart = item.id.startsWith('copy-');
    if (fromCart) {
      setCart((prev) => prev.filter((i) => i.id !== item.id));
      setShop((prev) => [...prev, item]);
    } else {
      setShop((prev) => [...prev, { ...item, id: uniqueId() }]);
    }
  };

  // Drag from Shop → Cart: move (remove from shop, add to cart)
  const handleDropToCart = (item: Item) => {
    setShop((prev) => prev.filter((i) => i.id !== item.id));
    setCart((prev) => [...prev, item]);
  };

  // Drag from Shop/Cart → Inventory: just remove from shop/cart (inventory never changes)
  const handleReturnToInventory = (item: Item) => {
    setShop((prev) => prev.filter((i) => i.id !== item.id));
    setCart((prev) => prev.filter((i) => i.id !== item.id));
  };

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
        {/* DM mode: Inventory + Divider + Shop */}
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
              />
            </section>

            {/* Draggable divider */}
            <div
              className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group"
              onMouseDown={onMouseDown}
            >
              <div className="w-1 h-12 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors" />
            </div>

            <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden flex-1 min-w-0">
              <ShopDisplay items={shop} onDropItem={handleDropToShop} displayMode={displayMode} />
            </section>
          </>
        )}

        {/* Player mode: Shop + Divider + Cart */}
        {mode === 'player' && (
          <>
            <section
              className="bg-gray-800/50 rounded-lg p-4 overflow-hidden shrink-0"
              style={{ width: `${leftPct}%` }}
            >
              <ShopDisplay items={shop} onDropItem={handleDropToShop} displayMode={displayMode} />
            </section>

            <div
              className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group"
              onMouseDown={onMouseDown}
            >
              <div className="w-1 h-12 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors" />
            </div>

            <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden flex-1 min-w-0">
              <PlayerCart items={cart} onDropItem={handleDropToCart} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
