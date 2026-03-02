import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdBanner from '../components/AdBanner';

const religions = [
  { value: 'İslam', labelKey: 'religions.islam' },
  { value: 'Hristiyanlık', labelKey: 'religions.christianity' },
  { value: 'Yahudilik', labelKey: 'religions.judaism' },
  { value: 'Hinduizm', labelKey: 'religions.hinduism' },
  { value: 'Budizm', labelKey: 'religions.buddhism' },
  { value: 'Diğer', labelKey: 'religions.other' },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [religion, setReligion] = useState('İslam');
  const [lang, setLang] = useState(i18n.language);

  const handleEnter = () => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    localStorage.setItem('religion', religion);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center p-4 gap-4">
      {/* Top ad */}
      <div className="w-full max-w-md">
        <AdBanner variant="banner" />
      </div>

      <div className="w-full max-w-md">
        {/* Terminal header */}
        <div className="bg-terminal-card border border-terminal-border rounded-t-lg px-4 py-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="ml-3 text-terminal-gray text-xs font-mono">kiyamapp_terminal</span>
        </div>

        {/* Terminal body */}
        <div className="bg-terminal-card border border-terminal-border border-t-0 rounded-b-lg p-8 terminal-glow">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-mono font-bold text-terminal-green mb-2">
              &#9678; {t('appName')}
            </h1>
            <p className="text-terminal-gray text-sm font-mono">{t('subtitle')}</p>
            <p className="text-gray-500 text-xs mt-2">{t('landing.description')}</p>
          </div>

          <div className="space-y-4">
            {/* Language selector */}
            <div>
              <label className="block text-terminal-gray text-xs font-mono mb-1 uppercase tracking-wider">
                {t('landing.selectLanguage')}
              </label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Religion selector */}
            <div>
              <label className="block text-terminal-gray text-xs font-mono mb-1 uppercase tracking-wider">
                {t('landing.selectReligion')}
              </label>
              <select
                value={religion}
                onChange={e => setReligion(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none"
              >
                {religions.map(r => (
                  <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEnter}
              className="w-full bg-terminal-accent hover:bg-terminal-accent/80 text-white font-mono font-bold py-3 rounded transition mt-4"
            >
              {t('landing.enter')} &rarr;
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-terminal-gray text-xs font-mono animate-pulse">
              $ connecting to terminal...
            </span>
          </div>
        </div>
      </div>

      {/* Bottom ad */}
      <div className="w-full max-w-md">
        <AdBanner variant="banner" />
      </div>
    </div>
  );
}
