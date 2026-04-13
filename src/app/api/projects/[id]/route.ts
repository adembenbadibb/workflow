import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/api-helpers';

// GET /api/projects/[id] — project detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const user = result.user;
  const { id } = await params;

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*, project_members(id, user_id, role_in_project, users(id, full_name, email)), earnings(id, user_id, gross_amount, take_home, savings, created_at, users(id, full_name))')
    .eq('id', id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Freelancers can only see projects they're in
  if (user.role === 'freelancer') {
    const isMember = project.project_members?.some(
      (m: { user_id: string }) => m.user_id === user.id
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  return NextResponse.json({ project });
}

// PATCH /api/projects/[id] — update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(req, 'admin', 'founder');
  if (result instanceof NextResponse) return result;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const { name, description, client_name, client_email, status } = body || {};

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (client_name !== undefined) updates.client_name = client_name.trim();
  if (client_email !== undefined) updates.client_email = client_email?.trim() || null;
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
