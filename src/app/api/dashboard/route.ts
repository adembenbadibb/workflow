import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DealStatus } from "@/lib/types";

// GET /api/dashboard — aggregated dashboard data
export async function GET() {
  // 1. Member equity and stats
  const { data: equity } = await supabase.from("member_equity").select("*");

  // 2. Cash transactions
  const { data: cashData } = await supabase.from("cash_transactions").select("*");

  let treasury = 0;
  let totalPaidOut = 0;
  let totalRevenue = 0;
  const cashByMember: Record<string, number> = {};

  for (const tx of cashData || []) {
    const amount = Number(tx.amount);
    if (tx.bucket === "treasury") {
      treasury += amount;
    } else {
      totalPaidOut += amount;
      if (tx.member_id) {
        cashByMember[tx.member_id] = (cashByMember[tx.member_id] || 0) + amount;
      }
    }
  }
  totalRevenue = treasury + totalPaidOut;

  // 3. Pipeline counts
  const { data: deals } = await supabase.from("deals").select("id, status");
  const pipelineCounts: Record<DealStatus, number> = {
    idea: 0,
    talked: 0,
    dealed: 0,
    convinced: 0,
    done: 0,
  };
  for (const d of deals || []) {
    pipelineCounts[d.status as DealStatus]++;
  }

  // 4. Recent completed deals
  const { data: recentDeals } = await supabase
    .from("deals")
    .select("*, closer:members!deals_closer_id_fkey(*)")
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(5);

  // 5. Activity per member
  const { data: activities } = await supabase
    .from("point_ledger")
    .select("member_id, created_at")
    .in("type", ["finder", "worker"])
    .order("created_at", { ascending: false });

  const lastActive: Record<string, string> = {};
  for (const a of activities || []) {
    if (!lastActive[a.member_id]) {
      lastActive[a.member_id] = a.created_at;
    }
  }

  const now = new Date();
  const members = (equity || []).map((m) => {
    const lastDate = lastActive[m.member_id];
    const daysInactive = lastDate
      ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      member_id: m.member_id,
      name: m.name,
      total_points: Number(m.total_points),
      equity_pct: Number(m.equity_pct),
      total_cash: cashByMember[m.member_id] || 0,
      last_active: lastDate || null,
      is_decaying: lastDate ? daysInactive >= 90 : false,
      days_inactive: daysInactive,
    };
  });

  return NextResponse.json({
    members,
    treasury: Math.round(treasury * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalPaidOut: Math.round(totalPaidOut * 100) / 100,
    pipelineCounts,
    recentDeals: recentDeals || [],
  });
}
