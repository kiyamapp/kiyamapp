import { useTranslation } from 'react-i18next';

// variant: 'leaderboard' (728x90), 'banner' (468x60), 'sidebar' (300x250), 'inline' (full width thin)
export default function AdBanner({ variant = 'leaderboard' }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const sizes = {
    leaderboard: { w: '100%', h: '90px', label: '728 x 90' },
    banner: { w: '100%', h: '60px', label: '468 x 60' },
    sidebar: { w: '300px', h: '250px', label: '300 x 250' },
    inline: { w: '100%', h: '70px', label: 'Inline' },
  };

  const s = sizes[variant] || sizes.leaderboard;

  return (
    <div
      className="border border-dashed border-[#1e293b] rounded-lg flex flex-col items-center justify-center bg-[#0b1120]/50 hover:border-[#334155] transition-colors group"
      style={{ width: s.w, height: s.h }}
    >
      <p className="text-[#334155] group-hover:text-[#475569] font-mono text-[11px] transition-colors">
        {lang === 'tr' ? 'REKLAM ALANI' : 'AD SPACE'} — {s.label}
      </p>
      <a
        href="mailto:kiyamappbizness@gmail.com?subject=Reklam%20Talebi%20/%20Ad%20Inquiry"
        className="text-terminal-accent/60 hover:text-terminal-accent font-mono text-[10px] mt-1 transition-colors"
      >
        {lang === 'tr' ? 'Reklam vermek için: kiyamappbizness@gmail.com' : 'Advertise here: kiyamappbizness@gmail.com'}
      </a>
    </div>
  );
}
