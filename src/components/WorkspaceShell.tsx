import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  IndianRupee,
  LayoutDashboard,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  CelebrationType,
  ChatMessage,
  EventPlanState,
  ExpenseItem,
  GuestItem,
  ReplanProposal,
  RsvpStatus,
  TimelineTask,
  VendorItem,
  VendorStage,
  WorkspaceTab,
} from '../types/planner';
import { formatINR, getDaysRemaining } from '../data/presets';
import { DashboardTab } from './tabs/DashboardTab';
import { TimelineTab } from './tabs/TimelineTab';
import { VendorsTab } from './tabs/VendorsTab';
import { GuestsTab } from './tabs/GuestsTab';
import { BudgetTab } from './tabs/BudgetTab';
import { ShubhAiTab } from './tabs/ShubhAiTab';

interface WorkspaceShellProps {
  plan: EventPlanState;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onBackToLanding: () => void;
  onResetDemo: () => void;
  onUpdateEventMeta: (
    updates: Partial<
      Pick<
        EventPlanState,
        'eventName' | 'eventType' | 'eventDate' | 'city' | 'guestCount' | 'totalBudget'
      >
    >
  ) => void;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TimelineTask, 'id' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
  onRescheduleOverdue: () => void;
  onUpdateVendorStage: (id: string, stage: VendorStage) => void;
  onAddVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  onDeleteVendor: (id: string) => void;
  onAddGuest: (guest: Omit<GuestItem, 'id' | 'inviteSent'>) => void;
  onUpdateGuestStatus: (id: string, status: RsvpStatus) => void;
  onDeleteGuest: (id: string) => void;
  onMarkInvitesSent: (ids: string[]) => void;
  onUpdateCategoryAlloc: (catId: string, amount: number) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onMarkExpensePaid: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onAppendChat: (messages: ChatMessage[]) => void;
  onApplyReplan: (
    proposal: ReplanProposal,
    meta: {
      eventType: CelebrationType;
      eventDate: string;
      city: string;
      guestCount: number;
      totalBudget: number;
    }
  ) => void;
}

const NAV_TABS: Array<{ id: WorkspaceTab; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'vendors', label: 'Vendors', icon: Building2 },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'budget', label: 'Budget', icon: IndianRupee },
  { id: 'shubh-ai', label: 'Shubh AI', icon: Sparkles },
];

export const WorkspaceShell: React.FC<WorkspaceShellProps> = (props) => {
  const { plan, activeTab, onSelectTab, onBackToLanding, onResetDemo } = props;
  const [remindersOpen, setRemindersOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const daysLeft = getDaysRemaining(plan.eventDate);
  const todayIso = new Date().toISOString().slice(0, 10);

  const overdueTasks = plan.tasks.filter((t) => !t.completed && t.dueDate < todayIso);
  const upcomingPayments = plan.expenses
    .filter((e) => e.totalAmount > e.paidAmount)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const reminderCount = overdueTasks.length + upcomingPayments.length;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setRemindersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FFFBF5] text-[#2B2024]">
      {/* Desktop Sidebar & Mobile Bottom Tab Bar */}
      <aside
        aria-label="Workspace Navigation"
        className="fixed right-0 bottom-0 left-0 z-40 flex h-16 flex-row items-center justify-between border-t border-[rgba(122,31,61,0.12)] bg-white px-2 md:top-0 md:right-auto md:h-auto md:w-[252px] md:flex-col md:border-t-0 md:border-r md:px-4 md:py-5"
      >
        <div className="w-full">
          <button
            type="button"
            onClick={onBackToLanding}
            title="Return to Landing Page"
            className="mb-5 hidden w-full items-center gap-2.5 border-b border-[rgba(122,31,61,0.08)] px-2 pb-4 text-left md:flex"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A1F3D] text-[#E8A317]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold text-[#7A1F3D]">Utsav AI</span>
          </button>

          <nav className="flex w-full justify-around gap-1 md:flex-col md:gap-1.5" role="tablist">
            {NAV_TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectTab(id)}
                  className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors md:w-full md:flex-row md:justify-start md:gap-3 md:px-3.5 md:py-2.5 md:text-sm ${
                    isActive
                      ? 'bg-[#7A1F3D] text-white'
                      : 'text-[#6B5B61] hover:bg-[#FDF3F5] hover:text-[#7A1F3D]'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#E8A317]' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden w-full space-y-1 border-t border-[rgba(122,31,61,0.08)] pt-4 md:block">
          <button
            type="button"
            onClick={onResetDemo}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#6B5B61] transition-colors hover:bg-[#FFFBF5] hover:text-[#7A1F3D]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Preset Data
          </button>
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#6B5B61] transition-colors hover:bg-[#FFFBF5] hover:text-[#7A1F3D]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Landing
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:ml-[252px] md:pb-8">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-[rgba(122,31,61,0.12)] bg-[#FFFBF5]/92 px-5 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate font-display text-lg font-bold text-[#2B2024] sm:text-xl">
              {plan.eventName}
            </h1>
            <span className="font-mono-num hidden shrink-0 text-xs font-semibold text-[#7A1F3D] sm:inline">
              · D-{daysLeft} to go
            </span>
          </div>

          <div className="relative flex shrink-0 items-center gap-3" ref={popoverRef}>
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#6B5B61] hover:text-[#7A1F3D] md:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </button>

            <button
              type="button"
              onClick={() => setRemindersOpen((v) => !v)}
              aria-label={`Reminders (${reminderCount})`}
              aria-expanded={remindersOpen}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(122,31,61,0.16)] bg-white text-[#7A1F3D] transition-colors hover:bg-[#FDF3F5]"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {reminderCount > 0 && (
                <span className="font-mono-num absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8A317] px-1 text-[10px] font-bold text-[#2B2024]">
                  {reminderCount}
                </span>
              )}
            </button>

            {remindersOpen && (
              <div
                role="region"
                aria-label="Live Reminders"
                className="absolute top-12 right-0 z-50 w-80 rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-4 shadow-xl"
              >
                <p className="text-xs font-bold tracking-wider text-[#7A1F3D] uppercase">
                  Upcoming Reminders
                </p>

                {reminderCount === 0 ? (
                  <p className="mt-3 text-xs text-[#6B5B61]">
                    Everything is on schedule with zero overdue tasks or pending balances.
                  </p>
                ) : (
                  <div className="mt-3 divide-y divide-[rgba(122,31,61,0.08)]">
                    {overdueTasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setRemindersOpen(false);
                          onSelectTab('timeline');
                        }}
                        className="block w-full py-2.5 text-left hover:bg-[#FFFBF5]"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">
                          Overdue Task · {t.dueDate}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#2B2024]">{t.title}</p>
                      </button>
                    ))}
                    {upcomingPayments.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          setRemindersOpen(false);
                          onSelectTab('budget');
                        }}
                        className="block w-full py-2.5 text-left hover:bg-[#FFFBF5]"
                      >
                        <p className="text-xs font-semibold text-[#D97706]">
                          Payment Due · {ex.dueDate}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#2B2024]">
                          {ex.title} ({formatINR(ex.totalAmount - ex.paidAmount)})
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Active Tab Viewport */}
        <main className="mx-auto w-full max-w-[1200px] flex-1 p-5 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardTab
              plan={plan}
              onUpdateEventMeta={props.onUpdateEventMeta}
              onToggleTask={props.onToggleTask}
              onNavigateTab={onSelectTab}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab
              tasks={plan.tasks}
              onToggleTask={props.onToggleTask}
              onAddTask={props.onAddTask}
              onDeleteTask={props.onDeleteTask}
              onRescheduleOverdue={props.onRescheduleOverdue}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab
              vendors={plan.vendors}
              defaultCity={plan.city}
              onUpdateStage={props.onUpdateVendorStage}
              onAddVendor={props.onAddVendor}
              onDeleteVendor={props.onDeleteVendor}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab
              guests={plan.guests}
              eventName={plan.eventName}
              eventDate={plan.eventDate}
              city={plan.city}
              onAddGuest={props.onAddGuest}
              onUpdateStatus={props.onUpdateGuestStatus}
              onDeleteGuest={props.onDeleteGuest}
              onMarkInvitesSent={props.onMarkInvitesSent}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab
              totalBudget={plan.totalBudget}
              categories={plan.budgetCategories}
              expenses={plan.expenses}
              onUpdateCategoryAlloc={props.onUpdateCategoryAlloc}
              onAddExpense={props.onAddExpense}
              onMarkPaid={props.onMarkExpensePaid}
              onDeleteExpense={props.onDeleteExpense}
            />
          )}

          {activeTab === 'shubh-ai' && (
            <ShubhAiTab
              plan={plan}
              onAppendChat={props.onAppendChat}
              onApplyReplan={props.onApplyReplan}
            />
          )}
        </main>
      </div>
    </div>
  );
};
