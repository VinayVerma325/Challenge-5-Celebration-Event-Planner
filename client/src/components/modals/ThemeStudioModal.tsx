import React from 'react';
import { Modal } from '../Modal.js';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({
  isOpen,
  onClose
}) => {
  const palettes = [
    {
      title: 'Royal Champagne & Ivory',
      colors: ['#D4AF37', '#FFFDD0', '#E5E4E2', '#36454F'],
      desc: 'Sophisticated vintage grandeur with metallic accents and candlelight.'
    },
    {
      title: 'Emerald Garden & Tuscan Olive',
      colors: ['#046307', '#708238', '#F5F5DC', '#C2B280'],
      desc: 'Organic botanicals, eucalyptus garlands, and rustic Italian charm.'
    },
    {
      title: 'Midnight Velvet & Starlight Silver',
      colors: ['#0A192F', '#4A5568', '#CBD5E1', '#F8FAFC'],
      desc: 'Modern celestial glamour with dramatic moody lighting and silver flatware.'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Theme & Color Palette Studio"
      description="Curated color schemes and atmosphere moodboards"
      maxWidth="md"
    >
      <div className="space-y-3.5 pt-2">
        {palettes.map((p, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">{p.title}</span>
              <div className="flex items-center gap-1">
                {p.colors.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};
