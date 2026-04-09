export type DealStatus = "idea" | "talked" | "dealed" | "convinced" | "done";

// Equity split: 30% base (equal for all), 70% performance (earned from deals)
export const EQUITY_BASE_PCT = 30;
export const EQUITY_PERFORMANCE_PCT = 70;

export const DEAL_STAGES: DealStatus[] = [
  "idea",
  "talked",
  "dealed",
  "convinced",
  "done",
];

export const STAGE_COLORS: Record<DealStatus, string> = {
  idea: "bg-gray-100 text-gray-700 border-gray-300",
  talked: "bg-blue-100 text-blue-700 border-blue-300",
  dealed: "bg-yellow-100 text-yellow-700 border-yellow-300",
  convinced: "bg-orange-100 text-orange-700 border-orange-300",
  done: "bg-green-100 text-green-700 border-green-300",
};

export const STAGE_KANBAN_COLORS: Record<DealStatus, string> = {
  idea: "border-t-gray-400",
  talked: "border-t-blue-400",
  dealed: "border-t-yellow-400",
  convinced: "border-t-orange-400",
  done: "border-t-green-400",
};

export const STAGE_LABELS: Record<DealStatus, string> = {
  idea: "Idea",
  talked: "Talked",
  dealed: "Dealed",
  convinced: "Convinced",
  done: "Done",
};

export interface Member {
  id: string;
  name: string;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  value: number | null;
  closer_id: string | null;
  status: DealStatus;
  created_at: string;
  completed_at: string | null;
  closer?: Member;
  workers?: DealWorker[];
}

export interface DealWorker {
  id: string;
  deal_id: string;
  member_id: string;
  share: number;
  member?: Member;
}

export interface PointLedgerEntry {
  id: string;
  member_id: string;
  deal_id: string | null;
  points: number;
  type: "finder" | "worker" | "decay";
  created_at: string;
}

export interface CashTransaction {
  id: string;
  deal_id: string;
  member_id: string | null;
  amount: number;
  bucket: "treasury" | "worker" | "closer";
  created_at: string;
}

export interface MemberEquity {
  member_id: string;
  name: string;
  total_points: number;
  equity_pct: number;
}

export interface MemberStats extends MemberEquity {
  total_cash: number;
  last_active: string | null;
  is_decaying: boolean;
  days_inactive: number;
}

export interface DashboardData {
  members: MemberStats[];
  treasury: number;
  totalRevenue: number;
  totalPaidOut: number;
  pipelineCounts: Record<DealStatus, number>;
  recentDeals: Deal[];
}

export function formatDZD(amount: number): string {
  return new Intl.NumberFormat("en-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " DZD";
}

export function getStageIndex(status: DealStatus): number {
  return DEAL_STAGES.indexOf(status);
}

export function validateStageTransition(
  deal: { closer_id: string | null; value: number | null },
  workers: { member_id: string; share: number }[],
  targetStatus: DealStatus
): string | null {
  const idx = getStageIndex(targetStatus);

  if (idx >= 1 && !deal.closer_id) {
    return "A closer is required before moving to " + STAGE_LABELS[targetStatus];
  }

  if (idx >= 3 && workers.length === 0) {
    return "At least one worker is required before moving to " + STAGE_LABELS[targetStatus];
  }

  if (idx >= 3 && (!deal.value || deal.value <= 0)) {
    return "A deal value is required before moving to " + STAGE_LABELS[targetStatus];
  }

  return null;
}
