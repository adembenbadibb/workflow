import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';
import { processProjectEarnings } from '@/lib/earnings.service';

// POST /api/earnings/projects/[projectId] — admin enters earnings per person
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { projectId } = await params;
  const body = await req.json().catch(() => null);
  const earnings = body?.earnings;

  if (!Array.isArray(earnings) || earnings.length === 0) {
    return NextResponse.json(
      { error: 'earnings must be a non-empty array of {userId, amount}' },
      { status: 400 }
    );
  }

  for (const e of earnings) {
    if (!e.userId || typeof e.amount !== 'number' || e.amount <= 0) {
      return NextResponse.json(
        { error: 'Each earning must have userId and a positive amount' },
        { status: 400 }
      );
    }
  }

  // Verify project exists
  const { data: project, error: projError } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  if (projError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    const result = await processProjectEarnings(projectId, earnings);
    return NextResponse.json({ earnings: result }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process earnings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
