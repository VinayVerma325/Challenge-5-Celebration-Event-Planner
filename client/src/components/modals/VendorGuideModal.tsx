import React from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../Modal.js';

interface VendorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorGuideModal: React.FC<VendorGuideModalProps> = ({ isOpen, onClose }) => {
  const categories = [
    {
      cat: 'Venue & Banquet',
      share: '25-35%',
      questions: ['Does rental include tables & chairs?', 'What is the curfew for sound & music?']
    },
    {
      cat: 'Catering & Dining',
      share: '25-30%',
      questions: ['Is a tasting session included in the quote?', 'How do you handle dietary allergies?']
    },
    {
      cat: 'Photography & Cinema',
      share: '10-15%',
      questions: ['How many shooters are on site?', 'What is the delivery timeline for edited galleries?']
    },
    {
      cat: 'DJ & Sound Production',
      share: '6-10%',
      questions: ['Do you provide wireless microphones?', 'Can we supply a do-not-play list?']
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vendor Screening & Checklist Guide"
      description="Standard industry budget shares and key questions before signing"
      maxWidth="lg"
    >
      <div className="space-y-3 pt-2">
        {categories.map((c, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-extrabold text-slate-900">{c.cat}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Budget Share: {c.share}
              </span>
            </div>
            <ul className="space-y-1 text-slate-600">
              {c.questions.map((q, qIdx) => (
                <li key={qIdx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
};
