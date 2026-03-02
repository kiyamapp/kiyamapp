import { useTranslation } from 'react-i18next';

const statusConfig = {
  'Oldu': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
  'Olmak Üzere': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🟡' },
  'Olmadı': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '⚪' },
  'Olamayacak': { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴' },
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig['Olmadı'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${config.color}`}>
      <span>{config.icon}</span>
      <span>{t(`status.${status}`)}</span>
    </span>
  );
}
