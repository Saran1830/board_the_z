-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  current_step integer,
  is_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User profile table (stores all profile data as JSON)
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  profile_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

