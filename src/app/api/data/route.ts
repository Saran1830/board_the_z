import { NextResponse } from 'next/server';
import { createClient } from '../../../../server/utils/supabase/client';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('user_profiles').select('*');
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
