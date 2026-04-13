import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/api-helpers';

// GET /api/projects — list projects (filtered by role)
export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const user = result.user;

  if (user.role === 'admin' || user.role === 'founder') {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, project_members(user_id, role_in_project, users(id, full_name, email))')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  }

  // Freelancer: only their projects
  const { data: memberOf, error: memberError } = await supabaseAdmin
    .from('project_members')
    .select('project_id')
    .eq('user_id', user.id);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const projectIds = memberOf?.map((m) => m.project_id) || [];

  if (projectIds.length === 0) {
    return NextResponse.json({ projects: [] });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, project_members(user_id, role_in_project, users(id, full_name, email))')
    .in('id', projectIds)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

// POST /api/projects — create project (admin or founder)
export async function POST(req: NextRequest) {
  const result = await requireRole(req, 'admin', 'founder');
  if (result instanceof NextResponse) return result;

  const body = await req.json().catch(() => null);
  const { name, description, client_name, client_email } = body || {};

  if (!name || !client_name) {
    return NextResponse.json({ error: 'name and client_name are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      client_name: client_name.trim(),
      client_email: client_email?.trim() || null,
      status: 'pending',
      total_revenue: 0,
      created_by: result.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
