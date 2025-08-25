import { createClient } from './client';

describe('Supabase Connection', () => {
    it('should create a client instance', () => {
        const client = createClient();
        if (!client) throw new Error('Supabase client is undefined');
        if (typeof client !== 'object') throw new Error('Supabase client is not an object');
    });

    it('should have a valid URL and key', () => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
        if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY');
        if (typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'string') throw new Error('SUPABASE_URL is not a string');
        if (typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'string') throw new Error('SUPABASE_ANON_KEY is not a string');
    });
});