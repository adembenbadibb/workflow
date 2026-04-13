import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// GET /api/savings — total + per-person breakdown (admin/founder)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'admin', 'founder');
  if (result instanceof NextResponse) return result;

  const { data: earnings, error } = await supabaseAdmin
    .from('earnings')
    .select('user_id, savings, users(id, full_name, email)');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate per person
  const perPerson: Record<string, { user_id: string; full_name: string; email: string; total_savings: number }> = {};
  let totalSavings = 0;

  for (const e of earnings || []) {
    const s = Number(e.savings);
    totalSavings += s;

    if (!perPerson[e.user_id]) {
      const user = e.users as unknown as { id: string; full_name: string; email: string };
      perPerson[e.user_id] = {
        user_id: e.user_id,
        full_name: user?.full_name || 'Unknown',
        email: user?.email || '',
        total_savings: 0,
      };
    }
    perPerson[e.user_id].total_savings += s;
  }

  // Add percentage
  const breakdown = Object.values(perPerson).map((p) => ({
    ...p,
    percentage: totalSavings > 0 ? Math.round((p.total_savings / totalSavings) * 10000) / 100 : 0,
  }));

  breakdown.sort((a, b) => b.total_savings - a.total_savings);

  return NextResponse.json({ total_savings: totalSavings, breakdown });
}
