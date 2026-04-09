import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DealStatus, DEAL_STAGES, validateStageTransition, getStageIndex } from "@/lib/types";

// GET /api/deals/[id] — get a single deal with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("deals")
    .select("*, closer:members!deals_closer_id_fkey(*), deal_workers(*, member:members(*))")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Get cash transactions for this deal
  const { data: cashTx } = await supabase
    .from("cash_transactions")
    .select("*")
    .eq("deal_id", id);

  // Get point entries for this deal
  const { data: pointEntries } = await supabase
    .from("point_ledger")
    .select("*")
    .eq("deal_id", id);

  return NextResponse.json({
    ...data,
    workers: data.deal_workers,
    cash_transactions: cashTx || [],
    point_entries: pointEntries || [],
  });
}

// PATCH /api/deals/[id] — update deal fields and/or advance stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, title, description, value, closer_id, workers } = body;

  // Fetch current deal
  const { data: deal, error: fetchErr } = await supabase
    .from("deals")
    .select("*, deal_workers(*)")
    .eq("id", id)
    .single();

  if (fetchErr || !deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  // Build update object
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (value !== undefined) updates.value = value;
  if (closer_id !== undefined) updates.closer_id = closer_id;

  // Handle workers update (if provided)
  if (workers !== undefined && Array.isArray(workers)) {
    // Delete existing workers
    await supabase.from("deal_workers").delete().eq("deal_id", id);

    // Insert new workers
    if (workers.length > 0) {
      const workerRows = workers.map((w: { member_id: string; share: number }) => ({
        deal_id: id,
        member_id: w.member_id,
        share: w.share || 1,
      }));
      const { error: wErr } = await supabase.from("deal_workers").insert(workerRows);
      if (wErr) {
        return NextResponse.json({ error: wErr.message }, { status: 500 });
      }
    }
  }

  // Handle status change
  if (status && status !== deal.status) {
    // Validate the transition
    const effectiveCloser = closer_id !== undefined ? closer_id : deal.closer_id;
    const effectiveValue = value !== undefined ? value : deal.value;
    const effectiveWorkers = workers !== undefined
      ? workers
      : deal.deal_workers;

    const validationError = validateStageTransition(
      { closer_id: effectiveCloser, value: effectiveValue },
      effectiveWorkers || [],
      status as DealStatus
    );

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    updates.status = status;

    // If moving to "done", process cash and points
    if (status === "done" && deal.status !== "done") {
      updates.completed_at = new Date().toISOString();

      const dealValue = Number(effectiveValue);
      const treasury = dealValue * 0.5;
      const workerPool = dealValue * 0.4;
      const closerPay = dealValue * 0.1;

      // Cash transactions
      const cashRows = [
        { deal_id: id, member_id: null, amount: treasury, bucket: "treasury" },
        { deal_id: id, member_id: effectiveCloser, amount: closerPay, bucket: "closer" },
      ];

      // Calculate worker shares
      const totalShares = (effectiveWorkers || []).reduce(
        (sum: number, w: { share: number }) => sum + (Number(w.share) || 1),
        0
      );

      for (const w of effectiveWorkers || []) {
        const workerShare = (Number(w.share) || 1) / totalShares;
        cashRows.push({
          deal_id: id,
          member_id: w.member_id,
          amount: Math.round(workerPool * workerShare * 100) / 100,
          bucket: "worker",
        });
      }

      const { error: cashErr } = await supabase.from("cash_transactions").insert(cashRows);
      if (cashErr) {
        return NextResponse.json({ error: cashErr.message }, { status: 500 });
      }

      // Point ledger entries
      const finderPoints = (dealValue / 100) * 10;
      const workerPointsPool = (dealValue / 100) * 40;

      const pointRows = [
        {
          member_id: effectiveCloser,
          deal_id: id,
          points: Math.round(finderPoints * 100) / 100,
          type: "finder",
        },
      ];

      for (const w of effectiveWorkers || []) {
        const workerShare = (Number(w.share) || 1) / totalShares;
        pointRows.push({
          member_id: w.member_id,
          deal_id: id,
          points: Math.round(workerPointsPool * workerShare * 100) / 100,
          type: "worker",
        });
      }

      const { error: ptErr } = await supabase.from("point_ledger").insert(pointRows);
      if (ptErr) {
        return NextResponse.json({ error: ptErr.message }, { status: 500 });
      }
    }
  }

  // Apply updates to deal
  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase
      .from("deals")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
  }

  // Fetch and return updated deal
  const { data: updated } = await supabase
    .from("deals")
    .select("*, closer:members!deals_closer_id_fkey(*), deal_workers(*, member:members(*))")
    .eq("id", id)
    .single();

  return NextResponse.json({
    ...updated,
    workers: updated?.deal_workers,
  });
}
