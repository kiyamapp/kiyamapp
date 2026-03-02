import { useTranslation } from 'react-i18next';

const sources = ['İslam', 'Hristiyanlık', 'Yahudilik', 'Hinduizm', 'Budizm', 'Diğer'];
const statuses = ['Oldu', 'Olmak Üzere', 'Olmadı', 'Olamayacak'];

export default function Filters({ sourceFilter, statusFilter, search, onSourceChange, onStatusChange, onSearchChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={t('filters.search')}
        className="bg-terminal-card border border-terminal-border rounded px-3 py-1.5 text-sm font-mono text-white placeholder-terminal-gray focus:border-terminal-accent focus:outline-none"
      />
      <select
        value={sourceFilter}
        onChange={e => onSourceChange(e.target.value)}
        className="bg-terminal-card border border-terminal-border rounded px-3 py-1.5 text-sm font-mono text-white focus:border-terminal-accent focus:outline-none"
      >
        <option value="">{t('filters.filterByReligion')}: {t('filters.all')}</option>
        {sources.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        className="bg-terminal-card border border-terminal-border rounded px-3 py-1.5 text-sm font-mono text-white focus:border-terminal-accent focus:outline-none"
      >
        <option value="">{t('filters.filterByStatus')}: {t('filters.all')}</option>
        {statuses.map(s => (
          <option key={s} value={s}>{t(`status.${s}`)}</option>
        ))}
      </select>
    </div>
  );
}
