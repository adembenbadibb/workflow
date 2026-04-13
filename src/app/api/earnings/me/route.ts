import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// GET /api/earnings/me — my earnings (founder/freelancer)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'founder', 'freelancer');
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin
    .from('earnings')
    .select('*, projects(id, name)')
    .eq('user_id', result.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totals = data?.reduce(
    (acc, e) => ({
      gross: acc.gross + Number(e.gross_amount),
      takeHome: acc.takeHome + Number(e.take_home),
      savings: acc.savings + Number(e.savings),
    }),
    { gross: 0, takeHome: 0, savings: 0 }
  ) || { gross: 0, takeHome: 0, savings: 0 };

  return NextResponse.json({ earnings: data, totals });
}
