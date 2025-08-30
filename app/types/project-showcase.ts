export interface ProjectShowcaseSlot {
  id: number;
  slot_number: number;
  member_id: number;
  member_name: string;
  member_github_username: string;
  member_title: string;
  allocated_at: string;
  status: 'allocated' | 'confirmed' | 'cancelled';
  event_id: string;
  event_name: string;
  metadata: Record<string, any>;
}

export interface ProjectShowcaseMember {
  id: number;
  name: string;
  github_username: string;
  title: string;
  avatar_url?: string;
  bash_points: number;
  clan_name?: string;
  basher_no?: string;
}

export interface SlotAllocationResponse {
  success: boolean;
  slotNumber?: number;
  message: string;
  error?: string;
}

export interface ProjectShowcaseEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  maxSlots: number;
  eligibilityRequirements: string[];
  presentationDuration: number;
  qaDuration: number;
}

export const PROJECT_SHOWCASE_CONFIG = {
  DEFAULT_MAX_SLOTS: 25,
  ELIGIBILITY_KEYWORD: 'basher',
  DEFAULT_PRESENTATION_DURATION: 10, // minutes
  DEFAULT_QA_DURATION: 5, // minutes
} as const;
