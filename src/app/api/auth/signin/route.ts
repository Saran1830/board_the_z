import { createClient } from '../../../../../server/utils/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient();
  // Sign in user
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
  // Fetch user details from users table
  const userId = data.user?.id;
  let userDetails = null;
  if (userId) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
    userDetails = userData;
  }
  return NextResponse.json({ success: true, user: userDetails });
}
