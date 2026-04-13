import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// GET /api/savings/me — my total savings (founder/freelancer)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'founder', 'freelancer');
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin
    .from('earnings')
    .select('savings')
    .eq('user_id', result.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalSavings = data?.reduce((sum, e) => sum + Number(e.savings), 0) || 0;

  return NextResponse.json({ total_savings: totalSavings });
}
