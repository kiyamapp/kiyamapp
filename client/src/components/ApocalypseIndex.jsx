import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceDot
} from 'recharts';
import api from '../api';

// ===== PERIOD CONFIG =====
const PERIODS = [
  { key: '1H',   tr: '1 Saat',    en: '1H' },
  { key: '1D',   tr: '1 Gün',     en: '1D' },
  { key: '1W',   tr: '1 Hafta',   en: '1W' },
  { key: '1M',   tr: '1 Ay',      en: '1M' },
  { key: '1Y',   tr: '1 Yıl',     en: '1Y' },
  { key: '10Y',  tr: '10 Yıl',    en: '10Y' },
  { key: '100Y', tr: '100 Yıl',   en: '100Y' },
  { key: 'ALL',  tr: 'Tüm Zaman', en: 'All Time' },
];

// ===== X-AXIS DATE FORMATTING PER PERIOD =====
function formatXAxis(ts, period) {
  const d = new Date(ts);
  const year = d.getFullYear();

  switch (period) {
    case '1H':
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    case '1D':
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    case '1W':
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) + '\n' +
             d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    case '1M':
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    case '1Y':
      return d.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    case '10Y':
      return year.toString();
    case '100Y':
      return year < 0 ? `MÖ ${Math.abs(year)}` : year.toString();
    case 'ALL':
      if (year < 0) return `MÖ ${Math.abs(year)}`;
      if (year < 1000) return `MS ${year}`;
      return year.toString();
    default:
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  }
}

// ===== FULL TIMESTAMP FOR TOOLTIP =====
function formatFullTime(ts) {
  const d = new Date(ts);
  const year = d.getFullYear();

  if (year < 0) {
    return `MÖ ${Math.abs(year)} (${Math.abs(year)} BC)`;
  }
  if (year < 1000) {
    return `MS ${year} (${year} AD)`;
  }

  return d.toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }) + ' ' + d.toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// ===== TOOLTIP =====
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#0f1520] border border-[#2a3448] rounded-lg px-4 py-3 shadow-2xl max-w-sm z-50">
      <p className="text-white font-mono text-lg font-bold mb-1">
        {data.value?.toFixed(2)}
        <span className="text-[#475569] text-xs ml-2">/ 100</span>
      </p>
      <p className="text-[#64748b] font-mono text-[10px] mb-2">{formatFullTime(data.timestamp)}</p>
      {data.change !== undefined && data.change !== 0 && (
        <p className={`font-mono text-xs ${data.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {data.change > 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(4)}
          {data.magnitude && data.magnitude !== 'minimal' && (
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
              data.magnitude === 'major' ? 'bg-red-500/20 text-red-400' :
              data.magnitude === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>{data.magnitude.toUpperCase()}</span>
          )}
        </p>
      )}
      {data.trigger && (
        <p className="text-[#94a3b8] font-mono text-[10px] mt-1.5 leading-tight border-t border-[#2a3448] pt-1.5">
          {data.trigger}
        </p>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function ApocalypseIndex() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('ALL');
  const [news, setNews] = useState({ topEvents: [], celestial: null });
  const [newsIdx, setNewsIdx] = useState(0);

  // Poll current value every 5s
  useEffect(() => {
    const fn = () => api.get('/api/index/current').then(r => setCurrent(r.data)).catch(() => {});
    fn();
    const iv = setInterval(fn, 5000);
    return () => clearInterval(iv);
  }, []);

  // Fetch history on period change + refresh every 10s
  useEffect(() => {
    const fn = () => {
      api.get(`/api/index/history?period=${period}`).then(r => {
        setHistory(r.data.map(p => ({
          ...p,
          xLabel: formatXAxis(p.timestamp, period)
        })));
      }).catch(() => {});
    };
    fn();
    const iv = setInterval(fn, 10000);
    return () => clearInterval(iv);
  }, [period]);

  // Poll news every 30s
  useEffect(() => {
    const fn = () => api.get('/api/index/news').then(r => setNews(r.data)).catch(() => {});
    fn();
    const iv = setInterval(fn, 30000);
    return () => clearInterval(iv);
  }, []);

  // News ticker rotation
  useEffect(() => {
    if (!news.topEvents?.length) return;
    const iv = setInterval(() => setNewsIdx(i => (i + 1) % news.topEvents.length), 5000);
    return () => clearInterval(iv);
  }, [news.topEvents]);

  // Calculations
  const isUp = current && current.change >= 0;
  const lineColor = isUp ? '#ef4444' : '#22c55e';
  const bgGradient = isUp ? 'idxGradRed' : 'idxGradGreen';

  const values = history.map(h => h.value);
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 100;
  const padding = Math.max(1, (dataMax - dataMin) * 0.08);
  const yMin = Math.max(0, Math.floor(dataMin - padding));
  const yMax = Math.min(100, Math.ceil(dataMax + padding));

  // Major event markers
  const majorPoints = history.filter(h => h.magnitude === 'major' || h.magnitude === 'moderate');

  // Calculate tick interval for x-axis
  let tickInterval = 'preserveStartEnd';
  if (history.length > 50) tickInterval = Math.floor(history.length / 12);
  if (history.length > 200) tickInterval = Math.floor(history.length / 10);

  const currentNews = news.topEvents?.[newsIdx];

  // Period change stats
  const periodOpen = history.length > 0 ? history[0].value : 0;
  const periodChange = current ? current.value - periodOpen : 0;
  const periodChangePercent = periodOpen ? ((periodChange / periodOpen) * 100) : 0;

  return (
    <div className="bg-[#0b1120] border border-[#1e293b] rounded-xl overflow-hidden mb-6 shadow-2xl">

      {/* ===== HEADER ===== */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-white font-mono text-sm font-bold tracking-widest uppercase">
              {lang === 'tr' ? 'Kıyamet Endeksi' : 'Apocalypse Index'}
            </h2>
            <span className="text-[#475569] font-mono text-[10px]">KYMT</span>
          </div>
          {/* Period buttons */}
          <div className="flex gap-0.5 bg-[#0f1729] rounded-lg p-0.5 flex-wrap">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2 py-1 text-[10px] font-mono rounded-md transition-all whitespace-nowrap ${
                  period === p.key
                    ? 'bg-[#1e293b] text-white shadow-sm'
                    : 'text-[#475569] hover:text-[#94a3b8]'
                }`}
              >
                {lang === 'tr' ? p.tr : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CURRENT VALUE ===== */}
        {current && (
          <div className="mt-3 mb-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-mono font-black text-white tracking-tight">
                {current.value?.toFixed(2)}
              </span>
              <span className="text-[#475569] font-mono text-sm">/100</span>
              <div className="flex items-center gap-2">
                <span className={`text-base font-mono font-bold ${periodChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {periodChange >= 0 ? '▲' : '▼'} {Math.abs(periodChange).toFixed(2)}
                </span>
                <span className={`text-sm font-mono px-1.5 py-0.5 rounded ${
                  periodChange >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                }`}>
                  {periodChange >= 0 ? '+' : ''}{periodChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="text-[#475569] text-[11px] font-mono">
                {formatFullTime(current.timestamp)}
              </span>
              {news.celestial?.event && (
                <span className="text-purple-400 text-[11px] font-mono animate-pulse">
                  🌑 {news.celestial.event} (+{news.celestial.boost?.toFixed(1)})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== CHART ===== */}
      <div className="px-1" style={{ height: 360 }}>
        {history.length > 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 55, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="idxGradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="40%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="idxGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="40%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="xLabel"
                tick={{ fill: '#334155', fontFamily: 'JetBrains Mono', fontSize: 9 }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={false}
                interval={tickInterval}
                angle={['ALL', '100Y', '10Y'].includes(period) ? -35 : 0}
                textAnchor={['ALL', '100Y', '10Y'].includes(period) ? 'end' : 'middle'}
                height={['ALL', '100Y', '10Y'].includes(period) ? 50 : 30}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: '#334155', fontFamily: 'JetBrains Mono', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                orientation="right"
                tickFormatter={v => v.toFixed(0)}
                width={35}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* Current value reference line */}
              {current && (
                <ReferenceLine
                  y={current.value}
                  stroke={lineColor}
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
              )}

              {/* Major event dots */}
              {majorPoints.slice(0, 30).map((mp, i) => (
                <ReferenceDot
                  key={i}
                  x={mp.xLabel}
                  y={mp.value}
                  r={mp.magnitude === 'major' ? 4 : 3}
                  fill={mp.change > 0 ? '#ef4444' : '#22c55e'}
                  stroke="#0b1120"
                  strokeWidth={2}
                />
              ))}

              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={1.5}
                fill={`url(#${bgGradient})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-pulse text-red-500 text-3xl mb-3">&#9678;</div>
              <p className="text-[#475569] font-mono text-sm">
                {lang === 'tr' ? 'Endeks verisi toplanıyor...' : 'Collecting index data...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===== CURRENT VALUE BADGE ===== */}
      {current && history.length > 2 && (
        <div className="relative h-0">
          <div className={`absolute right-0 -top-4 px-2 py-0.5 text-[11px] font-mono font-bold text-white rounded-l shadow-lg ${
            isUp ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {current.value?.toFixed(2)}
          </div>
        </div>
      )}

      {/* ===== STATS BAR ===== */}
      {current && (
        <div className="grid grid-cols-5 border-t border-[#1e293b]">
          <div className="px-3 py-2.5 border-r border-[#1e293b]">
            <p className="text-[#475569] text-[10px] font-mono uppercase">{lang === 'tr' ? 'Açılış' : 'Open'}</p>
            <p className="text-white text-sm font-mono font-bold">{periodOpen?.toFixed(2)}</p>
          </div>
          <div className="px-3 py-2.5 border-r border-[#1e293b]">
            <p className="text-[#475569] text-[10px] font-mono uppercase">{lang === 'tr' ? 'Güncel' : 'Current'}</p>
            <p className="text-white text-sm font-mono font-bold">{current.value?.toFixed(2)}</p>
          </div>
          <div className="px-3 py-2.5 border-r border-[#1e293b]">
            <p className="text-[#475569] text-[10px] font-mono uppercase">{lang === 'tr' ? 'En Yüksek' : 'High'}</p>
            <p className="text-red-400 text-sm font-mono font-bold">{dataMax.toFixed(2)}</p>
          </div>
          <div className="px-3 py-2.5 border-r border-[#1e293b]">
            <p className="text-[#475569] text-[10px] font-mono uppercase">{lang === 'tr' ? 'En Düşük' : 'Low'}</p>
            <p className="text-green-400 text-sm font-mono font-bold">{dataMin.toFixed(2)}</p>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[#475569] text-[10px] font-mono uppercase">{lang === 'tr' ? 'Haber Etkisi' : 'News'}</p>
            <p className={`text-sm font-mono font-bold ${
              (news.delta || 0) > 0 ? 'text-red-400' : (news.delta || 0) < 0 ? 'text-green-400' : 'text-[#64748b]'
            }`}>
              {(news.delta || 0) > 0 ? '+' : ''}{(news.delta || 0).toFixed(3)}
            </p>
          </div>
        </div>
      )}

      {/* ===== NEWS TICKER ===== */}
      <div className="border-t border-[#1e293b] px-4 py-2.5 flex items-center gap-3">
        {currentNews ? (
          <>
            <span className={`flex-shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              currentNews.magnitude === 'major' ? 'bg-red-500/20 text-red-400' :
              currentNews.magnitude === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              currentNews.score > 0 ? 'bg-orange-500/15 text-orange-400' :
              'bg-green-500/15 text-green-400'
            }`}>
              {currentNews.score > 0 ? '▲ RISK' : '▼ SAFE'}
              {currentNews.deaths > 0 ? ` ☠${currentNews.deaths}` : ''}
            </span>
            <p className="text-[#64748b] text-[11px] font-mono truncate flex-1">
              {currentNews.headline}
            </p>
            <span className={`flex-shrink-0 text-[11px] font-mono font-bold ${
              currentNews.delta > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {currentNews.delta > 0 ? '+' : ''}{currentNews.delta?.toFixed(3)}
            </span>
          </>
        ) : (
          <p className="text-[#334155] text-[11px] font-mono">
            {lang === 'tr' ? 'Haberler analiz ediliyor...' : 'Analyzing news...'}
          </p>
        )}
      </div>

      {/* ===== SCALE BAR ===== */}
      <div className="border-t border-[#1e293b] px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-[#475569] text-[9px] font-mono">0-25 {lang === 'tr' ? 'Düşük' : 'Low'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
            <span className="text-[#475569] text-[9px] font-mono">25-50 {lang === 'tr' ? 'Orta' : 'Med'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <span className="text-[#475569] text-[9px] font-mono">50-75 {lang === 'tr' ? 'Yüksek' : 'High'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span className="text-[#475569] text-[9px] font-mono">75-100 {lang === 'tr' ? 'Kritik' : 'Crit'}</span>
          </div>
        </div>
        <span className="text-[#334155] text-[9px] font-mono">
          {history.length} {lang === 'tr' ? 'veri noktası' : 'data points'} ·{' '}
          {news.headlineCount || 0} {lang === 'tr' ? 'haber' : 'news'}
        </span>
      </div>
    </div>
  );
}
