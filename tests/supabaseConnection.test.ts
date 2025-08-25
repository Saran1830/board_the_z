import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '../server/utils/supabase/client';

describe('Supabase Connection', () => {
  it('should establish a connection to Supabase', async () => {
  const client = createClient();
  // Try a simple query to check connection
  const { data, error } = await client.from('users').select('*').limit(1);
  if (error !== null) throw new Error(error?.message || 'Supabase query error');
  if (!Array.isArray(data)) throw new Error('Returned data is not an array');
  });
});
