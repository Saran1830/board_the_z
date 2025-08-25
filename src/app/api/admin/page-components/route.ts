import { supabaseServerClient } from '../../../../../server/utils/supabase/serverClient';

export async function GET() {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('page_components').select('*');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: Request) {
  const { page, components } = await request.json();
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('page_components')
    .upsert([
      { page, components, updated_at: new Date().toISOString() }
    ], { onConflict: 'page' })
    .select()
    .single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
