import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { taskService } from '../../services/task.service.js';
import { EventItem, TaskItem, TaskMetrics, TaskPriority, TaskStatus } from '../../types/index.js';
import { Card } from '../Card.js';
import { Button } from '../Button.js';
import { Input } from '../Input.js';
import { Select } from '../Select.js';
import { Modal } from '../Modal.js';
import { ProgressBar } from '../ProgressBar.js';
import { EmptyState } from '../EmptyState.js';
import { LoadingSkeleton } from '../LoadingSkeleton.js';
import { Alert } from '../Alert.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/error.js';

interface TimelineTabProps {
  event: EventItem;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ event }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    dueDate: '',
    priority: 'medium' as TaskPriority,
    status: 'pending' as TaskStatus
  });

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await taskService.list(event._id, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      if (res.success) {
        setTasks(res.tasks);
        setMetrics(res.taskMetrics);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load checklist tasks'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [event._id, statusFilter, priorityFilter]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      dueDate: new Date(event.date).toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category || 'General',
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (task: TaskItem) => {
    try {
      await taskService.toggle(event._id, task._id);
      loadTasks();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update task status'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!formData.dueDate) {
      setError('Please specify a due date');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTask) {
        await taskService.update(event._id, editingTask._id, formData);
        setSuccessMsg('Task updated successfully');
      } else {
        await taskService.create(event._id, formData);
        setSuccessMsg('Task added to checklist');
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save task'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task from checklist?')) return;
    try {
      await taskService.delete(event._id, id);
      setSuccessMsg('Task deleted');
      loadTasks();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete task'));
    }
  };

  if (isLoading && !tasks.length) {
    return <LoadingSkeleton count={3} height="h-24" />;
  }

  const taskStats = metrics || {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0
  };

  const nowMs = new Date().getTime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Timeline & Task Checklist</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of deadlines, key milestones, and preparation tasks
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

      {/* Progress Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              Overall Task Completion
            </h3>
            <ProgressBar
              value={taskStats.completionPercentage}
              label={`${taskStats.completed} of ${taskStats.total} completed`}
              variant={taskStats.completionPercentage >= 75 ? 'emerald' : 'rose'}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 md:col-span-2 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-lg font-black text-slate-800">{taskStats.pending}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-lg font-black text-blue-900">{taskStats.inProgress}</span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                taskStats.overdue > 0
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block">Overdue</span>
              <span className="text-lg font-black">{taskStats.overdue}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filters:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {tasks.length} tasks
        </span>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No tasks match the selected criteria"
          description="Create your first task or generate a preparation checklist using the AI Planner."
          actionLabel="Add Task"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && new Date(task.dueDate).getTime() < nowMs;

            return (
              <div
                key={task._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                    : isOverdue
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    aria-label={`Mark task "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-rose-500 bg-white'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-bold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {task.category}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      <span
                        className={`flex items-center gap-1 text-[11px] font-medium ${
                          isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        Due {formatDate(task.dueDate)}
                        {isOverdue && ' (Overdue!)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(task)}
                    aria-label={`Edit ${task.title}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task._id)}
                    aria-label={`Delete ${task.title}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Checklist Task' : 'Add New Checklist Task'}
        description="Schedule preparation steps with due dates and priority"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Schedule cake tasting appointment"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Category"
            placeholder="e.g. Catering, Venue, Photography, Invitations"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            />
          </div>

          <Select
            label="Status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          />

          <Input
            label="Notes / Instructions"
            placeholder="Any specific instructions or phone numbers for this task"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingTask ? 'Update Task' : 'Save Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
