
import dotenv from 'dotenv';
dotenv.config();
import { expect } from 'chai';
import { supabaseServerClient } from '../server/utils/supabase/serverClient';

describe('User Auth and Data API', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let userId: string | undefined;
  let profileId: string | undefined;

  it('should sign up a new user and insert into users table', async () => {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (error) throw new Error(error.message);
    userId = data.user?.id;
    expect(userId).to.be.a('string');
    // Manually insert into users table after sign up (no password field)
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: testEmail,
      current_step: 1,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (insertError) throw new Error(insertError.message);
    const { data: userRecord } = await supabase.from('users').select('*').eq('id', userId).single();
    expect(userRecord).to.include({ email: testEmail, current_step: 1, is_completed: false });
    expect(userRecord.created_at).to.be.a('string');
    expect(userRecord.updated_at).to.be.a('string');
  });

  it('should sign in and return user details', async () => {
  const supabase = supabaseServerClient();
  if (!userId) throw new Error('User ID is missing from sign up test');
  const { data, error } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
  if (error) throw new Error(error.message);
  const signedInUserId = data.user?.id;
  expect(signedInUserId).to.equal(userId);
  const { data: userRecord } = await supabase.from('users').select('*').eq('id', signedInUserId).single();
  if (!userRecord) throw new Error('User record not found in users table after sign in');
  expect(userRecord).to.include({ email: testEmail });
  });


  it('should fail to sign up with duplicate email', async () => {
    const supabase = supabaseServerClient();
    // Try to sign up again with the same email
    const { error } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (!error) throw new Error('Expected error for duplicate email signup');
  });

  it('should fail to sign up with invalid email', async () => {
    const supabase = supabaseServerClient();
    const { error } = await supabase.auth.signUp({ email: 'invalid-email', password: testPassword });
    if (!error) throw new Error('Expected error for invalid email signup');
  });

  it('should update user profile in users table', async () => {
    const supabase = supabaseServerClient();
    if (!userId) throw new Error('User ID is missing from sign up test');
    const { error } = await supabase.from('users').update({ current_step: 2, is_completed: true }).eq('id', userId);
    if (error) throw new Error(error.message);
    const { data: updatedUser } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!updatedUser) throw new Error('Updated user not found');
    if (updatedUser.current_step !== 2 || updatedUser.is_completed !== true) throw new Error('User profile not updated correctly');
  });
});
