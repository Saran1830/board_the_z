import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const step = searchParams.get('step');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  // Get user profile data for the given step
  if (step) {
    // Return user profile_data JSON for any step
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (userError || !userRow?.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { data: profileRow, error: profileError } = await supabase
      .from('user_profiles')
      .select('profile_data')
      .eq('user_id', userRow.id)
      .single();
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    return NextResponse.json(profileRow?.profile_data ?? {});
  }
  // Default: return user basic info
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
