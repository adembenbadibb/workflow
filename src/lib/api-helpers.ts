import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { User, UserRole } from '@/lib/types';

export async function getAuthUser(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !authUser) return null;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) return null;

    return profile as User;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}

export async function requireAuth(req: NextRequest): Promise<{ user: User } | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return { user };
}

export async function requireRole(req: NextRequest, ...roles: UserRole[]): Promise<{ user: User } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!roles.includes(result.user.role)) return forbidden();
  return result;
}
