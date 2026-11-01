import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from '../Modal.js';
import { Button } from '../Button.js';
import { formatCurrency } from '../../utils/formatters.js';

interface HostProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name?: string; email?: string } | null;
  stats: { totalEvents: number; totalBudget: number; completedTasks: number };
  onLogout: () => void;
}

export const HostProfileModal: React.FC<HostProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  onLogout
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Host Profile & Account Controls"
      description="Manage your celebration host profile and active planner session"
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'H'}
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900">{user?.name || 'Celebration Host'}</h4>
            <p className="text-xs text-slate-500">{user?.email || 'host@celebrationplanner.io'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Active Celebration Director
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400">Events</p>
            <p className="text-lg font-black text-slate-900">{stats.totalEvents}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400">Managed</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400">Tasks</p>
            <p className="text-lg font-black text-slate-900">{stats.completedTasks}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Close
          </button>
          <Button
            variant="danger"
            size="sm"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </Button>
        </div>
      </div>
    </Modal>
  );
};
