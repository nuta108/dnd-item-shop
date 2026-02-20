import { useState } from 'react';
import type { Item, ItemStats } from '../types/item';
import { IconBrowserModal } from './IconBrowserModal';

interface ItemEditFormProps {
  item: Item;
  onSave: (id: string, patch: Partial<Item>) => Promise<unknown>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}

const emptyStats: ItemStats = {
  cost: null,
  weight: null,
  damage_dice: null,
  damage_type: null,
  properties: [],
  category_detail: null,
  description: null,
  ac_display: null,
  stealth_disadvantage: null,
  strength_required: null,
};

export function ItemEditForm({ item, onSave, onDelete, onCancel }: ItemEditFormProps) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [icon, setIcon] = useState(item.icon ?? '');
  const [stats, setStats] = useState<ItemStats>(item.stats ?? { ...emptyStats });
  const [saving, setSaving] = useState(false);
  const [showIconBrowser, setShowIconBrowser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof ItemStats>(key: K, value: ItemStats[K]) =>
    setStats((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(item.id, { name, category, icon: icon || null, stats });
      onCancel();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
      onCancel();
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  return (
    <>
      {showIconBrowser && (
        <IconBrowserModal
          onSelect={(path) => { setIcon(path); setShowIconBrowser(false); }}
          onClose={() => setShowIconBrowser(false)}
        />
      )}

      <div
        className="w-80 max-h-[85vh] overflow-y-auto rounded shadow-2xl p-4 space-y-3 text-sm"
        style={{ background: '#fdf1dc', fontFamily: 'Georgia, serif' }}
      >
        <h2 className="text-lg font-bold text-[#7a200d]">Edit Item</h2>

        {/* Icon editor */}
        <div>
          <label className="block font-bold text-[#7a200d] mb-1">Icon</label>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-12 h-12 rounded border border-amber-300 bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden">
              {icon
                ? <img src={icon} alt="icon" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <span className="text-gray-400 text-xl">?</span>
              }
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <button
                onClick={() => setShowIconBrowser(true)}
                className="w-full px-2 py-1 text-xs rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold cursor-pointer transition-colors"
              >
                Browse Icons
              </button>
              {icon && (
                <button
                  onClick={() => setIcon('')}
                  className="w-full px-2 py-1 text-xs rounded bg-gray-300 hover:bg-gray-400 text-gray-700 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <input
            className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-gray-900 text-xs"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="or paste path / URL"
          />
        </div>

        <Field label="Name" value={name} onChange={setName} />
        <Field label="Category" value={category} onChange={setCategory} />
        <Field label="Cost" value={stats.cost ?? ''} onChange={(v) => set('cost', v || null)} />
        <Field label="Weight" value={stats.weight ?? ''} onChange={(v) => set('weight', v || null)} />
        <Field label="Damage Dice" value={stats.damage_dice ?? ''} onChange={(v) => set('damage_dice', v || null)} />
        <Field label="Damage Type" value={stats.damage_type ?? ''} onChange={(v) => set('damage_type', v || null)} />
        <Field label="AC Display" value={stats.ac_display ?? ''} onChange={(v) => set('ac_display', v || null)} />
        <Field label="Category Detail" value={stats.category_detail ?? ''} onChange={(v) => set('category_detail', v || null)} />

        <div>
          <label className="block font-bold text-[#7a200d] mb-0.5">Properties</label>
          <input
            className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-gray-900 text-sm"
            value={stats.properties.join(', ')}
            onChange={(e) => set('properties', e.target.value ? e.target.value.split(',').map((s) => s.trim()) : [])}
            placeholder="comma-separated"
          />
        </div>

        <div>
          <label className="block font-bold text-[#7a200d] mb-0.5">Description</label>
          <textarea
            className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-gray-900 text-sm min-h-[60px]"
            value={stats.description ?? ''}
            onChange={(e) => set('description', e.target.value || null)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="font-bold text-[#7a200d]">Stealth Disadv.</label>
          <input
            type="checkbox"
            checked={stats.stealth_disadvantage ?? false}
            onChange={(e) => set('stealth_disadvantage', e.target.checked)}
          />
        </div>

        <Field
          label="Str Required"
          value={stats.strength_required != null ? String(stats.strength_required) : ''}
          onChange={(v) => set('strength_required', v ? Number(v) : null)}
        />

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white rounded py-1.5 font-bold cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-400 text-white rounded py-1.5 font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Delete section */}
        {onDelete && (
          <div className="border-t border-amber-300 pt-3">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full bg-red-700 hover:bg-red-600 text-white rounded py-1.5 font-bold cursor-pointer transition-colors"
              >
                Delete Item
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-sm text-red-800 font-semibold">Delete "{item.name}"?</p>
                <p className="text-center text-xs text-gray-600">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded py-1.5 font-bold cursor-pointer disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-400 text-white rounded py-1.5 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-bold text-[#7a200d] mb-0.5">{label}</label>
      <input
        className="w-full rounded border border-amber-300 bg-amber-50 px-2 py-1 text-gray-900 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
