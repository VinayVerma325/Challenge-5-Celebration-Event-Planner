import React from 'react';
import { Modal } from '../Modal.js';
import { formatDate } from '../../utils/formatters.js';

interface UrgentTask {
  id: string;
  title: string;
  dueDate: string | Date;
  category: string;
  eventId: string;
}

interface QuickTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  urgentTasks: UrgentTask[];
  onOpenEventChecklist: (eventId: string) => void;
}

export const QuickTasksModal: React.FC<QuickTasksModalProps> = ({
  isOpen,
  onClose,
  urgentTasks,
  onOpenEventChecklist
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Celebration To-Do Manager"
      description="Active tasks, deadlines, and milestone checkpoints"
      maxWidth="md"
    >
      <div className="space-y-3 pt-2">
        {urgentTasks.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No pending tasks due! You are completely up to date. 🎉
          </p>
        ) : (
          urgentTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{task.title}</p>
                <p className="text-[10px] text-slate-400">
                  Due: {formatDate(task.dueDate)} • {task.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenEventChecklist(task.eventId)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold shrink-0 transition-colors cursor-pointer"
              >
                Open Checklist
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
