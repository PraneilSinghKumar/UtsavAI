import { CelebrationType, EventPlanState } from '../types/planner';

export const HERO_IMAGE_URL = '/src/assets/images/hero_celebration_1795261065692.jpg';
export const VENUE_IMAGE_URL = '/src/assets/images/vendor_venue_courtyard_1795261064722.jpg';
export const CATERING_IMAGE_URL = '/src/assets/images/vendor_catering_feast_1795261065566.jpg';

export const CELEBRATION_PRESETS: Record<
  CelebrationType,
  {
    eventName: string;
    city: string;
    guestCount: number;
    totalBudget: number;
    daysFromNow: number;
    ceremonies: string[];
  }
> = {
  Wedding: {
    eventName: "Aarav & Meera's Wedding",
    city: 'Udaipur',
    guestCount: 250,
    totalBudget: 3500000,
    daysFromNow: 142,
    ceremonies: ['Mehendi', 'Sangeet', 'Haldi', 'Pheras & Reception'],
  },
  Engagement: {
    eventName: "Rhea & Dev's Roka & Ring Ceremony",
    city: 'Jaipur',
    guestCount: 120,
    totalBudget: 1200000,
    daysFromNow: 78,
    ceremonies: ['Tilak & Roka', 'Evening Cocktail'],
  },
  Birthday: {
    eventName: "Kabir's 40th Milestone Soirée",
    city: 'Bengaluru',
    guestCount: 85,
    totalBudget: 550000,
    daysFromNow: 45,
    ceremonies: ['Sunset Courtyard Mixer', 'Dinner & Toast'],
  },
  Anniversary: {
    eventName: "Sharma Parents' 25th Silver Jubilee",
    city: 'Mumbai',
    guestCount: 140,
    totalBudget: 1400000,
    daysFromNow: 64,
    ceremonies: ['Vow Renewal', 'Gala Dinner'],
  },
  'Corporate Offsite': {
    eventName: 'Annual Leadership Retreat 2027',
    city: 'Goa',
    guestCount: 110,
    totalBudget: 1850000,
    daysFromNow: 92,
    ceremonies: ['Townhall', 'Beachside Gala', 'Team Workshops'],
  },
  'Baby Shower': {
    eventName: "Ananya's Godh Bharai Brunch",
    city: 'New Delhi',
    guestCount: 65,
    totalBudget: 420000,
    daysFromNow: 38,
    ceremonies: ['Traditional Blessing', 'Garden High Tea'],
  },
};

function offsetIsoDate(daysFromToday: number): string {
  const base = new Date();
  base.setDate(base.getDate() + daysFromToday);
  return base.toISOString().slice(0, 10);
}

export function createInitialPlan(eventType: CelebrationType = 'Wedding'): EventPlanState {
  const preset = CELEBRATION_PRESETS[eventType];
  const eventDate = offsetIsoDate(preset.daysFromNow);
  const b = preset.totalBudget;

  return {
    eventName: preset.eventName,
    eventType,
    eventDate,
    city: preset.city,
    guestCount: preset.guestCount,
    totalBudget: b,
    tasks: [
      {
        id: 't-1',
        title: `Finalize ${preset.ceremonies[0]} courtyard venue contract`,
        ceremony: preset.ceremonies[0],
        phase: '6+ Months Out',
        dueDate: offsetIsoDate(-3), // Overdue so Overdue Tasks works out of the box
        owner: 'Host Lead',
        priority: 'High',
        completed: false,
      },
      {
        id: 't-2',
        title: 'Lock catering tasting menu & Jain counter count',
        ceremony: 'All Functions',
        phase: '3-5 Months Out',
        dueDate: offsetIsoDate(6),
        owner: 'Family Committee',
        priority: 'High',
        completed: false,
      },
      {
        id: 't-3',
        title: 'Approve floral & brass lantern decor moodboard',
        ceremony: preset.ceremonies[preset.ceremonies.length - 1],
        phase: '3-5 Months Out',
        dueDate: offsetIsoDate(12),
        owner: 'Decor Lead',
        priority: 'Medium',
        completed: false,
      },
      {
        id: 't-4',
        title: 'Send digital save-the-date cards to outstation guests',
        ceremony: 'All Functions',
        phase: '3-5 Months Out',
        dueDate: offsetIsoDate(-8),
        owner: 'Guest Desk',
        priority: 'High',
        completed: true,
      },
      {
        id: 't-5',
        title: 'Book candid photography & drone highlight reel crew',
        ceremony: 'All Functions',
        phase: '3-5 Months Out',
        dueDate: offsetIsoDate(18),
        owner: 'Partner Lead',
        priority: 'Medium',
        completed: true,
      },
      {
        id: 't-6',
        title: 'Confirm airport pickup fleet & hospitality desk schedule',
        ceremony: 'Hospitality',
        phase: '1 Month Out',
        dueDate: offsetIsoDate(Math.max(15, preset.daysFromNow - 21)),
        owner: 'Logistics',
        priority: 'Normal',
        completed: false,
      },
      {
        id: 't-7',
        title: 'Final headcount lock & table seating chart sign-off',
        ceremony: 'All Functions',
        phase: 'Event Week',
        dueDate: offsetIsoDate(Math.max(20, preset.daysFromNow - 5)),
        owner: 'Host Lead',
        priority: 'High',
        completed: false,
      },
    ],
    vendors: [
      {
        id: 'v-1',
        name: 'Chunda Heritage Courtyard',
        category: 'Venue',
        city: preset.city,
        estimatedCost: Math.round(b * 0.34),
        stage: 'Booked',
        notes: 'Sandstone haveli courtyard with 45 guest suites and rain backup pavilion.',
        contact: '+91 98290 44120',
        imageUrl: VENUE_IMAGE_URL,
      },
      {
        id: 'v-2',
        name: 'Saffron & Brass Kitchen',
        category: 'Catering',
        city: preset.city,
        estimatedCost: Math.round(b * 0.28),
        stage: 'Shortlisted',
        notes: 'Artisanal regional thalis, live chaat courtyard, and dedicated Jain prep.',
        contact: '+91 98112 33091',
        imageUrl: CATERING_IMAGE_URL,
      },
      {
        id: 'v-3',
        name: 'Genda Phool Studio',
        category: 'Decor',
        city: preset.city,
        estimatedCost: Math.round(b * 0.14),
        stage: 'Shortlisted',
        notes: 'Fresh marigold canopies, hammered brass diyas, and ivory drape styling.',
        contact: '+91 99204 88123',
        imageUrl: HERO_IMAGE_URL,
      },
      {
        id: 'v-4',
        name: 'Katha Frames Collective',
        category: 'Photography',
        city: preset.city,
        estimatedCost: Math.round(b * 0.09),
        stage: 'Booked',
        notes: 'Documentary 35mm candid team + same-day edit reel.',
        contact: '+91 98450 77612',
      },
      {
        id: 'v-5',
        name: 'Taal Folk & Percussion Ensemble',
        category: 'Entertainment',
        city: preset.city,
        estimatedCost: Math.round(b * 0.06),
        stage: 'Suggested',
        notes: 'Acoustic Rajasthani folk welcome + evening acoustic DJ fusion.',
        contact: '+91 97170 21455',
      },
    ],
    guests: [
      {
        id: 'g-1',
        name: 'Rajesh & Sunita Kapoor Family',
        side: 'Host Family',
        partySize: 4,
        status: 'Confirmed',
        dietary: 'Vegetarian',
        ceremonies: preset.ceremonies.join(', '),
        contact: 'kapoor.family@example.com',
        inviteSent: true,
      },
      {
        id: 'g-2',
        name: 'Vikram & Priya Malhotra',
        side: 'Partner Family',
        partySize: 3,
        status: 'Confirmed',
        dietary: 'Jain',
        ceremonies: preset.ceremonies.join(', '),
        contact: 'vikram.m@example.com',
        inviteSent: true,
      },
      {
        id: 'g-3',
        name: 'Aditi Rao & Siddharth Nair',
        side: 'Friends',
        partySize: 2,
        status: 'Pending',
        dietary: 'Non-Veg',
        ceremonies: preset.ceremonies[preset.ceremonies.length - 1],
        contact: 'aditi.rao@example.com',
        inviteSent: true,
      },
      {
        id: 'g-4',
        name: 'Neha & Arjun Deshmukh',
        side: 'Colleagues',
        partySize: 2,
        status: 'Pending',
        dietary: 'Vegetarian',
        ceremonies: preset.ceremonies.join(', '),
        contact: 'neha.d@example.com',
        inviteSent: false,
      },
      {
        id: 'g-5',
        name: 'Dr. Ramesh & Kavita Joshi',
        side: 'Host Family',
        partySize: 2,
        status: 'Declined',
        dietary: 'Vegetarian',
        ceremonies: preset.ceremonies[0],
        contact: 'rjoshi@example.com',
        inviteSent: true,
      },
    ],
    budgetCategories: [
      { id: 'bc-1', name: 'Venue & Hospitality', allocated: Math.round(b * 0.35) },
      { id: 'bc-2', name: 'Catering & Mithai', allocated: Math.round(b * 0.28) },
      { id: 'bc-3', name: 'Decor & Florals', allocated: Math.round(b * 0.15) },
      { id: 'bc-4', name: 'Photography & Film', allocated: Math.round(b * 0.09) },
      { id: 'bc-5', name: 'Entertainment & Sound', allocated: Math.round(b * 0.06) },
      { id: 'bc-6', name: 'Attire & Contingency', allocated: b - Math.round(b * 0.35) - Math.round(b * 0.28) - Math.round(b * 0.15) - Math.round(b * 0.09) - Math.round(b * 0.06) },
    ],
    expenses: [
      {
        id: 'ex-1',
        title: 'Chunda Heritage Courtyard — 40% Booking Advance',
        category: 'Venue & Hospitality',
        totalAmount: Math.round(b * 0.34),
        paidAmount: Math.round(b * 0.14),
        dueDate: offsetIsoDate(5),
        status: 'Partial',
      },
      {
        id: 'ex-2',
        title: 'Katha Frames Collective — Retainer',
        category: 'Photography & Film',
        totalAmount: Math.round(b * 0.09),
        paidAmount: Math.round(b * 0.09),
        dueDate: offsetIsoDate(-5),
        status: 'Paid',
      },
      {
        id: 'ex-3',
        title: 'Saffron & Brass Kitchen — Tasting & Menu Hold',
        category: 'Catering & Mithai',
        totalAmount: Math.round(b * 0.28),
        paidAmount: 0,
        dueDate: offsetIsoDate(9),
        status: 'Due',
      },
    ],
    chatHistory: [
      {
        id: 'c-1',
        role: 'assistant',
        content: `Namaste! I am Shubh, your planning co-pilot for ${preset.eventName} in ${preset.city}. Your timeline, ₹${b.toLocaleString('en-IN')} budget split, and ${preset.guestCount}-guest tracker are calibrated. Ask me anything or use What Changed to replan anytime.`,
        timestamp: 'Just now',
      },
    ],
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return formatINR(amount);
}

export function getDaysRemaining(targetIsoDate: string): number {
  const target = new Date(targetIsoDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
