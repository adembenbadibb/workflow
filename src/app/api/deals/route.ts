import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DealStatus, DEAL_STAGES } from "@/lib/types";

// GET /api/deals — list all deals with related data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  let query = supabase
    .from("deals")
    .select("*, closer:members!deals_closer_id_fkey(*), deal_workers(*, member:members(*))")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    const statuses = statusFilter.split(",");
    query = query.in("status", statuses);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deals = (data || []).map((d) => ({
    ...d,
    workers: d.deal_workers,
  }));

  return NextResponse.json(deals);
}

// POST /api/deals — create a new deal (starts as 'idea')
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      title: title.trim(),
      description: (description || "").trim(),
      status: "idea",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
