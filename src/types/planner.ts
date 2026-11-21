export type CelebrationType =
  | 'Wedding'
  | 'Engagement'
  | 'Birthday'
  | 'Anniversary'
  | 'Corporate Offsite'
  | 'Baby Shower';

export type WorkspaceTab =
  | 'dashboard'
  | 'timeline'
  | 'vendors'
  | 'guests'
  | 'budget'
  | 'shubh-ai';

export type TaskPhase =
  | '6+ Months Out'
  | '3-5 Months Out'
  | '1 Month Out'
  | 'Event Week';

export interface TimelineTask {
  id: string;
  title: string;
  ceremony: string;
  phase: TaskPhase;
  dueDate: string; // YYYY-MM-DD
  owner: string;
  priority: 'High' | 'Medium' | 'Normal';
  completed: boolean;
}

export type VendorStage = 'Suggested' | 'Shortlisted' | 'Booked';
export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Decor'
  | 'Photography'
  | 'Entertainment';

export interface VendorItem {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  estimatedCost: number;
  stage: VendorStage;
  notes: string;
  contact?: string;
  imageUrl?: string;
}

export type RsvpStatus = 'Confirmed' | 'Pending' | 'Declined';
export type DietaryPref = 'Vegetarian' | 'Jain' | 'Non-Veg' | 'Vegan';

export interface GuestItem {
  id: string;
  name: string;
  side: 'Host Family' | 'Partner Family' | 'Friends' | 'Colleagues';
  partySize: number;
  status: RsvpStatus;
  dietary: DietaryPref;
  ceremonies: string;
  contact: string;
  inviteSent: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Due';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface EventPlanState {
  eventName: string;
  eventType: CelebrationType;
  eventDate: string; // YYYY-MM-DD
  city: string;
  guestCount: number;
  totalBudget: number;
  tasks: TimelineTask[];
  vendors: VendorItem[];
  guests: GuestItem[];
  budgetCategories: BudgetCategory[];
  expenses: ExpenseItem[];
  chatHistory: ChatMessage[];
}

export interface ReplanProposal {
  summary: string;
  tasks: Array<{
    title: string;
    ceremony: string;
    phase: string;
    dueDate: string;
    owner: string;
    priority: string;
  }>;
  budgetCategories: Array<{
    name: string;
    allocated: number;
  }>;
  vendorSuggestions: Array<{
    name: string;
    category: string;
    city: string;
    estimatedCost: number;
    notes: string;
  }>;
}
