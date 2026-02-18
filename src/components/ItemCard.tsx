import { useState, useRef, useCallback } from 'react';
import type { Item, ItemStats } from '../types/item';
import { ItemEditForm } from './ItemEditForm';

export type DisplayMode = 'image' | 'text';

interface ItemCardProps {
  item: Item;
  displayMode: DisplayMode;
  onEdit?: (id: string, patch: Partial<Item>) => Promise<unknown>;
}

const THUMB_W = 82;
const PREVIEW_W = 410;
const PREVIEW_H = 560;

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

export function ItemCard({ item, displayMode, onEdit }: ItemCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (displayMode !== 'image' || !cardRef.current) return;
    setShowPreview(true);

    const rect = cardRef.current.getBoundingClientRect();
    let left = rect.right + 8;
    let top = rect.top;

    if (left + PREVIEW_W > window.innerWidth) left = rect.left - PREVIEW_W - 8;
    if (left < 0) left = Math.max(0, (window.innerWidth - PREVIEW_W) / 2);
    if (top + PREVIEW_H > window.innerHeight) top = window.innerHeight - PREVIEW_H;
    if (top < 0) top = 0;

    setPreviewPos({ top, left });
  }, [displayMode]);

  return (
    <>
      <div
        ref={cardRef}
        className="inline-block w-fit cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify(item));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => setShowModal(true)}
      >
        {displayMode === 'image' ? (
          <div className="relative">
            <img src={item.image} alt={item.name} width={THUMB_W} className="rounded" draggable={false} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 rounded-b text-center py-0.5">
              <span className="text-[10px] text-white leading-tight">{item.name}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded border border-gray-600 hover:border-gray-400 transition-colors p-2 text-center">
            <p className="text-xs truncate">{item.name}</p>
          </div>
        )}
      </div>

      {/* Hover preview */}
      {showPreview && displayMode === 'image' && (
        <div className="fixed z-50 pointer-events-none" style={{ top: previewPos.top, left: previewPos.left }}>
          <img src={item.image} alt={item.name} width={PREVIEW_W} className="rounded-lg shadow-2xl shadow-black/80" draggable={false} />
        </div>
      )}

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
            {/* Card image */}
            <img
              src={item.image}
              alt={item.name}
              className="max-h-[85vh] rounded-lg shadow-2xl shrink-0"
              draggable={false}
            />

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
