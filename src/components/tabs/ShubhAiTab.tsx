import React, { useState } from 'react';
import { Check, Loader2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { CelebrationType, ChatMessage, EventPlanState, ReplanProposal } from '../../types/planner';
import { formatCompactINR } from '../../data/presets';

interface ShubhAiTabProps {
  plan: EventPlanState;
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

const CELEBRATION_TYPES: CelebrationType[] = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Anniversary',
  'Corporate Offsite',
  'Baby Shower',
];

const QUICK_PROMPTS = [
  'How can we trim 15% from catering without hurting hospitality?',
  'Draft a warm WhatsApp save-the-date for outstation guests',
  'Suggest a 3-hour Sangeet evening run-sheet',
];

export const ShubhAiTab: React.FC<ShubhAiTabProps> = ({
  plan,
  onAppendChat,
  onApplyReplan,
}) => {
  // Chat State
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Replan State
  const [replanType, setReplanType] = useState<CelebrationType>(plan.eventType);
  const [replanDate, setReplanDate] = useState(plan.eventDate);
  const [replanCity, setReplanCity] = useState(plan.city);
  const [replanGuests, setReplanGuests] = useState(plan.guestCount);
  const [replanBudget, setReplanBudget] = useState(plan.totalBudget);
  const [changeNote, setChangeNote] = useState('');
  const [replanLoading, setReplanLoading] = useState(false);
  const [replanError, setReplanError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ReplanProposal | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAppendChat([userMsg]);
    setInput('');
    setChatError(null);
    setChatLoading(true);

    try {
      const eventContext = {
        eventName: plan.eventName,
        eventType: plan.eventType,
        eventDate: plan.eventDate,
        city: plan.city,
        guestCount: plan.guestCount,
        totalBudgetINR: plan.totalBudget,
        tasksPending: plan.tasks.filter((t) => !t.completed).map((t) => `${t.title} (due ${t.dueDate})`),
        vendors: plan.vendors.map((v) => `${v.name} (${v.category}, ${v.stage}, ₹${v.estimatedCost})`),
        rsvpConfirmedHeadcount: plan.guests
          .filter((g) => g.status === 'Confirmed')
          .reduce((s, g) => s + g.partySize, 0),
      };

      const res = await fetch('/api/shubh/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          eventContext,
          history: plan.chatHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Shubh could not reply right now.');
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAppendChat([botMsg]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Unable to reach Shubh AI.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleReplanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replanLoading) return;
    setReplanLoading(true);
    setReplanError(null);
    setProposal(null);
    setAppliedNotice(false);

    try {
      const res = await fetch('/api/shubh/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: plan.eventName,
          eventType: replanType,
          eventDate: replanDate,
          city: replanCity,
          guestCount: replanGuests,
          totalBudget: replanBudget,
          changeDescription: changeNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not regenerate plan.');
      }
      setProposal(data as ReplanProposal);
    } catch (err) {
      setReplanError(err instanceof Error ? err.message : 'Replan failed. Please try again.');
    } finally {
      setReplanLoading(false);
    }
  };

  const handleApplyProposal = () => {
    if (!proposal) return;
    onApplyReplan(proposal, {
      eventType: replanType,
      eventDate: replanDate,
      city: replanCity,
      guestCount: replanGuests,
      totalBudget: replanBudget,
    });
    setProposal(null);
    setAppliedNotice(true);
    setChangeNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
          Shubh AI Co-Pilot
        </h2>
        <p className="mt-1 text-sm text-[#6B5B61]">
          Ask Shubh for ceremony advice grounded in your live budget, or trigger a full-plan recalibration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Chat with Shubh */}
        <section className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[rgba(122,31,61,0.1)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A1F3D] text-[#E8A317]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#2B2024]">Chat with Shubh</h3>
                <p className="text-xs text-[#6B5B61]">
                  Aware of {plan.eventName} · {plan.city} · {formatCompactINR(plan.totalBudget)}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {plan.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#7A1F3D] text-white'
                      : 'border border-[rgba(122,31,61,0.12)] bg-[#FFFBF5] text-[#2B2024]'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="font-mono-num mt-1 text-[11px] text-[#6B5B61]">
                  {msg.role === 'user' ? 'You' : 'Shubh'} · {msg.timestamp}
                </span>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#7A1F3D]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Shubh is thinking through your event plan...
              </div>
            )}

            {chatError && (
              <div className="rounded-xl border border-[#DC2626]/25 bg-[#FEF2F2] px-4 py-3 text-xs text-[#DC2626]">
                {chatError}
              </div>
            )}
          </div>

          {/* Quick Prompt Starters & Input */}
          <div className="border-t border-[rgba(122,31,61,0.1)] bg-[#FFFBF5] p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-[rgba(122,31,61,0.18)] bg-white px-3 py-1 text-xs font-medium text-[#7A1F3D] hover:bg-[#FDF3F5]"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Shubh about decor ideas, vendor questions, or timeline tweaks..."
                className="flex-1 rounded-full border border-[rgba(122,31,61,0.2)] bg-white px-4 py-2.5 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                aria-label="Send message to Shubh"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8A317] text-[#2B2024] transition-colors hover:bg-[#CE8D0E] disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>

        {/* Right: What Changed? Replan Engine */}
        <section className="flex flex-col justify-between rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-6 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF3F5] text-[#7A1F3D]">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#2B2024]">
                  What Changed? Replan
                </h3>
                <p className="text-xs text-[#6B5B61]">
                  Regenerate timeline, budget splits &amp; vendor picks
                </p>
              </div>
            </div>

            <form onSubmit={handleReplanSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Celebration</span>
                  <select
                    value={replanType}
                    onChange={(e) => setReplanType(e.target.value as CelebrationType)}
                    className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-2.5 py-2 text-xs"
                  >
                    {CELEBRATION_TYPES.map((t) => (
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
                    value={replanCity}
                    onChange={(e) => setReplanCity(e.target.value)}
                    className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-2.5 py-2 text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Target Date</span>
                  <input
                    type="date"
                    value={replanDate}
                    onChange={(e) => setReplanDate(e.target.value)}
                    className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-2.5 py-2 text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Guests</span>
                  <input
                    type="number"
                    min={10}
                    value={replanGuests}
                    onChange={(e) => setReplanGuests(Number(e.target.value))}
                    className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-2.5 py-2 text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">New Total Budget (₹)</span>
                <input
                  type="number"
                  min={50000}
                  step={50000}
                  value={replanBudget}
                  onChange={(e) => setReplanBudget(Number(e.target.value))}
                  className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">
                  Describe what changed
                </span>
                <textarea
                  rows={3}
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="e.g., Guest list grew by 60 outstation relatives and we need an indoor rain backup hall."
                  className="w-full rounded-xl border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] p-3 text-xs text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={replanLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7A1F3D] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#5E152D] disabled:opacity-60"
              >
                {replanLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Recalibrating Plan with Shubh...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Generate Recalibrated Plan
                  </>
                )}
              </button>
            </form>

            {replanError && (
              <div className="mt-4 rounded-xl border border-[#DC2626]/25 bg-[#FEF2F2] p-3 text-xs text-[#DC2626]">
                {replanError}
              </div>
            )}

            {appliedNotice && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#16A34A]/30 bg-[#F0FDF4] p-3 text-xs font-medium text-[#16A34A]">
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                Workspace updated with Shubh’s recalibrated tasks, budget split, and vendor picks.
              </div>
            )}

            {/* Proposal Preview */}
            {proposal && (
              <div className="mt-4 space-y-3 rounded-xl border border-[#E8A317] bg-[#FFFBF5] p-4">
                <p className="text-xs font-semibold text-[#7A1F3D]">Proposed Calibration Ready</p>
                <p className="text-xs leading-relaxed text-[#2B2024]">{proposal.summary}</p>
                <p className="font-mono-num text-[11px] text-[#6B5B61]">
                  {proposal.tasks.length} milestones · {proposal.budgetCategories.length} budget caps ·{' '}
                  {proposal.vendorSuggestions.length} vendor matches
                </p>
                <button
                  type="button"
                  onClick={handleApplyProposal}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#E8A317] px-4 py-2.5 text-xs font-semibold text-[#2B2024] hover:bg-[#CE8D0E]"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Apply New Plan to Workspace
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
