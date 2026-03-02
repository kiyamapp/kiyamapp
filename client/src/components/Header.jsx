import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <>
    {/* Top contact bar */}
    <div className="bg-[#070b14] border-b border-[#1e293b] px-6 py-1.5 flex items-center justify-center gap-2">
      <span className="text-[#334155] font-mono text-[10px]">
        {i18n.language === 'tr' ? 'Reklam & iletişim:' : 'Ads & contact:'}
      </span>
      <a href="mailto:kiyamappbizness@gmail.com" className="text-terminal-accent/70 hover:text-terminal-accent font-mono text-[10px] transition">
        kiyamappbizness@gmail.com
      </a>
    </div>
    <header className="bg-terminal-card border-b border-terminal-border px-6 py-3 flex items-center justify-between">
      <Link to="/home" className="flex items-center gap-3">
        <span className="text-terminal-green text-2xl font-mono font-bold">&#9678;</span>
        <span className="text-xl font-mono font-bold text-white">{t('appName')}</span>
        <span className="text-xs text-terminal-gray font-mono hidden sm:inline">{t('subtitle')}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm font-mono">
        <Link to="/home" className="text-terminal-gray hover:text-white transition">{t('nav.home')}</Link>
        <Link to="/admin" className="text-terminal-gray hover:text-white transition">{t('nav.admin')}</Link>
        <button onClick={toggleLang} className="px-2 py-1 border border-terminal-border rounded text-terminal-accent hover:bg-terminal-accent/10 transition text-xs">
          {i18n.language === 'tr' ? 'EN' : 'TR'}
        </button>
      </nav>
    </header>
    </>
  );
}
