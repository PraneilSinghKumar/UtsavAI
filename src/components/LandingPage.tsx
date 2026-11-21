import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  HeartHandshake,
  IndianRupee,
  Menu,
  RefreshCw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { CelebrationType } from '../types/planner';
import { CELEBRATION_PRESETS, HERO_IMAGE_URL, formatCompactINR } from '../data/presets';

interface LandingPageProps {
  selectedEventType: CelebrationType;
  onSelectEventType: (type: CelebrationType) => void;
  onStartPlanning: (customSetup?: {
    eventType: CelebrationType;
    city: string;
    guestCount: number;
    totalBudget: number;
    eventDate: string;
  }) => void;
}

const CELEBRATION_TYPES: CelebrationType[] = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Anniversary',
  'Corporate Offsite',
  'Baby Shower',
];

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedEventType,
  onSelectEventType,
  onStartPlanning,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const preset = CELEBRATION_PRESETS[selectedEventType];
  const [quickCity, setQuickCity] = useState(preset.city);
  const [quickGuests, setQuickGuests] = useState(preset.guestCount);
  const [quickBudget, setQuickBudget] = useState(preset.totalBudget);
  const [quickDate, setQuickDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + preset.daysFromNow);
    return d.toISOString().slice(0, 10);
  });

  const handleTypeChange = (type: CelebrationType) => {
    onSelectEventType(type);
    const next = CELEBRATION_PRESETS[type];
    setQuickCity(next.city);
    setQuickGuests(next.guestCount);
    setQuickBudget(next.totalBudget);
    const d = new Date();
    d.setDate(d.getDate() + next.daysFromNow);
    setQuickDate(d.toISOString().slice(0, 10));
  };

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    onStartPlanning({
      eventType: selectedEventType,
      city: quickCity.trim() || preset.city,
      guestCount: Math.max(10, Number(quickGuests) || preset.guestCount),
      totalBudget: Math.max(50000, Number(quickBudget) || preset.totalBudget),
      eventDate: quickDate,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#2B2024]">
      {/* 3-Zone Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-[rgba(122,31,61,0.12)] bg-[#FFFBF5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1200px] items-center justify-between gap-8 px-6">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-2xl font-bold tracking-tight text-[#7A1F3D]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A1F3D] text-[#E8A317]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            Utsav AI
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a
              href="#features"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-[#6B5B61] transition-colors hover:text-[#7A1F3D] hover:underline hover:underline-offset-4"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-[#6B5B61] transition-colors hover:text-[#7A1F3D] hover:underline hover:underline-offset-4"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-[#6B5B61] transition-colors hover:text-[#7A1F3D] hover:underline hover:underline-offset-4"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-[#6B5B61] transition-colors hover:text-[#7A1F3D] hover:underline hover:underline-offset-4"
            >
              Stories
            </a>
          </nav>

          {/* Zone 3: 1 Primary CTA + Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => onStartPlanning()}
              className="hidden shrink-0 whitespace-nowrap rounded-full bg-[#E8A317] px-6 py-2.5 text-sm font-semibold text-[#2B2024] shadow-sm transition-all duration-200 hover:bg-[#CE8D0E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1F3D] md:inline-flex"
            >
              Start Planning
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="flex flex-col gap-3 border-t border-[rgba(122,31,61,0.1)] bg-[#FFFBF5] px-6 py-4 md:hidden">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-[rgba(122,31,61,0.06)] py-2 text-sm font-medium text-[#2B2024]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-[rgba(122,31,61,0.06)] py-2 text-sm font-medium text-[#2B2024]"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-[rgba(122,31,61,0.06)] py-2 text-sm font-medium text-[#2B2024]"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-[rgba(122,31,61,0.06)] py-2 text-sm font-medium text-[#2B2024]"
            >
              Stories
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onStartPlanning();
              }}
              className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#2B2024]"
            >
              Start Planning
            </button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[rgba(122,31,61,0.08)] py-14 lg:py-20">
          <div className="mx-auto grid max-w-[1200px] items-stretch gap-12 px-6 lg:grid-cols-12">
            {/* Left Proposition + Quick Launch */}
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="mb-4 text-xs font-semibold tracking-widest text-[#7A1F3D] uppercase">
                Meet Shubh · Your 24/7 Celebration Co-Pilot
              </p>

              <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-[#2B2024] [text-wrap:balance] sm:text-5xl lg:text-[3.55rem] lg:leading-[1.1]">
                Plan Your Perfect Event <span className="italic text-[#7A1F3D]">with AI</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-[#6B5B61] sm:text-lg">
                Enter your budget, guests, and date. Shubh builds your ceremony timeline, vendor shortlist, and live budget split—then adapts instantly when plans shift.
              </p>

              {/* Interactive Quick-Launch Planner Bar */}
              <form
                onSubmit={handleQuickLaunch}
                className="mt-8 rounded-2xl border border-[rgba(122,31,61,0.14)] bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Celebration type">
                  {CELEBRATION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedEventType === type
                          ? 'bg-[#7A1F3D] text-white'
                          : 'bg-[#FFFBF5] text-[#6B5B61] hover:bg-[#FDF3F5] hover:text-[#7A1F3D]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-[#6B5B61]">City</span>
                    <input
                      type="text"
                      value={quickCity}
                      onChange={(e) => setQuickCity(e.target.value)}
                      className="w-full rounded-lg border border-[rgba(122,31,61,0.16)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-[#6B5B61]">Guests</span>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={quickGuests}
                      onChange={(e) => setQuickGuests(Number(e.target.value))}
                      className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.16)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-[#6B5B61]">Budget (₹)</span>
                    <input
                      type="number"
                      min={50000}
                      step={50000}
                      value={quickBudget}
                      onChange={(e) => setQuickBudget(Number(e.target.value))}
                      className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.16)] bg-[#FFFBF5] px-3 py-2 text-sm text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-[#6B5B61]">Target Date</span>
                    <input
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="font-mono-num w-full rounded-lg border border-[rgba(122,31,61,0.16)] bg-[#FFFBF5] px-2.5 py-2 text-xs text-[#2B2024] focus:border-[#7A1F3D] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#2B2024] transition-all duration-200 hover:bg-[#CE8D0E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1F3D]"
                  >
                    Launch My {selectedEventType} Workspace
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <a
                    href="#how-it-works"
                    className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-[rgba(122,31,61,0.22)] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition-colors hover:bg-[#FDF3F5]"
                  >
                    See How It Works
                  </a>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-[#6B5B61]">
                <span>No spreadsheets needed</span>
                <span aria-hidden="true">·</span>
                <span>Built for Indian &amp; global celebrations</span>
                <span aria-hidden="true">·</span>
                <span>Made in India</span>
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div className="flex flex-col lg:col-span-6">
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-[rgba(122,31,61,0.14)] bg-[#2B2024] min-h-[380px]">
                {!heroImgFailed ? (
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Heritage sandstone courtyard wedding mandap illuminated by marigold garlands and brass lanterns"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7A1F3D] via-[#5E152D] to-[#2B2024] p-8 text-center text-[#FFFBF5]">
                    <div>
                      <Sparkles className="mx-auto mb-3 h-10 w-10 text-[#E8A317]" />
                      <p className="font-display text-2xl font-semibold">{preset.eventName}</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#2B2024]/90 via-[#2B2024]/30 to-transparent" />

                <div className="absolute right-0 bottom-0 left-0 p-6 text-[#FFFBF5]">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#F8E1E7]">
                    <span>{preset.eventName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{quickCity || preset.city}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">{formatCompactINR(quickBudget)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#FFFBF5]/95">
                    <strong className="font-semibold text-[#E8A317]">Shubh AI:</strong>{' '}
                    Sangeet choreographer &amp; courtyard lighting shortlisted within your{' '}
                    <span className="font-mono-num">{quickGuests}</span>-guest plan. Ready to review vendor quotes and ceremony milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Full-Width KPI Strip below Hero */}
          <div className="mx-auto mt-10 max-w-[1200px] px-6">
            <div className="grid grid-cols-2 divide-y divide-[rgba(122,31,61,0.1)] rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white md:grid-cols-4 md:divide-x md:divide-y-0">
              <div className="p-5">
                <p className="text-xs font-medium text-[#6B5B61]">Celebration Formats</p>
                <p className="font-mono-num mt-1 text-2xl font-bold text-[#7A1F3D]">6 Modes</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-[#6B5B61]">Budget Calibration</p>
                <p className="font-mono-num mt-1 text-2xl font-bold text-[#2B2024]">Live INR Split</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-[#6B5B61]">Replan Turnaround</p>
                <p className="font-mono-num mt-1 text-2xl font-bold text-[#2B2024]">&lt; 10 sec</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-[#6B5B61]">Guest &amp; Dietary Tracking</p>
                <p className="font-mono-num mt-1 text-2xl font-bold text-[#2B2024]">Ceremony-Wise</p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Bento Grid (6 Core Features) */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-widest text-[#7A1F3D] uppercase">
                Everything In One Workspace
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#2B2024] [text-wrap:balance] sm:text-4xl">
                Crafted for calm, organized celebrations
              </h2>
              <p className="mt-3 text-base text-[#6B5B61]">
                From big-picture timelines to last-minute vendor shifts, Utsav AI keeps every ritual, rupee, and RSVP aligned.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-12">
              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-7 md:col-span-7">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D]">
                  <Calendar className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">01. Smart Timeline</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B5B61]">
                  Month-by-month milestones generated around your exact wedding or party date, cultural ceremonies, and family owners—with instant overdue rescheduling.
                </p>
              </article>

              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-7 md:col-span-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D]">
                  <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">02. Vendor Matchmaker</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">
                  Move florists, caterers, venues, and photographers cleanly from Suggested to Shortlisted to Booked while keeping quotes synced.
                </p>
              </article>

              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-7 md:col-span-4">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D]">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">03. RSVP Tracker</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">
                  Track family households, ceremony-wise attendance, Jain and vegetarian dietary notes, and invite dispatch status.
                </p>
              </article>

              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-7 md:col-span-4">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D]">
                  <IndianRupee className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">04. Budget Guardian</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">
                  Category-by-category INR allocations, advance payment tracking, and real-time spend visibility before extras add up.
                </p>
              </article>

              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-7 md:col-span-4">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF3F5] text-[#7A1F3D]">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B2024]">05. Auto Reminders</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">
                  Live top-bar alerts for upcoming vendor advances, overdue tasks, and pending guest follow-ups.
                </p>
              </article>

              <article className="rounded-2xl border border-[rgba(122,31,61,0.12)] bg-[#FDF3F5]/65 p-7 md:col-span-12">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="max-w-2xl">
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#7A1F3D] text-[#E8A317]">
                      <RefreshCw className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#2B2024]">
                      06. Instant Replanning with Shubh AI
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">
                      Guest count jumped by 60 or venue city shifted? Describe what changed once—Shubh recalibrates your timeline phases, INR category splits, and vendor picks in seconds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartPlanning()}
                    className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full bg-[#7A1F3D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5E152D] md:self-center"
                  >
                    Open Shubh Replanner
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works + Celebration Selector */}
        <section id="how-it-works" className="border-y border-[rgba(122,31,61,0.08)] bg-[#FDF3F5]/60 py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-widest text-[#7A1F3D] uppercase">
                How It Works
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#2B2024] [text-wrap:balance] sm:text-4xl">
                From first spark to pheras &amp; toasts
              </h2>
              <p className="mt-3 text-base text-[#6B5B61]">
                A calm, guided workflow that adapts as your celebration evolves.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Tell us your event',
                  desc: 'Share your celebration type, target date, approximate guest count, and total INR budget.',
                },
                {
                  step: '02',
                  title: 'Get your plan',
                  desc: 'Shubh builds a tailored checklist, category budget split, and curated vendor shortlist.',
                },
                {
                  step: '03',
                  title: 'Track everything',
                  desc: 'Manage RSVPs, vendor bookings, and upcoming advance payments from one workspace.',
                },
                {
                  step: '04',
                  title: 'Replan when life happens',
                  desc: 'Rain forecast or sudden guest additions? Recalculate timelines and splits in one click.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[rgba(122,31,61,0.1)] bg-white p-6"
                >
                  <p className="font-mono-num text-sm font-bold text-[#7A1F3D]">{item.step}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-[#2B2024]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B5B61]">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Celebration Type Selector */}
            <div className="mt-12 text-center">
              <p className="mb-4 text-sm font-semibold text-[#6B5B61]">
                Pick your celebration to pre-load tailored templates:
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {CELEBRATION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                      selectedEventType === type
                        ? 'border-[#7A1F3D] bg-[#7A1F3D] text-white'
                        : 'border-[rgba(122,31,61,0.18)] bg-white text-[#2B2024] hover:border-[#7A1F3D] hover:text-[#7A1F3D]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-widest text-[#7A1F3D] uppercase">
                Simple Pricing
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#2B2024] [text-wrap:balance] sm:text-4xl">
                Plans for every celebration size
              </h2>
              <p className="mt-3 text-base text-[#6B5B61]">
                Start free with your core timeline and guest tracker, or unlock full Shubh AI replanning.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Free */}
              <div className="flex flex-col rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-8">
                <p className="text-xs font-semibold text-[#6B5B61]">For intimate gatherings</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#7A1F3D]">Free</h3>
                <p className="font-mono-num mt-4 text-4xl font-bold text-[#2B2024]">
                  ₹0 <span className="font-sans text-sm font-normal text-[#6B5B61]">/ forever</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-[#2B2024]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />1 active event workspace
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Smart timeline &amp; checklist
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Up to 75 guest RSVPs
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Core INR budget split
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => onStartPlanning()}
                  className="mt-8 w-full rounded-full border border-[rgba(122,31,61,0.25)] bg-white px-5 py-3 text-sm font-semibold text-[#7A1F3D] transition-colors hover:bg-[#FDF3F5]"
                >
                  Start Free
                </button>
              </div>

              {/* Pro */}
              <div className="flex flex-col rounded-2xl border-2 border-[#E8A317] bg-white p-8">
                <p className="text-xs font-semibold text-[#7A1F3D]">
                  Most Popular · Multi-day celebrations
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#7A1F3D]">Pro</h3>
                <p className="font-mono-num mt-4 text-4xl font-bold text-[#2B2024]">
                  ₹1,499 <span className="font-sans text-sm font-normal text-[#6B5B61]">/ event</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-[#2B2024]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Unlimited guests &amp; sub-events
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Shubh AI chat &amp; instant replanning
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Vendor Shortlist &amp; Quote Ledger
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Auto payment &amp; task reminders
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => onStartPlanning()}
                  className="mt-8 w-full rounded-full bg-[#E8A317] px-5 py-3 text-sm font-semibold text-[#2B2024] transition-colors hover:bg-[#CE8D0E]"
                >
                  Start Planning with Pro
                </button>
              </div>

              {/* Planner Studio */}
              <div className="flex flex-col rounded-2xl border border-[rgba(122,31,61,0.12)] bg-white p-8">
                <p className="text-xs font-semibold text-[#6B5B61]">For boutique agencies</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#7A1F3D]">
                  Planner Studio
                </h3>
                <p className="font-mono-num mt-4 text-4xl font-bold text-[#2B2024]">
                  ₹4,999 <span className="font-sans text-sm font-normal text-[#6B5B61]">/ month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-[#2B2024]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Unlimited client events
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />White-label guest &amp; vendor portals
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Team seats &amp; role permissions
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#7A1F3D]" />Priority Shubh AI concierge
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => onStartPlanning()}
                  className="mt-8 w-full rounded-full bg-[#7A1F3D] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5E152D]"
                >
                  Try Planner Studio
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-t border-[rgba(122,31,61,0.08)] bg-[#FDF3F5]/60 py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-widest text-[#7A1F3D] uppercase">
                Celebration Stories
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#2B2024] [text-wrap:balance] sm:text-4xl">
                Loved by hosts &amp; planners across India
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  quote:
                    'We planned a 300-guest Jaipur wedding from Bengaluru. When our mehendi venue fell through 5 weeks out, Shubh re-routed our timeline and budget split in under a minute.',
                  name: 'Ananya & Kabir Mehta',
                  role: 'Destination Wedding · Jaipur (300 guests)',
                  initials: 'AK',
                },
                {
                  quote:
                    'My parents wanted traditional rituals and I wanted clean vendor tracking. Having RSVPs, advance due dates, and Shubh reminders in one place saved us 12 hours a week.',
                  name: 'Rohan Sharma',
                  role: '25th Anniversary Host · Mumbai (140 guests)',
                  initials: 'RS',
                },
                {
                  quote:
                    'Our 120-person Goa corporate offsite ran under budget by 8%. Budget Guardian kept F&B, rooms, and AV costs transparent down to the last rupee.',
                  name: 'Neha Patel',
                  role: 'People Operations Lead · Pune (120 attendees)',
                  initials: 'NP',
                },
              ].map((t) => (
                <article
                  key={t.name}
                  className="flex flex-col justify-between rounded-2xl border border-[rgba(122,31,61,0.1)] bg-white p-7"
                >
                  <p className="text-sm leading-relaxed text-[#2B2024] italic">“{t.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8E1E7] font-display text-sm font-bold text-[#7A1F3D]">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2B2024]">{t.name}</p>
                      <p className="text-xs text-[#6B5B61]">{t.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="rounded-3xl bg-[#7A1F3D] px-8 py-14 text-center text-[#FFFBF5]">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold [text-wrap:balance] sm:text-4xl">
                Ready to celebrate without the spreadsheet chaos?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-[#FFFBF5]/85">
                Launch your personalized workspace and let Shubh map out your timeline, budget, and vendor shortlist.
              </p>
              <button
                type="button"
                onClick={() => onStartPlanning()}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#E8A317] px-7 py-3.5 text-sm font-semibold text-[#2B2024] transition-colors hover:bg-[#CE8D0E]"
              >
                Start Planning Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet 4-Column Footer */}
      <footer className="bg-[#23181C] py-14 text-[#FFFBF5]/75">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-xl font-bold text-white">Utsav AI</p>
              <p className="mt-3 max-w-xs text-sm text-[#FFFBF5]/65">
                Your calm, culturally thoughtful AI co-pilot for weddings, milestones, and memorable gatherings.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-white uppercase">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-[#E8A317]">Smart Timeline</a></li>
                <li><a href="#features" className="hover:text-[#E8A317]">Vendor Matchmaker</a></li>
                <li><a href="#features" className="hover:text-[#E8A317]">Budget Guardian</a></li>
                <li><a href="#pricing" className="hover:text-[#E8A317]">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-white uppercase">Celebrations</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-[#E8A317]">Weddings</a></li>
                <li><a href="#how-it-works" className="hover:text-[#E8A317]">Engagements</a></li>
                <li><a href="#how-it-works" className="hover:text-[#E8A317]">Milestone Birthdays</a></li>
                <li><a href="#how-it-works" className="hover:text-[#E8A317]">Corporate Offsites</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-white uppercase">Stories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#testimonials" className="hover:text-[#E8A317]">Customer Stories</a></li>
                <li><a href="#top" className="hover:text-[#E8A317]">About Shubh AI</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-[#FFFBF5]/55">
            <span>© 2026 Utsav AI. Crafted for joyful celebrations.</span>
            <span>Made in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
