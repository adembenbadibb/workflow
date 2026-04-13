import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/api-helpers';

// POST /api/contact — public, submit contact form
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, message } = body || {};

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({
      name: name.trim().slice(0, 200),
      email: email.toLowerCase().trim().slice(0, 320),
      message: message.trim().slice(0, 5000),
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Message sent successfully', id: data.id }, { status: 201 });
}

// GET /api/contact — list submissions (admin only)
export async function GET(req: NextRequest) {
  const result = await requireRole(req, 'admin');
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data });
}
