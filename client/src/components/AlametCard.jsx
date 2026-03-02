import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';

export default function AlametCard({ alamet }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const title = lang === 'en' ? alamet.titleEN : alamet.titleTR;
  const desc = lang === 'en' ? alamet.descriptionEN : alamet.descriptionTR;

  return (
    <div className="group bg-terminal-card border border-terminal-border rounded-lg p-4 hover:border-terminal-accent/50 transition-all terminal-glow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-mono text-sm font-medium leading-tight">{title}</h3>
        <StatusBadge status={alamet.status} />
      </div>
      <p className="text-terminal-gray text-xs font-mono mb-2">{alamet.source}</p>
      <p className="text-gray-400 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200">{desc}</p>
    </div>
  );
}
