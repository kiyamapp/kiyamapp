import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/admin/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', res.data.username);
      navigate('/admin/panel');
    } catch {
      setError(t('admin.error'));
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-terminal-card border border-terminal-border rounded-t-lg px-4 py-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="ml-3 text-terminal-gray text-xs font-mono">admin_auth</span>
        </div>
        <div className="bg-terminal-card border border-terminal-border border-t-0 rounded-b-lg p-8 terminal-glow">
          <h2 className="text-xl font-mono font-bold text-white mb-6 text-center">{t('admin.login')}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-terminal-gray text-xs font-mono mb-1 uppercase">{t('admin.username')}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-terminal-gray text-xs font-mono mb-1 uppercase">{t('admin.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono text-sm focus:border-terminal-accent focus:outline-none"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
            <button type="submit" className="w-full bg-terminal-accent hover:bg-terminal-accent/80 text-white font-mono font-bold py-2 rounded transition">
              {t('admin.loginBtn')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/home" className="text-terminal-gray text-xs font-mono hover:text-white transition">&larr; {t('nav.home')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
