import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';
import type { ShortcutImportDraftRow } from '../utils/shortcutImport';

type ShortcutImportModalProps = {
  open: boolean;
  initialRows: ShortcutImportDraftRow[];
  categories: Category[];
  trCategory: (category: Category) => string;
  onCancel: () => void;
  onSave: (rows: ShortcutImportDraftRow[]) => void;
};

export default function ShortcutImportModal({
  open,
  initialRows,
  categories,
  trCategory,
  onCancel,
  onSave,
}: ShortcutImportModalProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ShortcutImportDraftRow[]>(initialRows);

  useEffect(() => {
    if (open) setRows(initialRows);
  }, [open, initialRows]);

  const updateRow = (rowKey: string, patch: Partial<Pick<ShortcutImportDraftRow, 'amount' | 'shop' | 'category'>>) => {
    setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  };

  const handleSave = () => {
    onSave(rows.filter((r) => r.amount > 0));
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/30 backdrop-blur-md"
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[min(90dvh,720px)] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-white text-[#111111] shadow-2xl border border-gray-100 overflow-hidden z-[10001]"
          >
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black">{t('shortcut_import.title')}</h2>
              <p className="mt-1 text-xs font-bold text-[#6E6E73]">{t('shortcut_import.subtitle')}</p>
            </div>

            <div className="flex-1 min-h-0 overflow-auto px-4 py-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] bg-[#F2F2F7] border-b border-gray-200">
                  <div className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#6E6E73] border-r border-gray-200">
                    {t('shortcut_import.amount')}
                  </div>
                  <div className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#6E6E73] border-r border-gray-200">
                    {t('shortcut_import.shop')}
                  </div>
                  <div className="px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#6E6E73]">
                    {t('shortcut_import.category')}
                  </div>
                </div>
                {rows.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs font-bold text-[#6E6E73]">{t('shortcut_import.empty')}</p>
                ) : (
                  rows.map((row, index) => (
                    <div
                      key={row.rowKey}
                      className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] ${index < rows.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="border-r border-gray-200 p-0">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={row.amount || ''}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            updateRow(row.rowKey, { amount: Number.isFinite(n) ? n : 0 });
                          }}
                          className="w-full h-full min-h-[44px] px-3 py-2 bg-transparent font-bold text-[#1D1D1F] focus:outline-none focus:bg-[#F6F8FA]"
                          aria-label={t('shortcut_import.amount')}
                        />
                      </div>
                      <div className="border-r border-gray-200 p-0">
                        <input
                          type="text"
                          value={row.shop}
                          onChange={(e) => updateRow(row.rowKey, { shop: e.target.value })}
                          className="w-full h-full min-h-[44px] px-3 py-2 bg-transparent font-bold text-[#1D1D1F] focus:outline-none focus:bg-[#F6F8FA]"
                          placeholder="—"
                          aria-label={t('shortcut_import.shop')}
                        />
                      </div>
                      <div className="p-0">
                        <select
                          value={row.category}
                          onChange={(e) => updateRow(row.rowKey, { category: e.target.value as Category })}
                          className="w-full h-full min-h-[44px] px-2 py-2 bg-transparent font-bold text-[#1D1D1F] focus:outline-none focus:bg-[#F6F8FA]"
                          aria-label={t('shortcut_import.category')}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {trCategory(cat)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="shrink-0 grid grid-cols-2 gap-3 px-6 py-5 border-t border-gray-100 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onCancel}
                className="py-4 rounded-2xl font-black text-xs border border-gray-200 text-gray-600 active:scale-95 transition-all"
              >
                {t('shortcut_import.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={rows.every((r) => r.amount <= 0)}
                className="py-4 rounded-2xl font-black text-xs bg-[#1D1D1F] text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
              >
                {t('shortcut_import.save_all')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
