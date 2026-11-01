import React, { useState } from 'react';
import { Modal } from '../Modal.js';
import { Input } from '../Input.js';

interface GuestEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestEstimatorModal: React.FC<GuestEstimatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [guests, setGuests] = useState(100);

  const tables8 = Math.ceil(guests / 8);
  const tables10 = Math.ceil(guests / 10);
  const vegetarianBuffer = Math.round(guests * 0.2);
  const drinkEstimate = guests * 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guest Seating & Catering Estimator"
      description="Calculate table counts, drink volumes, and dietary ratios"
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <Input
          label="Estimated Guest Count"
          type="number"
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
        />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-violet-50 border border-violet-100">
            <p className="text-violet-700 font-bold">Round Tables (8-Top)</p>
            <p className="text-xl font-extrabold text-violet-950 mt-1">{tables8} tables</p>
            <p className="text-[10px] text-violet-600 mt-0.5">Or {tables10} tables for 10-tops</p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="text-emerald-700 font-bold">Beverage Volume</p>
            <p className="text-xl font-extrabold text-emerald-950 mt-1">~{drinkEstimate} drinks</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Based on 3 drinks/guest</p>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 col-span-2">
            <p className="text-rose-700 font-bold">Dietary Buffer Recommendation</p>
            <p className="text-xs text-rose-950 mt-1">
              Plan for at least <strong>{vegetarianBuffer} vegetarian / vegan</strong> meals (20% standard ratio) to ensure all guests are welcomed comfortably.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
