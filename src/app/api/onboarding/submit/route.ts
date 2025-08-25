import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body missing or invalid' }, { status: 400 });
    }
    const { step, data } = body;
    if (!step) {
      return NextResponse.json({ error: 'Missing step in request body', received: body }, { status: 400 });
    }
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Missing data in request body', received: body }, { status: 400 });
    }
    const email = data.email;
    if (!email) {
      return NextResponse.json({ error: 'Missing email in data', received: data }, { status: 400 });
    }
    // Ensure user exists first
    const stepNum = Number(step);
    if (isNaN(stepNum)) {
      return NextResponse.json({ error: 'Step is not a valid number', received: step }, { status: 400 });
    }
    let { data: userExists, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (findError || !userExists) {
      if (!email) {
        return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 });
      }
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          current_step: stepNum,
          is_completed: stepNum >= 3,
          updated_at: new Date().toISOString(),
        });
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      // After insert, fetch user again
      ({ data: userExists, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single());
      if (findError || !userExists) {
        return NextResponse.json({ error: 'User not found after insert' }, { status: 404 });
      }
    }

    // Update user's onboarding step and completion status
    const updateObj: { current_step: number; updated_at: string; is_completed?: boolean } = {
      current_step: stepNum,
      updated_at: new Date().toISOString(),
    };
    if (stepNum >= 3) {
      updateObj.is_completed = true;
    }

    // Save all profile data as JSONB for step 2 and 3
    if (stepNum === 2 || stepNum === 3) {
      // Prepare profile_data JSON (exclude email)
      const newProfileData: Record<string, unknown> = {};
      for (const key in data) {
        if (key !== 'email') newProfileData[key] = data[key];
      }
      // Upsert profile_data JSONB, merging with existing
      const { data: existingProfileRow, error: profileFindError } = await supabase
        .from('user_profiles')
        .select('id, profile_data')
        .eq('user_id', userExists.id)
        .single();
      if (profileFindError) {
        return NextResponse.json({ error: profileFindError.message }, { status: 500 });
      }
      if (existingProfileRow) {
        // Merge new data with existing profile_data
        const mergedProfileData = { ...(existingProfileRow.profile_data ?? {}), ...newProfileData };
        const { error: updateProfileError } = await supabase
          .from('user_profiles')
          .update({ profile_data: mergedProfileData })
          .eq('user_id', userExists.id);
        if (updateProfileError) {
          return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
        }
      } else {
        const { error: insertProfileError } = await supabase
          .from('user_profiles')
          .insert({ user_id: userExists.id, profile_data: newProfileData });
        if (insertProfileError) {
          return NextResponse.json({ error: insertProfileError.message }, { status: 500 });
        }
      }
    }

    const { error } = await supabase
      .from('users')
      .update(updateObj)
      .eq('email', email);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
