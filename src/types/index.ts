export type ID = string;

export interface Contact {
  id: ID;
  name: string;
  title?: string;
  company: string;
  email?: string;
  phone?: string;
  behavioral_profile: BehavioralProfile;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface BehavioralProfile {
  communication_style?: 'Analytical' | 'Assertive' | 'Amiable' | 'Expressive';
  decision_pattern?: string;
  hot_button_topics?: string[];
  preferred_communication?: string;
  intelligence_confidence?: number;
}

export interface Meeting {
  id: ID;
  contact_id: ID;
  date: string;
  transcript_raw: string;
  summary: string;
  sentiment_score: number;
  key_topics: string[];
  tone_analysis: string;
  created_at: string;
}

export interface Commitment {
  id: ID;
  meeting_id: ID;
  owner: string;
  owner_name: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  due_date?: string;
  priority: 'High' | 'Medium' | 'Low';
  is_critical: boolean;
  created_at: string;
  completed_at?: string;
}

export interface PrepBrief {
  id: ID;
  contact_id: ID;
  meeting_date: string;
  last_meeting_summary: string;
  open_commitments: { desc: string; id?: string }[];
  behavioral_insights: BehavioralProfile;
  recommended_strategy: string;
  talking_points: string[];
  red_flags: string[];
  generated_at: string;
}
