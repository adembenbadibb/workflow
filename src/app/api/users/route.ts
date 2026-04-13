import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// GET /api/users — list all users (admin only)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}
