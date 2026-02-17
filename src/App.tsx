import { useState } from 'react';
import type { Item } from './types/item';
import { defaultItems } from './data/items';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DmInventory } from './components/DmInventory';
import { ShopDisplay } from './components/ShopDisplay';
import { PlayerCart } from './components/PlayerCart';

type Mode = 'dm' | 'player';

function App() {
  const [mode, setMode] = useState<Mode>('dm');
  const [inventory, setInventory] = useLocalStorage<Item[]>('dnd-inventory', defaultItems);
  const [shop, setShop] = useLocalStorage<Item[]>('dnd-shop', []);
  const [cart, setCart] = useLocalStorage<Item[]>('dnd-cart', []);

  const addToShop = (item: Item) => {
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    setShop((prev) => [...prev, item]);
  };

  const removeFromShop = (item: Item) => {
    setShop((prev) => prev.filter((i) => i.id !== item.id));
    setInventory((prev) => [...prev, item]);
  };

  const addToCart = (item: Item) => {
    setShop((prev) => prev.filter((i) => i.id !== item.id));
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (item: Item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id));
    setShop((prev) => [...prev, item]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
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

      {/* 3-Panel Layout */}
      <main className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Left: DM Inventory (visible only in DM mode) */}
        {mode === 'dm' ? (
          <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden">
            <DmInventory items={inventory} onAddToShop={addToShop} />
          </section>
        ) : (
          <div />
        )}

        {/* Center: Shop */}
        <section className={`bg-gray-800/50 rounded-lg p-4 overflow-hidden ${mode === 'player' ? 'col-span-2' : ''}`}>
          <ShopDisplay items={shop} onAddToCart={addToCart} onRemoveFromShop={removeFromShop} mode={mode} />
        </section>

        {/* Right: Player Cart (visible only in Player mode) */}
        {mode === 'player' ? (
          <section className="bg-gray-800/50 rounded-lg p-4 overflow-hidden">
            <PlayerCart items={cart} onRemoveFromCart={removeFromCart} />
          </section>
        ) : (
          <div />
        )}
      </main>
    </div>
  );
}

export default App;
