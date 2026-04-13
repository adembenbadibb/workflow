import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// PATCH /api/users/[id]/role — promote freelancer to founder (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role !== 'freelancer') {
    return NextResponse.json({ error: 'Only freelancers can be promoted to founder' }, { status: 400 });
  }

  const { data: updated, error } = await supabaseAdmin
    .from('users')
    .update({ role: 'founder' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: updated });
}

// DELETE /api/users/[id] — remove a freelancer (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role === 'admin') {
    return NextResponse.json({ error: 'Cannot delete admin account' }, { status: 403 });
  }

  if (user.role === 'founder') {
    return NextResponse.json({ error: 'Cannot delete founder accounts' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.auth.admin.deleteUser(id);

  return NextResponse.json({ message: 'User removed' });
}
