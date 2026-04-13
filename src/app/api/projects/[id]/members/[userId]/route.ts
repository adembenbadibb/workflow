import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// DELETE /api/projects/[id]/members/[userId] — remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const result = await requireRole(req, 'admin', 'founder');
  if (result instanceof NextResponse) return result;
  const { id, userId } = await params;

  const { error } = await supabaseAdmin
    .from('project_members')
    .delete()
    .eq('project_id', id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Member removed' });
}
