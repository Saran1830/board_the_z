
import dotenv from 'dotenv';
dotenv.config();
import { supabaseServerClient } from '../server/utils/supabase/serverClient';

describe('Supabase Auth', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  it('should connect to Supabase', async () => {
    const supabase = supabaseServerClient();
    if (typeof supabase !== 'object') throw new Error('Supabase client is not an object');
  });

  it('should sign up a new user', async () => {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (error !== null) throw new Error(error.message);
    if (!data.user || data.user.email !== testEmail) throw new Error('User email mismatch');
  });

  it('should sign in with valid credentials', async () => {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
    if (error !== null) throw new Error(error.message);
    if (!data.session || typeof data.session.access_token !== 'string') throw new Error('Missing access token');
  });

  it('should fail to sign in with invalid credentials', async () => {
    const supabase = supabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: testEmail, password: 'WrongPassword!' });
    if (error === null) throw new Error('Expected error for invalid credentials');
  });
});
