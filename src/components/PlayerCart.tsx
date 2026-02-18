import { useState } from 'react';
import type { Item } from '../types/item';
import { ItemCard } from './ItemCard';

interface PlayerCartProps {
  items: Item[];
  onDropItem: (item: Item) => void;
  onEditItem?: (id: string, patch: Partial<Item>) => Promise<unknown>;
  onBuyItem?: (item: Item) => void;
}

function parseCostGp(cost: string | null | undefined): number | null {
  if (!cost) return null;
  const m = cost.match(/^([\d.]+)\s*gp/i);
  return m ? parseFloat(m[1]) : null;
}

function fmtGp(gp: number): string {
  return Number.isInteger(gp) ? `${gp} gp` : `${gp.toFixed(2)} gp`;
}

export function PlayerCart({ items, onDropItem, onEditItem, onBuyItem }: PlayerCartProps) {
  const [dragOver, setDragOver] = useState(false);
  const [adjustment, setAdjustment] = useState(0);

  const priceRows = items.map((item) => ({
    id: item.id,
    name: item.name,
    gp: parseCostGp(item.stats?.cost),
  }));

  const subtotal = priceRows.reduce((sum, r) => sum + (r.gp ?? 0), 0);
  const unknownCount = priceRows.filter((r) => r.gp === null).length;
  const finalPrice = subtotal + adjustment;

  const adjStep = (delta: number) =>
    setAdjustment((prev) => Math.round((prev + delta) * 100) / 100);

  return (
    <div
      className={`flex flex-col h-full rounded-lg transition-colors ${dragOver ? 'ring-2 ring-green-500' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (data) onDropItem(JSON.parse(data) as Item);
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Player Cart</h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">Drag items here to buy</p>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Cart is empty</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div key={item.id} className="relative group/card">
                <ItemCard item={item} displayMode="image" onEdit={onEditItem} />
                {onBuyItem && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onBuyItem(item); }}
                    className="absolute right-0 w-6 h-6 rounded-full bg-green-600 hover:bg-green-500 active:bg-green-700 cursor-pointer flex items-center justify-center shadow-lg z-10 opacity-0 group-hover/card:opacity-100 transition-opacity text-sm leading-none"
                    style={{ top: '5%' }}
                    title="Buy"
                  >
                    🛒
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Summary */}
      {items.length > 0 && (
        <div className="mt-3 shrink-0 rounded-lg border border-amber-700/40 bg-gray-950/70 overflow-hidden text-sm">
          {/* Title */}
          <div className="px-3 py-2 bg-amber-900/30 border-b border-amber-700/30 flex items-center gap-1.5">
            <span className="text-amber-400 text-base">⚖</span>
            <span className="font-semibold text-amber-300 tracking-wide text-xs uppercase">
              Price Summary
            </span>
          </div>

          {/* Item list */}
          <div className="px-3 py-2 max-h-32 overflow-y-auto space-y-0.5">
            {priceRows.map((r) => (
              <div key={r.id} className="flex justify-between gap-2 text-xs">
                <span className="text-gray-300 truncate">{r.name}</span>
                <span className={r.gp !== null ? 'text-amber-300 font-mono shrink-0' : 'text-gray-600 shrink-0'}>
                  {r.gp !== null ? fmtGp(r.gp) : '—'}
                </span>
              </div>
            ))}
            {unknownCount > 0 && (
              <p className="text-[10px] text-gray-600 pt-1">
                * {unknownCount} item{unknownCount > 1 ? 's' : ''} ไม่มีราคา
              </p>
            )}
          </div>

          {/* Subtotal */}
          <div className="mx-3 border-t border-amber-700/30" />
          <div className="px-3 py-1.5 flex justify-between text-xs">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-amber-300 font-mono font-semibold">{fmtGp(subtotal)}</span>
          </div>

          {/* Adjustment */}
          <div className="px-3 pb-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-xs shrink-0">ส่วนลด / เพิ่ม</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjStep(-10)}
                  className="w-7 h-6 rounded bg-gray-700 hover:bg-red-900/60 text-gray-300 hover:text-red-300 text-xs font-bold cursor-pointer transition-colors"
                >−10</button>
                <button
                  onClick={() => adjStep(-1)}
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-red-900/60 text-gray-300 hover:text-red-300 text-xs font-bold cursor-pointer transition-colors"
                >−1</button>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center text-xs font-mono rounded bg-gray-800 border border-gray-600 focus:border-amber-500 focus:outline-none text-white py-0.5 px-1"
                />
                <span className="text-gray-400 text-xs">gp</span>
                <button
                  onClick={() => adjStep(1)}
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-green-900/60 text-gray-300 hover:text-green-300 text-xs font-bold cursor-pointer transition-colors"
                >+1</button>
                <button
                  onClick={() => adjStep(10)}
                  className="w-7 h-6 rounded bg-gray-700 hover:bg-green-900/60 text-gray-300 hover:text-green-300 text-xs font-bold cursor-pointer transition-colors"
                >+10</button>
              </div>
            </div>
            {adjustment !== 0 && (
              <p className="text-[10px] text-right">
                <span className={adjustment < 0 ? 'text-red-400' : 'text-green-400'}>
                  {adjustment < 0 ? `ลด ${fmtGp(Math.abs(adjustment))}` : `เพิ่ม ${fmtGp(adjustment)}`}
                </span>
                {' '}
                <button
                  onClick={() => setAdjustment(0)}
                  className="text-gray-600 hover:text-gray-400 cursor-pointer underline"
                >
                  reset
                </button>
              </p>
            )}
          </div>

          {/* Final Price */}
          <div className="mx-3 border-t-2 border-amber-600/50" />
          <div className="px-3 py-2.5 flex justify-between items-center gap-3">
            <span className="text-amber-200 font-semibold text-sm shrink-0">Final Price</span>
            <span className={`font-mono font-bold text-base ${
              finalPrice < subtotal ? 'text-green-400' :
              finalPrice > subtotal ? 'text-orange-400' : 'text-amber-300'
            }`}>
              {fmtGp(finalPrice)}
            </span>
            {onBuyItem && (
              <button
                onClick={() => { [...items].forEach((item) => onBuyItem(item)); setAdjustment(0); }}
                className="ml-auto shrink-0 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
              >
                ✓ Buy All (Clear items)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
