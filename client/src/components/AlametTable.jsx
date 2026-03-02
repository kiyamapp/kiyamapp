import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';

export default function AlametTable({ alametler }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-terminal-border text-terminal-gray text-xs uppercase">
            <th className="text-left py-3 px-4">{t('table.sign')}</th>
            <th className="text-left py-3 px-4">{t('table.source')}</th>
            <th className="text-left py-3 px-4">{t('table.status')}</th>
            <th className="text-left py-3 px-4">{t('table.date')}</th>
          </tr>
        </thead>
        <tbody>
          {alametler.map(a => (
            <tr key={a._id} className="border-b border-terminal-border/50 hover:bg-terminal-accent/5 transition">
              <td className="py-3 px-4 text-white">{lang === 'en' ? a.titleEN : a.titleTR}</td>
              <td className="py-3 px-4 text-terminal-gray">{a.source}</td>
              <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
              <td className="py-3 px-4 text-terminal-gray text-xs">{new Date(a.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {alametler.length === 0 && (
        <p className="text-center text-terminal-gray py-8 font-mono text-sm">No data</p>
      )}
    </div>
  );
}
