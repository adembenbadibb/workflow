import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/decay — run decay check for inactive members
// Burns 5% of points for members with no activity in 90+ days
export async function POST() {
  // Get all members
  const { data: members } = await supabase.from("members").select("id, name");

  // Get last activity per member
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

  // Get current point totals
  const { data: equity } = await supabase.from("member_equity").select("*");
  const pointsByMember: Record<string, number> = {};
  for (const e of equity || []) {
    pointsByMember[e.member_id] = Number(e.total_points);
  }

  const now = new Date();
  const decayEntries: { member_id: string; points: number; type: string }[] = [];
  const decayedMembers: string[] = [];

  for (const m of members || []) {
    const lastDate = lastActive[m.id];
    const totalPoints = pointsByMember[m.id] || 0;

    // Skip if member has no points to decay
    if (totalPoints <= 0) continue;

    const daysInactive = lastDate
      ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : -1;

    // Decay if inactive for 90+ days (or never active but has points somehow)
    if (daysInactive >= 90 || (daysInactive === -1 && totalPoints > 0)) {
      const decay = Math.round(totalPoints * 0.05 * 100) / 100;
      if (decay > 0) {
        decayEntries.push({
          member_id: m.id,
          points: -decay,
          type: "decay",
        });
        decayedMembers.push(m.name);
      }
    }
  }

  if (decayEntries.length > 0) {
    const { error } = await supabase.from("point_ledger").insert(decayEntries);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: decayedMembers.length > 0
      ? `Applied 5% decay to: ${decayedMembers.join(", ")}`
      : "No members need decay — everyone is active or has 0 points",
    decayed: decayedMembers,
  });
}
