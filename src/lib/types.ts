export type UserRole = 'admin' | 'founder' | 'freelancer';

export type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type SavingsTransactionType = 'deposit' | 'withdrawal';

export type ContactStatus = 'new' | 'read' | 'replied';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  client_name: string;
  client_email: string | null;
  status: ProjectStatus;
  total_revenue: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: string;
}

export interface Earning {
  id: string;
  project_id: string;
  user_id: string;
  gross_amount: number;
  take_home: number;
  savings: number;
  created_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string | null;
  project_id: string | null;
  amount: number;
  description: string;
  type: SavingsTransactionType;
  created_at: string;
  approved_by: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: ContactStatus;
}
