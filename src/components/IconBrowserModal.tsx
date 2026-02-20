import { useState, useEffect, useMemo } from 'react';

interface IconManifest {
  [category: string]: string[];
}

interface IconBrowserModalProps {
  onSelect: (iconPath: string) => void;
  onClose: () => void;
}

export function IconBrowserModal({ onSelect, onClose }: IconBrowserModalProps) {
  const [manifest, setManifest] = useState<IconManifest>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    fetch('/icon-manifest.json')
      .then((r) => r.json())
      .then((data: IconManifest) => {
        setManifest(data);
        const firstCat = Object.keys(data)[0] ?? '';
        setActiveCategory(firstCat);
      })
      .catch((err) => console.error('Failed to load icon manifest:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categories = useMemo(() => Object.keys(manifest), [manifest]);

  const filteredIcons = useMemo(() => {
    if (search.trim()) {
      // Search across all categories
      const results: { category: string; file: string; path: string }[] = [];
      for (const [cat, files] of Object.entries(manifest)) {
        for (const file of files) {
          const name = file.includes('/') ? file.split('/').pop()! : file;
          if (name.toLowerCase().replace('.svg', '').includes(search.toLowerCase())) {
            results.push({ category: cat, file, path: `/icons/${cat}/${file}` });
          }
        }
      }
      return results;
    }
    if (!activeCategory || !manifest[activeCategory]) return [];
    return manifest[activeCategory].map((file) => ({
      category: activeCategory,
      file,
      path: `/icons/${activeCategory}/${file}`,
    }));
  }, [manifest, search, activeCategory]);

  const getDisplayName = (file: string) => {
    const base = file.includes('/') ? file.split('/').pop()! : file;
    return base.replace('.svg', '');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-600 rounded-xl shadow-2xl flex flex-col"
        style={{ width: '90vw', maxWidth: '1000px', height: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
          <h2 className="text-lg font-bold text-amber-300">Browse Icons</h2>
          <div className="flex items-center gap-3 flex-1 mx-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              autoFocus
              className="flex-1 px-3 py-1.5 text-sm rounded bg-gray-700 border border-gray-600 focus:border-amber-400 focus:outline-none text-gray-200 placeholder-gray-500"
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar — hidden when searching */}
          {!search.trim() && (
            <div className="w-52 shrink-0 border-r border-gray-700 overflow-y-auto py-2">
              {loading ? (
                <p className="text-gray-500 text-xs px-3 py-2">Loading...</p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-amber-700/40 text-amber-300 font-semibold'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    {cat}
                    <span className="float-right text-gray-600 text-[10px]">{manifest[cat]?.length ?? 0}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Icon grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <p className="text-gray-500 text-sm text-center mt-8">Loading icons...</p>
            ) : filteredIcons.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-8">No icons found</p>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
                {filteredIcons.map(({ file, path, category }) => (
                  <button
                    key={`${category}/${file}`}
                    onClick={() => { onSelect(path); onClose(); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-transparent hover:border-amber-500 hover:bg-gray-800 transition-colors cursor-pointer group"
                    title={getDisplayName(file)}
                  >
                    <img
                      src={path}
                      alt={getDisplayName(file)}
                      className="w-12 h-12 object-contain opacity-80 group-hover:opacity-100"
                    />
                    <span className="text-[9px] text-gray-400 group-hover:text-gray-200 text-center leading-tight line-clamp-2 w-full">
                      {getDisplayName(file)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-700 shrink-0 text-xs text-gray-500">
          {search.trim()
            ? `${filteredIcons.length} results`
            : `${filteredIcons.length} icons in ${activeCategory}`}
        </div>
      </div>
    </div>
  );
}
