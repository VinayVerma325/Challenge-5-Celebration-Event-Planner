import React from 'react';
import { Modal } from '../Modal.js';

interface MenuBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuBuilderModal: React.FC<MenuBuilderModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catering Course & Pairing Builder"
      description="Sample celebration menus across 3 elegant courses"
      maxWidth="md"
    >
      <div className="space-y-3 pt-2 text-xs">
        <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
          <p className="font-bold text-orange-950">Course 1: Canapés & Starters</p>
          <p className="text-[11px] text-orange-800 mt-1">
            Truffled wild mushroom bruschetta, smoked salmon blinis, artisanal cheese croquettes.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
          <p className="font-bold text-orange-950">Course 2: Plated Entrées</p>
          <p className="text-[11px] text-orange-800 mt-1">
            Herb-crusted sea bass with saffron risotto, or roasted butternut squash ravioli with brown butter sage.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
          <p className="font-bold text-orange-950">Course 3: Sweet Celebrations</p>
          <p className="text-[11px] text-orange-800 mt-1">
            Dark chocolate ganache tartlets, miniature lemon macarons, and celebratory champagne toast.
          </p>
        </div>
      </div>
    </Modal>
  );
};
