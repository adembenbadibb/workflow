import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// POST /api/users/invite — invite a freelancer (admin only)
export async function POST(req: NextRequest) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const body = await req.json().catch(() => null);
  const { email, full_name } = body || {};

  if (!email || !full_name) {
    return NextResponse.json({ error: 'Email and full_name are required' }, { status: 400 });
  }

  const sanitizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', sanitizedEmail)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
  }

  // Create auth user (invites them via email)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    sanitizedEmail
  );

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 500 });
  }

  // Create profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email: sanitizedEmail,
      full_name: full_name.trim(),
      role: 'freelancer',
    })
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user: profile }, { status: 201 });
}
