import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BudgetCategory, ExpenseItem } from '../../types/planner';
import { formatCompactINR, formatINR } from '../../data/presets';

interface BudgetTabProps {
  totalBudget: number;
  categories: BudgetCategory[];
  expenses: ExpenseItem[];
  onUpdateCategoryAlloc: (catId: string, amount: number) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onMarkPaid: (expenseId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  totalBudget,
  categories,
  expenses,
  onUpdateCategoryAlloc,
  onAddExpense,
  onMarkPaid,
  onDeleteExpense,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Venue & Hospitality');
  const [totalAmount, setTotalAmount] = useState(100000);
  const [paidAmount, setPaidAmount] = useState(25000);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  });

  const committedTotal = expenses.reduce((s, e) => s + e.totalAmount, 0);
  const paidTotal = expenses.reduce((s, e) => s + e.paidAmount, 0);
  const dueTotal = Math.max(0, committedTotal - paidTotal);
  const unpaidSchedule = [...expenses]
    .filter((e) => e.totalAmount > e.paidAmount)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const total = Math.max(0, Number(totalAmount) || 0);
    const paid = Math.min(total, Math.max(0, Number(paidAmount) || 0));
    const status: ExpenseItem['status'] =
      paid >= total && total > 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due';

    onAddExpense({
      title: title.trim(),
      category,
      totalAmount: total,
      paidAmount: paid,
      dueDate,
      status,
    });
    setTitle('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
            Budget Guardian
          </h2>
          <p className="mt-1 text-sm text-[#6B5B61]">
            Monitor category caps, logged vendor quotes, and upcoming advance due dates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#7A1F3D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5E152D]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log Expense
        </button>
      </div>

      {/* Top Financial Summary */}
      <div className="grid grid-cols-2 divide-y divide-[rgba(122,31,61,0.1)] rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Target Budget</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#2B2024]">
            {formatCompactINR(totalBudget)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Committed Quotes</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#7A1F3D]">
            {formatCompactINR(committedTotal)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Paid to Date</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#16A34A]">
            {formatCompactINR(paidTotal)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Balance Due</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#D97706]">
            {formatCompactINR(dueTotal)}
          </p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Expense / Vendor Item</span>
              <input
                type="text"
                required
                placeholder="e.g., Florist Advance — Genda Phool Studio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Total Quote (₹)</span>
              <input
                type="number"
                min={0}
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Paid Now (₹)</span>
              <input
                type="number"
                min={0}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#6B5B61]">
              Due Date:
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="font-mono-num rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-1.5 text-sm text-[#2B2024]"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-full border border-[rgba(122,31,61,0.2)] px-4 py-2 text-xs font-semibold text-[#6B5B61]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#E8A317] px-5 py-2 text-xs font-semibold text-[#2B2024]"
              >
                Save Expense
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Budget Split + Payments Due */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-6 lg:col-span-7">
          <h3 className="font-display text-xl font-bold text-[#2B2024]">Category Budget Split</h3>
          <p className="mb-5 text-xs text-[#6B5B61]">Adjust category caps directly to match your priorities</p>

          <div className="space-y-4">
            {categories.map((cat) => {
              const committed = expenses
                .filter((ex) => ex.category === cat.name)
                .reduce((s, ex) => s + ex.totalAmount, 0);
              const pct =
                cat.allocated > 0 ? Math.min(100, Math.round((committed / cat.allocated) * 100)) : 0;
              const over = committed > cat.allocated;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#2B2024]">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono-num ${over ? 'font-semibold text-[#DC2626]' : 'text-[#6B5B61]'}`}>
                        {formatINR(committed)} committed of
                      </span>
                      <input
                        type="number"
                        step={25000}
                        min={0}
                        aria-label={`Budget allocation for ${cat.name}`}
                        value={cat.allocated}
                        onChange={(e) => onUpdateCategoryAlloc(cat.id, Math.max(0, Number(e.target.value)))}
                        className="font-mono-num w-28 rounded-lg border border-[rgba(122,31,61,0.18)] bg-[#FFFBF5] px-2 py-1 text-right text-xs font-semibold text-[#2B2024]"
                      />
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#FDF3F5]">
                    <div
                      className={`h-full rounded-full ${over ? 'bg-[#DC2626]' : 'bg-[#7A1F3D]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payments Due Schedule */}
        <section className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-6 lg:col-span-5">
          <h3 className="font-display text-xl font-bold text-[#2B2024]">Payments Due</h3>
          <p className="mb-4 text-xs text-[#6B5B61]">Upcoming balances synced to your Reminders bell</p>

          {unpaidSchedule.length === 0 ? (
            <div className="rounded-xl bg-[#FDF3F5] p-6 text-center text-sm text-[#7A1F3D]">
              All logged vendor expenses are paid in full.
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(122,31,61,0.08)]">
              {unpaidSchedule.map((item) => {
                const balance = item.totalAmount - item.paidAmount;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2B2024]">{item.title}</p>
                      <p className="font-mono-num mt-0.5 text-xs text-[#6B5B61]">
                        Due {item.dueDate} · Bal {formatINR(balance)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkPaid(item.id)}
                      className="shrink-0 whitespace-nowrap rounded-full bg-[#E8A317] px-3.5 py-1.5 text-xs font-semibold text-[#2B2024] hover:bg-[#CE8D0E]"
                    >
                      Mark Paid
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Full Expenses Ledger */}
      <div className="overflow-x-auto rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(122,31,61,0.1)] text-xs font-semibold text-[#6B5B61]">
              <th className="px-5 py-3.5">Expense Item</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5 text-right">Total</th>
              <th className="px-4 py-3.5 text-right">Paid</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(122,31,61,0.07)]">
            {expenses.map((ex) => (
              <tr key={ex.id} className="hover:bg-[#FFFBF5]">
                <td className="px-5 py-3.5 font-semibold text-[#2B2024]">{ex.title}</td>
                <td className="px-4 py-3.5 text-xs text-[#6B5B61]">{ex.category}</td>
                <td className="font-mono-num px-4 py-3.5 text-xs text-[#6B5B61]">{ex.dueDate}</td>
                <td className="font-mono-num px-4 py-3.5 text-right font-semibold text-[#2B2024]">
                  {formatINR(ex.totalAmount)}
                </td>
                <td className="font-mono-num px-4 py-3.5 text-right text-[#6B5B61]">
                  {formatINR(ex.paidAmount)}
                </td>
                <td className="px-4 py-3.5 text-xs font-semibold">
                  <span
                    className={
                      ex.status === 'Paid'
                        ? 'text-[#16A34A]'
                        : ex.status === 'Partial'
                          ? 'text-[#D97706]'
                          : 'text-[#DC2626]'
                    }
                  >
                    {ex.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(ex.id)}
                    aria-label={`Delete ${ex.title}`}
                    className="rounded-lg p-1.5 text-[#6B5B61] hover:bg-[#FDF3F5] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
