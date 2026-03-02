import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import AlametTable from '../components/AlametTable';
import AlametCard from '../components/AlametCard';
import Filters from '../components/Filters';
import TrendChart from '../components/TrendChart';
import ApocalypseIndex from '../components/ApocalypseIndex';
import AdBanner from '../components/AdBanner';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { i18n } = useTranslation();
  const [alametler, setAlametler] = useState([]);
  const [sourceFilter, setSourceFilter] = useState(localStorage.getItem('religion') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    api.get('/api/alamet').then(res => setAlametler(res.data)).catch(console.error);
  }, []);

  const lang = i18n.language;

  const filtered = alametler.filter(a => {
    if (sourceFilter && a.source !== sourceFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const title = (lang === 'en' ? a.titleEN : a.titleTR).toLowerCase();
      const desc = (lang === 'en' ? a.descriptionEN : a.descriptionTR).toLowerCase();
      if (!title.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-terminal-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Top banner ad */}
        <div className="mb-4">
          <AdBanner variant="leaderboard" />
        </div>

        <ApocalypseIndex />

        <div className="flex items-center justify-between mb-4">
          <Filters
            sourceFilter={sourceFilter}
            statusFilter={statusFilter}
            search={search}
            onSourceChange={setSourceFilter}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearch}
          />
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-mono rounded border transition ${viewMode === 'table' ? 'border-terminal-accent text-terminal-accent' : 'border-terminal-border text-terminal-gray'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-mono rounded border transition ${viewMode === 'cards' ? 'border-terminal-accent text-terminal-accent' : 'border-terminal-border text-terminal-gray'}`}
            >
              Cards
            </button>
          </div>
        </div>

        <div className="bg-terminal-card border border-terminal-border rounded-lg mb-6">
          {viewMode === 'table' ? (
            <AlametTable alametler={filtered} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filtered.map(a => <AlametCard key={a._id} alamet={a} />)}
            </div>
          )}
        </div>

        {/* Mid-page inline ad */}
        <div className="mb-6">
          <AdBanner variant="inline" />
        </div>

        <TrendChart alametler={filtered} />

        {/* Bottom banner ad */}
        <div className="mt-6">
          <AdBanner variant="leaderboard" />
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-terminal-border pt-4 pb-6 text-center">
          <p className="text-[#334155] font-mono text-xs">
            {i18n.language === 'tr'
              ? 'Reklam ve iş birliği için:'
              : 'For advertising and partnerships:'}
          </p>
          <a href="mailto:kiyamappbizness@gmail.com" className="text-terminal-accent font-mono text-sm hover:underline">
            kiyamappbizness@gmail.com
          </a>
          <p className="text-[#1e293b] font-mono text-[10px] mt-2">
            &copy; {new Date().getFullYear()} KıyamApp
          </p>
        </footer>
      </main>
    </div>
  );
}
