export async function POST(request: Request) {
  const body = await request.json();
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('custom_components')
    .insert([body])
    .select()
    .single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
import { supabaseServerClient } from '../../../../../server/utils/supabase/serverClient';

export async function GET() {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('custom_components').select('*');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
