import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// GET /api/savings/transactions — savings fund transactions (admin)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin
    .from('savings_fund')
    .select('*, users(id, full_name), projects(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transactions: data });
}
