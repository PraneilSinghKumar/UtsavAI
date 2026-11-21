import React, { useState } from 'react';
import { Check, Copy, Plus, Search, Send, Trash2 } from 'lucide-react';
import { DietaryPref, GuestItem, RsvpStatus } from '../../types/planner';

interface GuestsTabProps {
  guests: GuestItem[];
  eventName: string;
  eventDate: string;
  city: string;
  onAddGuest: (guest: Omit<GuestItem, 'id' | 'inviteSent'>) => void;
  onUpdateStatus: (guestId: string, status: RsvpStatus) => void;
  onDeleteGuest: (guestId: string) => void;
  onMarkInvitesSent: (guestIds: string[]) => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  guests,
  eventName,
  eventDate,
  city,
  onAddGuest,
  onUpdateStatus,
  onDeleteGuest,
  onMarkInvitesSent,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RsvpStatus>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const [name, setName] = useState('');
  const [side, setSide] = useState<GuestItem['side']>('Host Family');
  const [partySize, setPartySize] = useState(2);
  const [dietary, setDietary] = useState<DietaryPref>('Vegetarian');
  const [ceremonies, setCeremonies] = useState('All Functions');
  const [contact, setContact] = useState('');

  const confirmedCount = guests
    .filter((g) => g.status === 'Confirmed')
    .reduce((s, g) => s + g.partySize, 0);
  const pendingCount = guests
    .filter((g) => g.status === 'Pending')
    .reduce((s, g) => s + g.partySize, 0);
  const declinedCount = guests
    .filter((g) => g.status === 'Declined')
    .reduce((s, g) => s + g.partySize, 0);
  const unsentGuests = guests.filter((g) => !g.inviteSent);

  const defaultInviteMessage = `Warmest greetings! You are cordially invited to ${eventName} on ${eventDate} in ${city}. Please reply with your headcount and dietary preference so we can welcome you comfortably.`;
  const [inviteMessage, setInviteMessage] = useState(defaultInviteMessage);

  const filtered = guests.filter((g) => {
    if (statusFilter !== 'All' && g.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.side.toLowerCase().includes(q) ||
        g.dietary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGuest({
      name: name.trim(),
      side,
      partySize: Math.max(1, Number(partySize) || 1),
      status: 'Pending',
      dietary,
      ceremonies: ceremonies.trim() || 'All Functions',
      contact: contact.trim() || 'Not provided',
    });
    setName('');
    setContact('');
    setShowAdd(false);
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      setCopiedInvite(false);
    }
  };

  const handleDispatchPending = () => {
    onMarkInvitesSent(unsentGuests.map((g) => g.id));
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#7A1F3D] sm:text-3xl">
            Guests &amp; RSVPs
          </h2>
          <p className="mt-1 text-sm text-[#6B5B61]">
            Manage family households, dietary preferences, and digital invitation dispatches.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setInviteMessage(defaultInviteMessage);
              setShowInviteModal(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[rgba(122,31,61,0.22)] bg-white px-4 py-2.5 text-xs font-semibold text-[#7A1F3D] hover:bg-[#FDF3F5]"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            Send Invites ({unsentGuests.length} pending)
          </button>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#7A1F3D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5E152D]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Household
          </button>
        </div>
      </div>

      {/* RSVP Summary Strip */}
      <div className="grid grid-cols-3 divide-x divide-[rgba(122,31,61,0.1)] rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white">
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Confirmed Headcount</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#16A34A]">{confirmedCount}</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Awaiting RSVP</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#D97706]">{pendingCount}</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-[#6B5B61]">Declined</p>
          <p className="font-mono-num mt-1 text-2xl font-bold text-[#6B5B61]">{declinedCount}</p>
        </div>
      </div>

      {/* Add Guest Form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-[rgba(122,31,61,0.16)] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Guest / Household Name</span>
              <input
                type="text"
                required
                placeholder="e.g., Meera & Rohan Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Group / Side</span>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as GuestItem['side'])}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              >
                <option value="Host Family">Host Family</option>
                <option value="Partner Family">Partner Family</option>
                <option value="Friends">Friends</option>
                <option value="Colleagues">Colleagues</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Party Size</span>
              <input
                type="number"
                min={1}
                max={20}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Dietary Preference</span>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryPref)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Jain">Jain</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Ceremonies</span>
              <input
                type="text"
                value={ceremonies}
                onChange={(e) => setCeremonies(e.target.value)}
                className="w-full rounded-lg border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#6B5B61]">Email or Phone</span>
              <input
                type="text"
                placeholder="email@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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
              Save Guest
            </button>
          </div>
        </form>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B5B61]"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search guest, family side, or diet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[rgba(122,31,61,0.16)] bg-white py-2.5 pr-4 pl-10 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-[rgba(122,31,61,0.12)] bg-white p-1">
          {(['All', 'Confirmed', 'Pending', 'Declined'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#7A1F3D] text-white'
                  : 'text-[#6B5B61] hover:text-[#7A1F3D]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(122,31,61,0.1)] text-xs font-semibold text-[#6B5B61]">
              <th className="px-5 py-3.5">Household</th>
              <th className="px-4 py-3.5">Side</th>
              <th className="px-4 py-3.5 text-right">Seats</th>
              <th className="px-4 py-3.5">Dietary</th>
              <th className="px-4 py-3.5">Invite</th>
              <th className="px-4 py-3.5">RSVP Status</th>
              <th className="px-4 py-3.5 text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(122,31,61,0.07)]">
            {filtered.map((guest) => (
              <tr key={guest.id} className="hover:bg-[#FFFBF5]">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-[#2B2024]">{guest.name}</p>
                  <p className="text-xs text-[#6B5B61]">{guest.ceremonies}</p>
                </td>
                <td className="px-4 py-3.5 text-xs text-[#6B5B61]">{guest.side}</td>
                <td className="font-mono-num px-4 py-3.5 text-right font-semibold text-[#2B2024]">
                  {guest.partySize}
                </td>
                <td className="px-4 py-3.5 text-xs text-[#6B5B61]">{guest.dietary}</td>
                <td className="px-4 py-3.5 text-xs text-[#6B5B61]">
                  {guest.inviteSent ? 'Sent' : 'Not sent'}
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={guest.status}
                    aria-label={`RSVP status for ${guest.name}`}
                    onChange={(e) => onUpdateStatus(guest.id, e.target.value as RsvpStatus)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                      guest.status === 'Confirmed'
                        ? 'border-[#16A34A]/30 bg-[#F0FDF4] text-[#16A34A]'
                        : guest.status === 'Pending'
                          ? 'border-[#D97706]/30 bg-[#FFFBEB] text-[#D97706]'
                          : 'border-[rgba(122,31,61,0.16)] bg-[#FFFBF5] text-[#6B5B61]'
                    }`}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteGuest(guest.id)}
                    aria-label={`Remove ${guest.name}`}
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

      {/* Digital Invite Composer Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2024]/45 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[rgba(122,31,61,0.15)] bg-white p-6 shadow-xl">
            <h3 id="invite-dialog-title" className="font-display text-xl font-bold text-[#7A1F3D]">
              Digital Invite Dispatch
            </h3>
            <p className="mt-1 text-xs text-[#6B5B61]">
              Customize your invitation note to copy or mark{' '}
              <span className="font-mono-num font-semibold">{unsentGuests.length}</span> pending
              households as invited.
            </p>

            <textarea
              rows={4}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="mt-4 w-full rounded-xl border border-[rgba(122,31,61,0.2)] bg-[#FFFBF5] p-3 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(122,31,61,0.22)] px-4 py-2 text-xs font-semibold text-[#7A1F3D] hover:bg-[#FDF3F5]"
              >
                {copiedInvite ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedInvite ? 'Copied Message' : 'Copy Invite Text'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-full border border-[rgba(122,31,61,0.2)] px-4 py-2 text-xs font-semibold text-[#6B5B61]"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={unsentGuests.length === 0}
                  onClick={handleDispatchPending}
                  className="rounded-full bg-[#E8A317] px-5 py-2 text-xs font-semibold text-[#2B2024] disabled:opacity-50"
                >
                  Mark All Sent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
