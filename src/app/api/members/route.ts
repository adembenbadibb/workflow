import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/members — list all members with equity and stats
export async function GET() {
  const { data: equity, error: eqError } = await supabase
    .from("member_equity")
    .select("*");

  if (eqError) {
    return NextResponse.json({ error: eqError.message }, { status: 500 });
  }

  // Get cash earned per member
  const { data: cashData } = await supabase
    .from("cash_transactions")
    .select("member_id, amount");

  const cashByMember: Record<string, number> = {};
  for (const tx of cashData || []) {
    if (tx.member_id) {
      cashByMember[tx.member_id] = (cashByMember[tx.member_id] || 0) + Number(tx.amount);
    }
  }

  // Get last activity per member (last point_ledger entry that's not decay)
  const { data: activities } = await supabase
    .from("point_ledger")
    .select("member_id, created_at, type")
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
      : -1; // -1 means never active

    return {
      member_id: m.member_id,
      name: m.name,
      total_points: Number(m.total_points),
      equity_pct: Number(m.equity_pct),
      total_cash: cashByMember[m.member_id] || 0,
      last_active: lastDate || null,
      is_decaying: daysInactive >= 90,
      days_inactive: daysInactive === -1 ? 0 : daysInactive,
    };
  });

  return NextResponse.json(members);
}
