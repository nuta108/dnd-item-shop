import { useState } from 'react';
import type { Item, ItemStats } from '../types/item';

interface ItemEditFormProps {
  item: Item;
  onSave: (id: string, patch: Partial<Item>) => Promise<unknown>;
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

export function ItemEditForm({ item, onSave, onCancel }: ItemEditFormProps) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [stats, setStats] = useState<ItemStats>(item.stats ?? { ...emptyStats });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ItemStats>(key: K, value: ItemStats[K]) =>
    setStats((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(item.id, { name, category, stats });
      onCancel(); // close form on success
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="w-80 max-h-[85vh] overflow-y-auto rounded shadow-2xl p-4 space-y-3 text-sm"
      style={{ background: '#fdf1dc', fontFamily: 'Georgia, serif' }}
    >
      <h2 className="text-lg font-bold text-[#7a200d]">Edit Item</h2>

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
    </div>
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
