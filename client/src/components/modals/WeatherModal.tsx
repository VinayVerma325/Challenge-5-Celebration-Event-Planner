import React, { useState } from 'react';
import { RefreshCw, MapPin, Sun } from 'lucide-react';
import { Modal } from '../Modal.js';
import { Button } from '../Button.js';
import { Input } from '../Input.js';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: {
    temp: string;
    condition: string;
    city: string;
    country: string;
    isLoading: boolean;
    error: boolean;
  };
  onRefresh: () => void;
  onSetCity: (city: string) => void;
  onUseGps: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  weather,
  onRefresh,
  onSetCity,
  onUseGps
}) => {
  const [customCityInput, setCustomCityInput] = useState('');

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    onSetCity(customCityInput.trim());
    setCustomCityInput('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Location & Live Weather"
      description="Select your celebration venue city or use GPS detection"
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">{weather.city}</p>
              <p className="text-xs text-slate-500">{weather.temp} • {weather.condition}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCitySubmit} className="space-y-3">
          <Input
            label="Enter Exact City / Hometown"
            placeholder="e.g. Delhi, Noida, Meerut, Dehradun, Lucknow, Mumbai..."
            value={customCityInput}
            onChange={(e) => setCustomCityInput(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              <MapPin className="w-4 h-4" />
              Set My City
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseGps}
              title="Detect exact coordinates via browser GPS"
            >
              📍 GPS Detect
            </Button>
          </div>
        </form>

        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quick Select Popular Cities:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Delhi', 'Noida', 'Meerut', 'Lucknow', 'Dehradun', 'Mumbai', 'Jaipur', 'Bangalore'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSetCity(c)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
