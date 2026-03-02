import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'Oldu': '#22c55e',
  'Olmak Üzere': '#eab308',
  'Olmadı': '#6b7280',
  'Olamayacak': '#ef4444',
};

export default function TrendChart({ alametler }) {
  const { t } = useTranslation();

  const statusCounts = alametler.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: t(`status.${name}`),
    value,
    color: COLORS[name],
  }));

  const sourceCounts = alametler.reduce((acc, a) => {
    if (!acc[a.source]) acc[a.source] = { source: a.source, count: 0 };
    acc[a.source].count++;
    return acc;
  }, {});
  const barData = Object.values(sourceCounts);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-white font-mono text-sm mb-4">{t('chart.title')}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fill: '#e2e8f0', fontFamily: 'JetBrains Mono', fontSize: 12 }} stroke="#111827">
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12, color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#e2e8f0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-white font-mono text-sm mb-4">{t('chart.trend')}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="source" tick={{ fill: '#6b7280', fontFamily: 'JetBrains Mono', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontFamily: 'JetBrains Mono', fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
