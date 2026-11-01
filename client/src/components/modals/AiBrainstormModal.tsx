import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '../Modal.js';
import { Select } from '../Select.js';
import { Button } from '../Button.js';

interface AiBrainstormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (theme: string, type: string) => void;
}

export const AiBrainstormModal: React.FC<AiBrainstormModalProps> = ({
  isOpen,
  onClose,
  onSelectIdea
}) => {
  const [eventType, setEventType] = useState('Wedding');
  const [style, setStyle] = useState('Classic & Elegant');
  const [ideas, setIdeas] = useState<string[]>([
    'Golden Hour Sunset Ceremony with ivory silk drapery & acoustic strings',
    'Art Deco Midnight Soirée with champagne towers, brass lanterns & jazz quartet',
    'Botanical Glasshouse Celebration with hanging eucalyptus & artisanal farm-to-table banquet'
  ]);

  const generateIdeas = () => {
    if (eventType === 'Birthday') {
      setIdeas([
        'Vintage Vinyl & Neon Lounge with retro cocktail bar & polaroid photo booth',
        'Stargazer Garden Party with fairy-lit canopies, acoustic guitar & gourmet food trucks',
        'Minimalist Chic Rooftop Gathering with signature spritz bar & curated ambient DJ set'
      ]);
    } else if (eventType === 'Anniversary') {
      setIdeas([
        'Silver Jubilee Candlelit Banquet with personalized memory timeline & quartet',
        'Tuscan Vineyard Feast with barrel-aged wine tasting & communal olive wood tables',
        'Enchanted Forest Lantern Dinner with live harpist & fine dining dessert tasting'
      ]);
    } else {
      setIdeas([
        'Golden Hour Sunset Ceremony with ivory silk drapery & acoustic strings',
        'Art Deco Midnight Soirée with champagne towers, brass lanterns & jazz quartet',
        'Botanical Glasshouse Celebration with hanging eucalyptus & artisanal farm-to-table banquet'
      ]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live AI Celebration Idea Generator"
      description="Brainstorm unique concepts, themes, and decor atmospheres"
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Celebration Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            options={[
              { value: 'Wedding', label: 'Wedding' },
              { value: 'Birthday', label: 'Birthday Party' },
              { value: 'Anniversary', label: 'Anniversary' },
              { value: 'Community', label: 'Community Gathering' }
            ]}
          />
          <Select
            label="Atmosphere Style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            options={[
              { value: 'Classic & Elegant', label: 'Classic & Elegant' },
              { value: 'Modern Minimalist', label: 'Modern Minimalist' },
              { value: 'Bohemian Rustic', label: 'Bohemian Rustic' },
              { value: 'Luxury Glamour', label: 'Luxury Glamour' }
            ]}
          />
        </div>

        <Button onClick={generateIdeas} className="w-full">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Generate Concepts with AI
        </Button>

        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tailored Creative Concepts:
          </p>
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start justify-between gap-3 text-xs text-purple-950"
            >
              <span>{idea}</span>
              <button
                type="button"
                onClick={() => onSelectIdea(idea, eventType)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Use Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
