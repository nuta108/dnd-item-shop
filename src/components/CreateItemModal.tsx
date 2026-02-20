import { useState, useEffect } from 'react';
import type { Item, ItemStats } from '../types/item';
import { IconBrowserModal } from './IconBrowserModal';

interface CreateItemModalProps {
  categories: string[];
  onCreateItem: (data: Omit<Item, 'id'>) => Promise<Item>;
  onClose: () => void;
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

// One icon per category (first icon) for quick picks
const QUICK_PICKS: { category: string; file: string }[] = [
  { category: 'Adventuring Gear', file: 'Abacus.svg' },
  { category: 'Ammunition', file: 'Adamantine Arrow.svg' },
  { category: 'Armour', file: 'Breastplate.svg' },
  { category: 'Books and Scrolls', file: 'Alchemical Compendium.svg' },
  { category: 'Food and Drink', file: 'Ale (Mug).svg' },
  { category: 'Gaming Sets', file: 'Board Game.svg' },
  { category: 'Instruments', file: 'Bagpipes.svg' },
  { category: 'Magical Items', file: 'Abracadabrus.svg' },
  { category: 'Mount and Tack', file: 'Axe Beak - Deed.svg' },
  { category: 'Potions, Poisions, Bottles, and Vials', file: 'Acid (vial).svg' },
  { category: 'Siege Equipment', file: 'Ballista.svg' },
  { category: 'Spell Components and Spellcasting foci', file: 'Acorn.svg' },
  { category: 'Tools, Kits, and Artisan Tools', file: 'Alchemists Supplies.svg' },
  { category: 'Trade Good', file: 'Adamantine Bar.svg' },
  { category: 'Treasure', file: 'Alexandrite.svg' },
  { category: 'Vehicles', file: 'Airship - Deed.svg' },
  { category: 'Weapons', file: 'Battleaxe.svg' },
];

type IconTab = 'pick' | 'custom';

export function CreateItemModal({ categories, onCreateItem, onClose }: CreateItemModalProps) {
  const [iconTab, setIconTab] = useState<IconTab>('pick');
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [customPath, setCustomPath] = useState('');
  const [showIconBrowser, setShowIconBrowser] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [stats, setStats] = useState<ItemStats>({ ...emptyStats });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof ItemStats>(key: K, value: ItemStats[K]) =>
    setStats((prev) => ({ ...prev, [key]: value }));

  const resolvedIcon = iconTab === 'custom' ? customPath : selectedIcon;
  const resolvedCategory = category === '__new__' ? newCategory.trim() : category;

  const handleCreate = async () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setSaving(true);
    try {
      await onCreateItem({
        name: name.trim(),
        category: resolvedCategory || 'Uncategorized',
        icon: resolvedIcon || null,
        stats,
      });
      onClose();
    } catch (err) {
      console.error('Create failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showIconBrowser && (
        <IconBrowserModal
          onSelect={(path) => { setSelectedIcon(path); setIconTab('pick'); }}
          onClose={() => setShowIconBrowser(false)}
        />
      )}

      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl flex flex-col"
          style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
            <h2 className="text-lg font-bold text-amber-300">Create New Item</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Modal body */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── Left panel: Icon selector ── */}
            <div className="w-56 shrink-0 border-r border-gray-700 flex flex-col p-4 gap-3 overflow-y-auto">
              {/* Tabs */}
              <div className="flex text-xs rounded overflow-hidden border border-gray-600">
                <button
                  onClick={() => setIconTab('pick')}
                  className={`flex-1 py-1 transition-colors cursor-pointer ${iconTab === 'pick' ? 'bg-amber-700/50 text-amber-300 font-semibold' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  Choose Icon
                </button>
                <button
                  onClick={() => setIconTab('custom')}
                  className={`flex-1 py-1 transition-colors cursor-pointer ${iconTab === 'custom' ? 'bg-amber-700/50 text-amber-300 font-semibold' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  Custom Path
                </button>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-lg border border-gray-600 bg-gray-900 flex items-center justify-center overflow-hidden">
                  {resolvedIcon ? (
                    <img
                      src={resolvedIcon}
                      alt="preview"
                      className="w-16 h-16 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-3xl text-gray-600">?</span>
                  )}
                </div>
                {resolvedIcon && (
                  <button
                    onClick={() => { setSelectedIcon(''); setCustomPath(''); }}
                    className="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Clear icon
                  </button>
                )}
              </div>

              {iconTab === 'pick' ? (
                <>
                  {/* Quick picks grid */}
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Quick picks</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {QUICK_PICKS.map(({ category: cat, file }) => {
                      const path = `/icons/${cat}/${file}`;
                      return (
                        <button
                          key={path}
                          onClick={() => setSelectedIcon(path)}
                          title={file.replace('.svg', '')}
                          className={`p-1 rounded border transition-colors cursor-pointer ${
                            selectedIcon === path
                              ? 'border-amber-400 bg-amber-900/30'
                              : 'border-transparent hover:border-gray-500 hover:bg-gray-700'
                          }`}
                        >
                          <img
                            src={path}
                            alt={file.replace('.svg', '')}
                            className="w-8 h-8 object-contain"
                                />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowIconBrowser(true)}
                    className="w-full py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-600"
                  >
                    Browse All Icons →
                  </button>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Icon path or URL</label>
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/icons/Weapons/Sword.svg"
                    className="w-full px-2 py-1.5 text-xs rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-600"
                  />
                </div>
              )}
            </div>

            {/* ── Right panel: Item details ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(false); }}
                    placeholder="Item name"
                    className={`w-full px-3 py-1.5 text-sm rounded bg-gray-700 border focus:outline-none text-gray-200 placeholder-gray-500 ${
                      nameError ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-amber-400'
                    }`}
                  />
                  {nameError && <p className="text-red-400 text-xs mt-0.5">Name is required</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__">+ New category…</option>
                  </select>
                  {category === '__new__' && (
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category name"
                      className="mt-1 w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-amber-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                      autoFocus
                    />
                  )}
                </div>

                {/* Category Detail */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Category Detail</label>
                  <input
                    type="text"
                    value={stats.category_detail ?? ''}
                    onChange={(e) => set('category_detail', e.target.value || null)}
                    placeholder="e.g. Simple Melee"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Cost</label>
                  <input
                    type="text"
                    value={stats.cost ?? ''}
                    onChange={(e) => set('cost', e.target.value || null)}
                    placeholder="e.g. 15 gp"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Weight</label>
                  <input
                    type="text"
                    value={stats.weight ?? ''}
                    onChange={(e) => set('weight', e.target.value || null)}
                    placeholder="e.g. 3 lb."
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Damage Dice */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Damage Dice</label>
                  <input
                    type="text"
                    value={stats.damage_dice ?? ''}
                    onChange={(e) => set('damage_dice', e.target.value || null)}
                    placeholder="e.g. 1d8"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Damage Type */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Damage Type</label>
                  <input
                    type="text"
                    value={stats.damage_type ?? ''}
                    onChange={(e) => set('damage_type', e.target.value || null)}
                    placeholder="e.g. Slashing"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* AC Display */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">AC Display</label>
                  <input
                    type="text"
                    value={stats.ac_display ?? ''}
                    onChange={(e) => set('ac_display', e.target.value || null)}
                    placeholder="e.g. 16"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Strength Required */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Str Required</label>
                  <input
                    type="number"
                    value={stats.strength_required ?? ''}
                    onChange={(e) => set('strength_required', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g. 15"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Stealth Disadvantage */}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stealth-disadv"
                    checked={stats.stealth_disadvantage ?? false}
                    onChange={(e) => set('stealth_disadvantage', e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="stealth-disadv" className="text-sm text-gray-300 cursor-pointer select-none">
                    Stealth Disadvantage
                  </label>
                </div>

                {/* Properties */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Properties</label>
                  <input
                    type="text"
                    value={stats.properties.join(', ')}
                    onChange={(e) =>
                      set('properties', e.target.value ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean) : [])
                    }
                    placeholder="comma-separated, e.g. Versatile, Thrown"
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Description</label>
                  <textarea
                    value={stats.description ?? ''}
                    onChange={(e) => set('description', e.target.value || null)}
                    placeholder="Item description..."
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-700 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-5 py-2 text-sm rounded bg-green-700 hover:bg-green-600 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : '✓ Create Item'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
