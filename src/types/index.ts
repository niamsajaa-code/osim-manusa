export interface AppSettings {
  id: number;
  school_name: string;
  school_logo: string;
  election_title: string;
  election_period: string;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  created_at?: string;
  student_count?: number;
}

export interface Student {
  id: string;
  nisn: string;
  nama: string;
  tanggal_lahir: string; // YYYY-MM-DD
  class_id?: string | null;
  class_name: string;
  gender: 'L' | 'P';
  has_voted: boolean;
  voted_at?: string | null;
  created_at?: string;
}

export interface Candidate {
  id: string;
  candidate_number: number;
  ketua_name: string;
  wakil_name: string;
  photo_url: string;
  slogan: string;
  visi: string;
  misi: string | string[]; // Can be stored as JSON string or string array
  total_votes: number;
  percentage?: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  nama: string;
  created_at?: string;
}

export interface VotingStats {
  totalStudents: number;
  votedCount: number;
  notVotedCount: number;
  participationPercentage: number;
  totalCandidates: number;
  totalClasses: number;
  totalVotesCast: number;
}

export interface VoteResult {
  candidate: Candidate;
  votes: number;
  percentage: number;
}

export interface TableStatusInfo {
  name: string;
  status: 'ok' | 'error';
  rowCount: number;
  message?: string;
}

export interface SupabaseHealthStatus {
  connected: boolean;
  latencyMs: number;
  url: string;
  hasKey: boolean;
  tables: TableStatusInfo[];
  checkedAt: string;
}
