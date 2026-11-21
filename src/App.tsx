/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  CelebrationType,
  ChatMessage,
  EventPlanState,
  ExpenseItem,
  GuestItem,
  ReplanProposal,
  RsvpStatus,
  TaskPhase,
  TimelineTask,
  VendorCategory,
  VendorItem,
  VendorStage,
  WorkspaceTab,
} from './types/planner';
import {
  CELEBRATION_PRESETS,
  CATERING_IMAGE_URL,
  HERO_IMAGE_URL,
  VENUE_IMAGE_URL,
  createInitialPlan,
} from './data/presets';
import { LandingPage } from './components/LandingPage';
import { WorkspaceShell } from './components/WorkspaceShell';

const STORAGE_KEY = 'utsav_ai_workspace_v1';

function loadSavedPlan(): EventPlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EventPlanState;
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.vendors)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return createInitialPlan('Wedding');
}

function normalizePhase(input: string): TaskPhase {
  if (input.includes('6')) return '6+ Months Out';
  if (input.includes('1 Month')) return '1 Month Out';
  if (input.includes('Week')) return 'Event Week';
  return '3-5 Months Out';
}

function normalizeVendorCategory(input: string): VendorCategory {
  const lower = input.toLowerCase();
  if (lower.includes('venue')) return 'Venue';
  if (lower.includes('cater') || lower.includes('food')) return 'Catering';
  if (lower.includes('decor') || lower.includes('floral')) return 'Decor';
  if (lower.includes('photo') || lower.includes('video')) return 'Photography';
  return 'Entertainment';
}

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [selectedEventType, setSelectedEventType] = useState<CelebrationType>('Wedding');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [plan, setPlan] = useState<EventPlanState>(loadSavedPlan);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Ignore storage quota errors
    }
  }, [plan]);

  const handleStartPlanning = (customSetup?: {
    eventType: CelebrationType;
    city: string;
    guestCount: number;
    totalBudget: number;
    eventDate: string;
  }) => {
    if (customSetup) {
      const fresh = createInitialPlan(customSetup.eventType);
      const scale = customSetup.totalBudget / fresh.totalBudget;
      setPlan({
        ...fresh,
        city: customSetup.city,
        guestCount: customSetup.guestCount,
        totalBudget: customSetup.totalBudget,
        eventDate: customSetup.eventDate,
        budgetCategories: fresh.budgetCategories.map((c) => ({
          ...c,
          allocated: Math.round(c.allocated * scale),
        })),
      });
    } else if (plan.eventType !== selectedEventType) {
      setPlan(createInitialPlan(selectedEventType));
    }
    setView('app');
    window.scrollTo({ top: 0 });
  };

  const handleResetDemo = () => {
    const fresh = createInitialPlan(plan.eventType);
    setPlan(fresh);
  };

  const handleUpdateEventMeta = (
    updates: Partial<
      Pick<
        EventPlanState,
        'eventName' | 'eventType' | 'eventDate' | 'city' | 'guestCount' | 'totalBudget'
      >
    >
  ) => {
    setPlan((prev) => ({ ...prev, ...updates }));
  };

  const handleToggleTask = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleAddTask = (task: Omit<TimelineTask, 'id' | 'completed'>) => {
    setPlan((prev) => ({
      ...prev,
      tasks: [
        {
          ...task,
          id: `t-${Date.now()}`,
          completed: false,
        },
        ...prev.tasks,
      ],
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleRescheduleOverdue = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekIso = nextWeek.toISOString().slice(0, 10);

    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        !t.completed && t.dueDate < todayIso ? { ...t, dueDate: nextWeekIso } : t
      ),
    }));
  };

  const handleUpdateVendorStage = (vendorId: string, stage: VendorStage) => {
    setPlan((prev) => {
      const targetVendor = prev.vendors.find((v) => v.id === vendorId);
      const updatedVendors = prev.vendors.map((v) =>
        v.id === vendorId ? { ...v, stage } : v
      );

      // When moving a vendor to Booked, ensure a matching expense entry exists if none yet
      let updatedExpenses = prev.expenses;
      if (
        stage === 'Booked' &&
        targetVendor &&
        !prev.expenses.some((ex) => ex.title.toLowerCase().includes(targetVendor.name.toLowerCase()))
      ) {
        const matchedCat =
          prev.budgetCategories.find((c) =>
            c.name.toLowerCase().includes(targetVendor.category.toLowerCase())
          )?.name || prev.budgetCategories[0]?.name || 'Venue & Hospitality';

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        updatedExpenses = [
          ...prev.expenses,
          {
            id: `ex-${Date.now()}`,
            title: `${targetVendor.name} — Booking Agreement`,
            category: matchedCat,
            totalAmount: targetVendor.estimatedCost,
            paidAmount: Math.round(targetVendor.estimatedCost * 0.25),
            dueDate: dueDate.toISOString().slice(0, 10),
            status: 'Partial',
          },
        ];
      }

      return { ...prev, vendors: updatedVendors, expenses: updatedExpenses };
    });
  };

  const handleAddVendor = (vendor: Omit<VendorItem, 'id'>) => {
    setPlan((prev) => ({
      ...prev,
      vendors: [{ ...vendor, id: `v-${Date.now()}` }, ...prev.vendors],
    }));
  };

  const handleDeleteVendor = (vendorId: string) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== vendorId),
    }));
  };

  const handleAddGuest = (guest: Omit<GuestItem, 'id' | 'inviteSent'>) => {
    setPlan((prev) => ({
      ...prev,
      guests: [{ ...guest, id: `g-${Date.now()}`, inviteSent: false }, ...prev.guests],
    }));
  };

  const handleUpdateGuestStatus = (guestId: string, status: RsvpStatus) => {
    setPlan((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === guestId ? { ...g, status } : g)),
    }));
  };

  const handleDeleteGuest = (guestId: string) => {
    setPlan((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.id !== guestId),
    }));
  };

  const handleMarkInvitesSent = (ids: string[]) => {
    const idSet = new Set(ids);
    setPlan((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (idSet.has(g.id) ? { ...g, inviteSent: true } : g)),
    }));
  };

  const handleUpdateCategoryAlloc = (catId: string, amount: number) => {
    setPlan((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map((c) =>
        c.id === catId ? { ...c, allocated: amount } : c
      ),
    }));
  };

  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    setPlan((prev) => ({
      ...prev,
      expenses: [{ ...expense, id: `ex-${Date.now()}` }, ...prev.expenses],
    }));
  };

  const handleMarkExpensePaid = (expenseId: string) => {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.map((ex) =>
        ex.id === expenseId
          ? { ...ex, paidAmount: ex.totalAmount, status: 'Paid' }
          : ex
      ),
    }));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((ex) => ex.id !== expenseId),
    }));
  };

  const handleAppendChat = (messages: ChatMessage[]) => {
    setPlan((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, ...messages],
    }));
  };

  const handleApplyReplan = (
    proposal: ReplanProposal,
    meta: {
      eventType: CelebrationType;
      eventDate: string;
      city: string;
      guestCount: number;
      totalBudget: number;
    }
  ) => {
    const imagePool: Record<VendorCategory, string | undefined> = {
      Venue: VENUE_IMAGE_URL,
      Catering: CATERING_IMAGE_URL,
      Decor: HERO_IMAGE_URL,
      Photography: undefined,
      Entertainment: undefined,
    };

    setPlan((prev) => ({
      ...prev,
      eventType: meta.eventType,
      eventName:
        prev.eventType === meta.eventType
          ? prev.eventName
          : CELEBRATION_PRESETS[meta.eventType].eventName,
      eventDate: meta.eventDate,
      city: meta.city,
      guestCount: meta.guestCount,
      totalBudget: meta.totalBudget,
      tasks: proposal.tasks.map((t, idx) => ({
        id: `rt-${Date.now()}-${idx}`,
        title: t.title,
        ceremony: t.ceremony,
        phase: normalizePhase(t.phase),
        dueDate: t.dueDate,
        owner: t.owner,
        priority: t.priority === 'High' || t.priority === 'Normal' ? t.priority : 'Medium',
        completed: false,
      })),
      budgetCategories: proposal.budgetCategories.map((c, idx) => ({
        id: `rbc-${Date.now()}-${idx}`,
        name: c.name,
        allocated: c.allocated,
      })),
      vendors: [
        ...prev.vendors.filter((v) => v.stage === 'Booked'),
        ...proposal.vendorSuggestions.map((v, idx) => {
          const cat = normalizeVendorCategory(v.category);
          return {
            id: `rv-${Date.now()}-${idx}`,
            name: v.name,
            category: cat,
            city: v.city || meta.city,
            estimatedCost: v.estimatedCost,
            stage: 'Suggested' as VendorStage,
            notes: v.notes,
            imageUrl: imagePool[cat],
          };
        }),
      ],
      chatHistory: [
        ...prev.chatHistory,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: `Plan recalibrated: ${proposal.summary}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  };

  if (view === 'landing') {
    return (
      <LandingPage
        selectedEventType={selectedEventType}
        onSelectEventType={setSelectedEventType}
        onStartPlanning={handleStartPlanning}
      />
    );
  }

  return (
    <WorkspaceShell
      plan={plan}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onBackToLanding={() => setView('landing')}
      onResetDemo={handleResetDemo}
      onUpdateEventMeta={handleUpdateEventMeta}
      onToggleTask={handleToggleTask}
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      onRescheduleOverdue={handleRescheduleOverdue}
      onUpdateVendorStage={handleUpdateVendorStage}
      onAddVendor={handleAddVendor}
      onDeleteVendor={handleDeleteVendor}
      onAddGuest={handleAddGuest}
      onUpdateGuestStatus={handleUpdateGuestStatus}
      onDeleteGuest={handleDeleteGuest}
      onMarkInvitesSent={handleMarkInvitesSent}
      onUpdateCategoryAlloc={handleUpdateCategoryAlloc}
      onAddExpense={handleAddExpense}
      onMarkExpensePaid={handleMarkExpensePaid}
      onDeleteExpense={handleDeleteExpense}
      onAppendChat={handleAppendChat}
      onApplyReplan={handleApplyReplan}
    />
  );
}
