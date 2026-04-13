import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// POST /api/projects/[id]/members — add member
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(req, 'admin', 'founder');
  if (result instanceof NextResponse) return result;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const { user_id, role_in_project } = body || {};

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('project_members')
    .insert({
      project_id: id,
      user_id,
      role_in_project: role_in_project?.trim() || 'member',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'User is already a member of this project' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: data }, { status: 201 });
}
