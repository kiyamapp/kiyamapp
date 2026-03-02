import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import axios from 'axios';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import TrendChart from '../components/TrendChart';

const sources = ['İslam', 'Hristiyanlık', 'Yahudilik', 'Hinduizm', 'Budizm', 'Diğer'];
const statuses = ['Oldu', 'Olmak Üzere', 'Olmadı', 'Olamayacak'];

const emptyForm = { titleTR: '', titleEN: '', source: 'İslam', status: 'Olmadı', descriptionTR: '', descriptionEN: '' };

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [alametler, setAlametler] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchData();
  }, []);

  const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = () => {
    api.get('/api/alamet').then(res => setAlametler(res.data)).catch(console.error);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await authApi.put(`/api/alamet/${editId}`, form);
      } else {
        await authApi.post('/api/alamet', form);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin'); }
    }
  };

  const handleEdit = (a) => {
    setForm({
      titleTR: a.titleTR, titleEN: a.titleEN, source: a.source,
      status: a.status, descriptionTR: a.descriptionTR, descriptionEN: a.descriptionEN,
    });
    setEditId(a._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await authApi.delete(`/api/alamet/${id}`);
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin'); }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  // Stats
  const stats = statuses.map(s => ({
    status: s,
    count: alametler.filter(a => a.status === s).length
  }));

  return (
    <div className="min-h-screen bg-terminal-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-mono font-bold text-white">{t('admin.panel')}</h1>
          <div className="flex gap-3">
            <button
              onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              className="bg-terminal-green/20 text-terminal-green border border-terminal-green/30 px-4 py-1.5 rounded font-mono text-xs hover:bg-terminal-green/30 transition"
            >
              + {t('admin.addSign')}
            </button>
            <button onClick={handleLogout} className="border border-terminal-border text-terminal-gray px-4 py-1.5 rounded font-mono text-xs hover:text-white transition">
              {t('admin.logout')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.status} className="bg-terminal-card border border-terminal-border rounded-lg p-4 text-center">
              <StatusBadge status={s.status} />
              <p className="text-2xl font-mono font-bold text-white mt-2">{s.count}</p>
            </div>
          ))}
          <div className="hidden sm:block" />
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6 mb-6">
            <h2 className="text-white font-mono text-sm mb-4">{editId ? t('admin.editSign') : t('admin.addSign')}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder={t('admin.titleTR')} value={form.titleTR} onChange={e => setForm({...form, titleTR: e.target.value})} required
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none" />
              <input placeholder={t('admin.titleEN')} value={form.titleEN} onChange={e => setForm({...form, titleEN: e.target.value})} required
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none" />
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none">
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none">
                {statuses.map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
              </select>
              <textarea placeholder={t('admin.descTR')} value={form.descriptionTR} onChange={e => setForm({...form, descriptionTR: e.target.value})} rows={2}
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none" />
              <textarea placeholder={t('admin.descEN')} value={form.descriptionEN} onChange={e => setForm({...form, descriptionEN: e.target.value})} rows={2}
                className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none" />
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="bg-terminal-accent hover:bg-terminal-accent/80 text-white font-mono text-xs px-6 py-2 rounded transition">
                  {t('admin.save')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-terminal-border text-terminal-gray font-mono text-xs px-6 py-2 rounded hover:text-white transition">
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-x-auto mb-6">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-gray text-xs uppercase">
                <th className="text-left py-3 px-4">{t('table.sign')} (TR)</th>
                <th className="text-left py-3 px-4">{t('table.sign')} (EN)</th>
                <th className="text-left py-3 px-4">{t('table.source')}</th>
                <th className="text-left py-3 px-4">{t('table.status')}</th>
                <th className="text-left py-3 px-4">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {alametler.map(a => (
                <tr key={a._id} className="border-b border-terminal-border/50 hover:bg-terminal-accent/5 transition">
                  <td className="py-3 px-4 text-white">{a.titleTR}</td>
                  <td className="py-3 px-4 text-gray-400">{a.titleEN}</td>
                  <td className="py-3 px-4 text-terminal-gray">{a.source}</td>
                  <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleEdit(a)}
                      className="text-terminal-accent text-xs hover:underline">{t('admin.edit')}</button>
                    <button onClick={() => handleDelete(a._id)}
                      className="text-red-400 text-xs hover:underline">{t('admin.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TrendChart alametler={alametler} />
      </main>
    </div>
  );
}
