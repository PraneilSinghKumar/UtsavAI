import React, { useState } from 'react';
import { Building2, Check, Plus, Trash2 } from 'lucide-react';
import { VendorCategory, VendorItem, VendorStage } from '../../types/planner';
import { formatINR } from '../../data/presets';

interface VendorsTabProps {
  vendors: VendorItem[];
  defaultCity: string;
  onUpdateStage: (vendorId: string, nextStage: VendorStage) => void;
  onAddVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  onDeleteVendor: (vendorId: string) => void;
}

const STAGES: ('All' | VendorStage)[] = ['All', 'Suggested', 'Shortlisted', 'Booked'];
const CATEGORIES: ('All' | VendorCategory)[] = [
  'All',
  'Venue',
  'Catering',
  'Decor',
  'Photography',
  'Entertainment',
];

export const VendorsTab: React.FC<VendorsTabProps> = ({
  vendors,
  defaultCity,
  onUpdateStage,
  onAddVendor,
  onDeleteVendor,
}) => {
  const [stageFilter, setStageFilter] = useState<'All' | VendorStage>('All');
  const [catFilter, setCatFilter] = useState<'All' | VendorCategory>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Decor');
  const [city, setCity] = useState(defaultCity);
  const [estimatedCost, setEstimatedCost] = useState(250000);
  const [stage, setStage] = useState<VendorStage>('Shortlisted');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');

  const filtered = vendors.filter((v) => {
    if (stageFilter !== 'All' && v.stage !== stageFilter) return false;
    if (catFilter !== 'All' && v.category !== catFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddVendor({
      name: name.trim(),
      category,
      city: city.trim() || defaultCity,
      estimatedCost: Math.max(0, Number(estimatedCost) || 0),
      stage,
      notes: notes.trim() || 'Added manually to vendor directory.',
      contact: contact.trim() || undefined,
    });
    setName('');
    setNotes('');
    setContact('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
            Vendors &amp; Matchmaker
          </h2>
          <p className="mt-1 text-sm text-[#6B5B61]">
            Compare quotes and promote vendors from Suggested to Shortlisted to Booked.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#7A1F3D] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#5E152D]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Vendor
        </button>
      </div>

      {/* Add Custom Vendor Form */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Vendor Name</span>
              <input
                type="text"
                required
                placeholder="e.g., Marigold Tent House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Quote (₹)</span>
              <input
                type="number"
                min={0}
                step={10000}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Initial Stage</span>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as VendorStage)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              >
                <option value="Suggested">Suggested</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Booked">Booked</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Contact</span>
              <input
                type="text"
                placeholder="+91 ..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Notes</span>
              <input
                type="text"
                placeholder="Package inclusions, deposit terms, or tasting notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
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
              Add to Directory
            </button>
          </div>
        </form>
      )}

      {/* Stage & Category Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-xl border border-[rgba(122,31,61,0.12)] bg-white p-1">
          {STAGES.map((s) => {
            const count = s === 'All' ? vendors.length : vendors.filter((v) => v.stage === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStageFilter(s)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  stageFilter === s
                    ? 'bg-[#7A1F3D] text-white'
                    : 'text-[#6B5B61] hover:text-[#7A1F3D]'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-[rgba(122,31,61,0.12)] bg-white p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCatFilter(c)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                catFilter === c
                  ? 'bg-[#E8A317] text-[#2B2024]'
                  : 'text-[#6B5B61] hover:text-[#7A1F3D]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-10 text-center">
          <p className="text-sm text-[#6B5B61]">No vendors match the current filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vendor) => (
            <article
              key={vendor.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white"
            >
              <div className="relative h-44 w-full bg-[#FDF3F5]">
                {vendor.imageUrl && !failedImages[vendor.id] ? (
                  <img
                    src={vendor.imageUrl}
                    alt={`${vendor.name} — ${vendor.category} showcase`}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages((prev) => ({ ...prev, [vendor.id]: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FDF3F5] to-[#FFFBF5] text-[#7A1F3D]/70">
                    <Building2 className="h-8 w-8" aria-hidden="true" />
                    <span className="mt-2 text-xs font-semibold">{vendor.category}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs font-medium text-[#6B5B61]">
                    {vendor.category} · {vendor.city} ·{' '}
                    <span
                      className={
                        vendor.stage === 'Booked'
                          ? 'font-semibold text-[#16A34A]'
                          : vendor.stage === 'Shortlisted'
                            ? 'font-semibold text-[#7A1F3D]'
                            : ''
                      }
                    >
                      {vendor.stage}
                    </span>
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#2B2024]">
                    {vendor.name}
                  </h3>
                  <p className="font-mono-num mt-1 text-base font-semibold text-[#7A1F3D]">
                    {formatINR(vendor.estimatedCost)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#6B5B61]">{vendor.notes}</p>
                  {vendor.contact && (
                    <p className="font-mono-num mt-2 text-xs text-[#6B5B61]">{vendor.contact}</p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(122,31,61,0.08)] pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.stage !== 'Shortlisted' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStage(vendor.id, 'Shortlisted')}
                        className="rounded-full border border-[rgba(122,31,61,0.22)] px-3 py-1.5 text-xs font-semibold text-[#7A1F3D] hover:bg-[#FDF3F5]"
                      >
                        Shortlist
                      </button>
                    )}
                    {vendor.stage !== 'Booked' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStage(vendor.id, 'Booked')}
                        className="inline-flex items-center gap-1 rounded-full bg-[#E8A317] px-3.5 py-1.5 text-xs font-semibold text-[#2B2024] hover:bg-[#CE8D0E]"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Mark Booked
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStage(vendor.id, 'Suggested')}
                        className="rounded-full border border-[rgba(122,31,61,0.2)] px-3 py-1.5 text-xs font-semibold text-[#6B5B61] hover:bg-[#FFFBF5]"
                      >
                        Move to Suggested
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteVendor(vendor.id)}
                    aria-label={`Remove ${vendor.name}`}
                    className="rounded-lg p-1.5 text-[#6B5B61] hover:bg-[#FDF3F5] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
