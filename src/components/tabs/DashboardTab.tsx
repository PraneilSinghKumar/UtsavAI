import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { CelebrationType, EventPlanState, WorkspaceTab } from '../../types/planner';
import { formatCompactINR, formatINR, getDaysRemaining } from '../../data/presets';

interface DashboardTabProps {
  plan: EventPlanState;
  onUpdateEventMeta: (updates: Partial<Pick<EventPlanState, 'eventName' | 'eventType' | 'eventDate' | 'city' | 'guestCount' | 'totalBudget'>>) => void;
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

const TYPES: CelebrationType[] = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Anniversary',
  'Corporate Offsite',
  'Baby Shower',
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  plan,
  onUpdateEventMeta,
  onToggleTask,
  onNavigateTab,
}) => {
  const [editingMeta, setEditingMeta] = useState(false);
  const [draftName, setDraftName] = useState(plan.eventName);
  const [draftType, setDraftType] = useState<CelebrationType>(plan.eventType);
  const [draftCity, setDraftCity] = useState(plan.city);
  const [draftDate, setDraftDate] = useState(plan.eventDate);
  const [draftGuests, setDraftGuests] = useState(plan.guestCount);
  const [draftBudget, setDraftBudget] = useState(plan.totalBudget);

  const daysLeft = getDaysRemaining(plan.eventDate);
  const completedTasks = plan.tasks.filter((t) => t.completed).length;
  const bookedVendors = plan.vendors.filter((v) => v.stage === 'Booked').length;
  const readiness = plan.tasks.length
    ? Math.round(
        ((completedTasks / plan.tasks.length) * 0.65 +
          (Math.min(bookedVendors, 4) / 4) * 0.35) *
          100
      )
    : 0;

  const confirmedHeadcount = plan.guests
    .filter((g) => g.status === 'Confirmed')
    .reduce((sum, g) => sum + g.partySize, 0);
  const pendingHeadcount = plan.guests
    .filter((g) => g.status === 'Pending')
    .reduce((sum, g) => sum + g.partySize, 0);

  const totalCommitted = plan.expenses.reduce((sum, ex) => sum + ex.totalAmount, 0);
  const totalPaid = plan.expenses.reduce((sum, ex) => sum + ex.paidAmount, 0);
  const remainingBudget = Math.max(0, plan.totalBudget - totalCommitted);

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcomingTasks = [...plan.tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEventMeta({
      eventName: draftName.trim() || plan.eventName,
      eventType: draftType,
      city: draftCity.trim() || plan.city,
      eventDate: draftDate || plan.eventDate,
      guestCount: Math.max(10, Number(draftGuests) || plan.guestCount),
      totalBudget: Math.max(50000, Number(draftBudget) || plan.totalBudget),
    });
    setEditingMeta(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
            Celebration Command Center
          </h2>
          <p className="mt-1 text-sm text-[#6B5B61]">
            {plan.eventType} · {plan.city} · Target {plan.eventDate}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDraftName(plan.eventName);
            setDraftType(plan.eventType);
            setDraftCity(plan.city);
            setDraftDate(plan.eventDate);
            setDraftGuests(plan.guestCount);
            setDraftBudget(plan.totalBudget);
            setEditingMeta((v) => !v);
          }}
          className="shrink-0 whitespace-nowrap rounded-full border border-[rgba(122,31,61,0.22)] bg-white px-4 py-2 text-xs font-semibold text-[#7A1F3D] transition-colors hover:bg-[#FDF3F5]"
        >
          {editingMeta ? 'Cancel Edit' : 'Edit Event Details'}
        </button>
      </div>

      {/* Inline Event Setup Drawer */}
      {editingMeta && (
        <form
          onSubmit={handleSaveMeta}
          className="rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Event Name</span>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Celebration Type</span>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value as CelebrationType)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">City</span>
              <input
                type="text"
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Target Date</span>
              <input
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Target Guests</span>
              <input
                type="number"
                min={10}
                value={draftGuests}
                onChange={(e) => setDraftGuests(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Total Budget (₹)</span>
              <input
                type="number"
                min={50000}
                step={25000}
                value={draftBudget}
                onChange={(e) => setDraftBudget(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024]"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              className="rounded-full bg-[#7A1F3D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5E152D]"
            >
              Save Event Details
            </button>
          </div>
        </form>
      )}

      {/* 4-Metric KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Countdown</p>
          <p className="font-mono-num mt-2 text-3xl font-bold text-[#7A1F3D]">{daysLeft} days</p>
          <p className="mt-1 text-xs text-[#6B5B61]">Target {plan.eventDate}</p>
        </div>

        <div className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Plan Readiness</p>
          <p className="font-mono-num mt-2 text-3xl font-bold text-[#2B2024]">{readiness}%</p>
          <p className="mt-1 text-xs text-[#6B5B61]">
            <span className="font-mono-num">{completedTasks}/{plan.tasks.length}</span> tasks ·{' '}
            <span className="font-mono-num">{bookedVendors}</span> vendors booked
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-5">
          <p className="text-xs font-medium text-[#6B5B61]">RSVP Snapshot</p>
          <p className="font-mono-num mt-2 text-3xl font-bold text-[#2B2024]">
            {confirmedHeadcount} <span className="text-base font-normal text-[#6B5B61]">/ {plan.guestCount}</span>
          </p>
          <p className="mt-1 text-xs text-[#6B5B61]">
            <span className="font-mono-num">{pendingHeadcount}</span> awaiting response
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Budget Committed</p>
          <p className="font-mono-num mt-2 text-3xl font-bold text-[#2B2024]">
            {formatCompactINR(totalCommitted)}
          </p>
          <p className="mt-1 text-xs text-[#6B5B61]">
            of {formatCompactINR(plan.totalBudget)} cap · {formatCompactINR(remainingBudget)} buffer
          </p>
        </div>
      </div>

      {/* Main Two-Column Modules */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Upcoming Tasks */}
        <section className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-6 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2B2024]">Upcoming Tasks</h3>
              <p className="text-xs text-[#6B5B61]">Check off items to update your live readiness score</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('timeline')}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#7A1F3D] hover:underline"
            >
              Full Timeline
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="rounded-xl bg-[#FDF3F5] p-6 text-center">
              <p className="text-sm font-medium text-[#7A1F3D]">All timeline tasks are completed!</p>
              <button
                type="button"
                onClick={() => onNavigateTab('timeline')}
                className="mt-3 rounded-full bg-[#7A1F3D] px-4 py-2 text-xs font-semibold text-white"
              >
                Add Another Milestone
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(122,31,61,0.08)]">
              {upcomingTasks.map((task) => {
                const isOverdue = task.dueDate < todayIso;
                return (
                  <li key={task.id} className="flex items-start justify-between gap-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="flex items-start gap-3 text-left"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#7A1F3D]/50 hover:text-[#7A1F3D]" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#2B2024]">{task.title}</p>
                        <p className="mt-0.5 text-xs text-[#6B5B61]">
                          {task.ceremony} · {task.owner} ·{' '}
                          <span className={isOverdue ? 'font-semibold text-[#DC2626]' : ''}>
                            Due <span className="font-mono-num">{task.dueDate}</span>
                            {isOverdue ? ' (Overdue)' : ''}
                          </span>
                        </p>
                      </div>
                    </button>
                    <span className="font-mono-num shrink-0 text-xs font-medium text-[#6B5B61]">
                      {task.priority}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Budget Snapshot */}
        <section className="flex flex-col justify-between rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-6 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">Budget Snapshot</h3>
                <p className="text-xs text-[#6B5B61]">
                  Paid to date: <span className="font-mono-num font-semibold text-[#2B2024]">{formatINR(totalPaid)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('budget')}
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#7A1F3D] hover:underline"
              >
                Open Ledger
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {plan.budgetCategories.slice(0, 5).map((cat) => {
                const spent = plan.expenses
                  .filter((ex) => ex.category === cat.name)
                  .reduce((s, ex) => s + ex.totalAmount, 0);
                const pct = cat.allocated > 0 ? Math.min(100, Math.round((spent / cat.allocated) * 100)) : 0;
                return (
                  <div key={cat.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#2B2024]">{cat.name}</span>
                      <span className="font-mono-num text-[#6B5B61]">
                        {formatCompactINR(spent)} / {formatCompactINR(cat.allocated)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#FDF3F5]">
                      <div
                        className={`h-full rounded-full ${
                          spent > cat.allocated ? 'bg-[#DC2626]' : 'bg-[#7A1F3D]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[rgba(232,163,23,0.35)] bg-[#FFFBF5] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7A1F3D] text-[#E8A317]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#7A1F3D]">Need to adjust dates or guest count?</p>
                <p className="mt-0.5 text-xs text-[#6B5B61]">
                  Shubh can recalibrate your timeline, category splits, and vendors in one pass.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('shubh-ai')}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1F3D] hover:underline"
                >
                  Open Shubh AI Co-Pilot
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
