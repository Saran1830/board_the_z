import { createClient } from '../../../../../server/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient();
  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message && error.message.toLowerCase().includes('already registered')) {
      return NextResponse.json({ success: false, error: 'Email already exists. Please sign in.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  // Insert user record in users table with current_step = 1
  const userId = data.user?.id;
  const now = new Date().toISOString();
  if (userId) {
    await supabase.from('users').insert({
      id: userId,
      email,
      password,
      current_step: 1,
      is_completed: false,
      created_at: now,
      updated_at: now
    });
  }
  return NextResponse.json({ success: true });
}
