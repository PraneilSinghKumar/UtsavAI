import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { TaskPhase, TimelineTask } from '../../types/planner';

interface TimelineTabProps {
  tasks: TimelineTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TimelineTask, 'id' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
  onRescheduleOverdue: () => void;
}

const PHASES: TaskPhase[] = ['6+ Months Out', '3-5 Months Out', '1 Month Out', 'Event Week'];

export const TimelineTab: React.FC<TimelineTabProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onRescheduleOverdue,
}) => {
  const [phaseFilter, setPhaseFilter] = useState<'All' | TaskPhase>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [ceremony, setCeremony] = useState('All Functions');
  const [phase, setPhase] = useState<TaskPhase>('3-5 Months Out');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [owner, setOwner] = useState('Host Lead');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Normal'>('Medium');

  const todayIso = new Date().toISOString().slice(0, 10);
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < todayIso);

  const filteredTasks = tasks.filter((t) => {
    if (phaseFilter !== 'All' && t.phase !== phaseFilter) return false;
    if (statusFilter === 'Pending' && t.completed) return false;
    if (statusFilter === 'Completed' && !t.completed) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      ceremony: ceremony.trim() || 'All Functions',
      phase,
      dueDate,
      owner: owner.trim() || 'Host Lead',
      priority,
    });
    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
            Timeline &amp; Checklist
          </h2>
          <p className="mt-1 text-sm text-[#6B5B61]">
            Every ceremony milestone mapped from today through event week.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#7A1F3D] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#5E152D]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Milestone
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Task Title</span>
              <input
                type="text"
                required
                placeholder="e.g., Book mehendi artist & brass seating cushions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Ceremony</span>
              <input
                type="text"
                value={ceremony}
                onChange={(e) => setCeremony(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Phase</span>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as TaskPhase)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Owner / Priority</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Normal')}
                  className="rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-2.5 py-2 text-sm text-[#2B2024]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-full border border-[rgba(122,31,61,0.2)] px-4 py-2 text-xs font-semibold text-[#6B5B61]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#E8A317] px-5 py-2 text-xs font-semibold text-[#2B2024]"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Overdue Alert Banner (when overdue items exist) */}
      {overdueTasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DC2626]/25 bg-[#FEF2F2] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#2B2024]">
                <span className="font-mono-num">{overdueTasks.length}</span> overdue{' '}
                {overdueTasks.length === 1 ? 'task needs' : 'tasks need'} attention
              </p>
              <p className="mt-0.5 text-xs text-[#6B5B61]">
                {overdueTasks.map((t) => t.title).join(' · ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRescheduleOverdue}
            className="shrink-0 whitespace-nowrap rounded-full bg-[#7A1F3D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5E152D]"
          >
            Shift Overdue +7 Days
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-1 border border-[rgba(122,31,61,0.12)]">
          {(['All', ...PHASES] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhaseFilter(p)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                phaseFilter === p
                  ? 'bg-[#7A1F3D] text-white'
                  : 'text-[#6B5B61] hover:text-[#7A1F3D]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 rounded-xl bg-white p-1 border border-[rgba(122,31,61,0.12)]">
          {(['All', 'Pending', 'Completed'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#E8A317] text-[#2B2024]'
                  : 'text-[#6B5B61] hover:text-[#7A1F3D]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Task Table / List */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-[#6B5B61]">No tasks match the selected filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(122,31,61,0.08)]">
            {filteredTasks.map((task) => {
              const isOverdue = !task.completed && task.dueDate < todayIso;
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#FFFBF5]"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={`Mark ${task.title} as ${task.completed ? 'pending' : 'completed'}`}
                      className="mt-0.5 shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                      ) : (
                        <Circle className="h-5 w-5 text-[#7A1F3D]/50 hover:text-[#7A1F3D]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          task.completed ? 'text-[#6B5B61] line-through' : 'text-[#2B2024]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B5B61]">
                        {task.phase} · {task.ceremony} · {task.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span
                      className={`font-mono-num text-xs font-medium ${
                        isOverdue ? 'text-[#DC2626]' : 'text-[#6B5B61]'
                      }`}
                    >
                      {task.dueDate}
                      {isOverdue ? ' · Overdue' : ''}
                    </span>
                    <span className="text-xs font-medium text-[#6B5B61]">{task.priority}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                      className="rounded-lg p-1.5 text-[#6B5B61] transition-colors hover:bg-[#FDF3F5] hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
