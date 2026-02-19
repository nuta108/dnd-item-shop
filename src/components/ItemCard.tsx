import { useState } from 'react';
import type { Item, ItemStats } from '../types/item';
import { ItemEditForm } from './ItemEditForm';

export type DisplayMode = 'icon' | 'text';

interface ItemCardProps {
  item: Item;
  displayMode: DisplayMode;
  itemSize?: number; // 1–5, default 3
  dragSource?: string; // e.g. 'shop' | 'player-cart' | 'dm-inventory'
  onEdit?: (id: string, patch: Partial<Item>) => Promise<unknown>;
}

const SIZE_MAP = [
  { card: 60,  icon: 28, text: '8px',  textMode: '10px' },
  { card: 72,  icon: 36, text: '9px',  textMode: '11px' },
  { card: 88,  icon: 44, text: '10px', textMode: '12px' },
  { card: 108, icon: 56, text: '12px', textMode: '13px' },
  { card: 132, icon: 70, text: '13px', textMode: '14px' },
];

// ── D&D Stat Block ────────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t-4 border-double border-[#9c2a1a] my-2" />;
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm leading-snug">
      <span className="font-bold text-[#7a200d] shrink-0">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function StatBlock({ name, stats }: { name: string; stats: ItemStats }) {
  return (
    <div
      className="w-72 max-h-[85vh] overflow-y-auto rounded shadow-2xl flex flex-col"
      style={{ background: '#fdf1dc', fontFamily: 'Georgia, serif' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-1">
        <h2 className="text-2xl font-bold text-[#7a200d] leading-tight">{name}</h2>
        {stats.category_detail && (
          <p className="text-sm italic text-gray-600">{stats.category_detail}</p>
        )}
      </div>

      <Divider />

      {/* Core stats */}
      <div className="px-4 space-y-1">
        {stats.cost && <StatRow label="Cost" value={<span className="font-mono text-amber-800">{stats.cost}</span>} />}
        {stats.weight && <StatRow label="Weight" value={stats.weight} />}
        {stats.damage_dice && (
          <StatRow
            label="Damage"
            value={<span className="font-mono text-red-800">{stats.damage_dice} {stats.damage_type}</span>}
          />
        )}
        {stats.ac_display && (
          <StatRow label="Armor Class" value={<span className="text-blue-900">{stats.ac_display}</span>} />
        )}
        {stats.strength_required != null && (
          <StatRow label="Str Required" value={stats.strength_required} />
        )}
        {stats.stealth_disadvantage && (
          <StatRow label="Stealth" value={<span className="text-orange-700">Disadvantage</span>} />
        )}
      </div>

      {/* Properties */}
      {stats.properties && stats.properties.length > 0 && (
        <>
          <Divider />
          <div className="px-4">
            <p className="text-sm text-gray-900">
              <span className="font-bold text-[#7a200d]">Properties </span>
              <span className="italic">{stats.properties.join(', ')}</span>
            </p>
          </div>
        </>
      )}

      {/* Description */}
      {stats.description && (
        <>
          <Divider />
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-800 leading-relaxed">{stats.description}</p>
          </div>
        </>
      )}

      {!stats.description && <div className="pb-4" />}
    </div>
  );
}

// ── ItemCard ──────────────────────────────────────────────────────────────────

export function ItemCard({ item, displayMode, itemSize = 3, dragSource, onEdit }: ItemCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const sz = SIZE_MAP[Math.min(Math.max(itemSize - 1, 0), SIZE_MAP.length - 1)];

  return (
    <>
      <div
        className="inline-block w-fit cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={(e) => {
          const payload = dragSource ? { ...item, _dragSource: dragSource } : item;
          e.dataTransfer.setData('application/json', JSON.stringify(payload));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={() => setShowModal(true)}
      >
        {displayMode === 'icon' ? (
          <div
            className="bg-gray-800 rounded border border-gray-600 hover:border-gray-400 transition-colors p-2 flex flex-col items-center gap-1"
            style={{ width: sz.card }}
          >
            {item.icon
              ? <img src={item.icon} alt={item.name} width={sz.icon} height={sz.icon} draggable={false} />
              : <div className="flex items-center justify-center text-gray-500" style={{ width: sz.icon, height: sz.icon, fontSize: sz.icon * 0.5 }}>?</div>
            }
            <p className="text-gray-300 leading-tight text-center break-words w-full" style={{ fontSize: sz.text }}>{item.name}</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded border border-gray-600 hover:border-gray-400 transition-colors px-2 py-1.5 text-center">
            <p className="text-gray-200" style={{ fontSize: sz.textMode }}>{item.name}</p>
          </div>
        )}
      </div>

      {/* Click modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 overflow-auto"
          onClick={() => { setShowModal(false); setEditing(false); }}
        >
          <div
            className="flex items-start gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left panel: icon panel (not shown in text mode) */}
            {displayMode === 'icon' && (
              <div
                className="shrink-0 flex flex-col items-center gap-4 rounded-xl p-6 min-w-[180px] shadow-2xl border border-amber-800/50 overflow-visible"
                style={{ background: 'linear-gradient(145deg, #1c1008, #111827)' }}
              >
                {item.icon
                  ? <img
                      src={item.icon}
                      alt={item.name}
                      width={140}
                      height={140}
                      draggable={false}
                      className="transition-transform duration-200 cursor-zoom-in hover:scale-[2] relative z-10"
                    />
                  : <div className="w-36 h-36 flex items-center justify-center text-gray-600 text-6xl">?</div>
                }
                <div className="text-center">
                  <p className="text-amber-300 font-bold text-lg leading-tight">{item.name}</p>
                  {item.stats?.category_detail && (
                    <p className="text-gray-500 text-xs italic mt-1">{item.stats.category_detail}</p>
                  )}
                </div>
              </div>
            )}

            {/* Stat block or edit form */}
            <div className="self-start">
              {editing && onEdit ? (
                <ItemEditForm
                  item={item}
                  onSave={onEdit}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <div>
                  {item.stats && <StatBlock name={item.name} stats={item.stats} />}
                  {onEdit && (
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded py-1.5 font-bold cursor-pointer"
                    >
                      {item.stats ? 'Edit' : 'Add Stats'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            className="fixed top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none cursor-pointer"
            onClick={() => { setShowModal(false); setEditing(false); }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
