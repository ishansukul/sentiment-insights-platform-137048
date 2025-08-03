# Supabase Integration for Social Listening Tool Frontend

This React frontend connects to Supabase for authentication, real-time updates, and analytics data using the official Supabase JS client (`@supabase/supabase-js`).

## Environment Variables

Configure the following environment variables (add these lines into your `.env` file in the root of `social_listening_frontend`):

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-public-api-key
REACT_APP_SITE_URL=http://localhost:3000
```

Where:
- `REACT_APP_SUPABASE_URL`: Your Supabase project's URL (from project settings)
- `REACT_APP_SUPABASE_KEY`: Your Supabase public ANON API key
- `REACT_APP_SITE_URL`: The frontend's site URL, used as a redirect for auth flows

> Both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` are required by `createClient`.
> The `REACT_APP_SITE_URL` is used for the **emailRedirectTo** option on sign-up.

## JS Client Usage

- The frontend creates a singleton Supabase client (`createClient`) using the environment variables.
- Supabase is required for:
    - **User authentication:** sign up/in and session management
    - **Fetching mentions:** `mentions` table queried from frontend
    - **Trends analytics:** `trends` table queried for trends chart
    - **Real-time updates:** via the Supabase realtime channel and subscription system

## Required Supabase Tables

**Actual Schema Deployed (2024-06):**

- `mentions` table:
    - `id` (uuid, PRIMARY KEY, not null)
    - `time` (timestamptz, not null)
    - `text` (text, not null)
    - `author` (text, not null)
    - `platform` (text, not null)
    - `sentiment` (text, not null; values: "positive" | "neutral" | "negative")

- `trends` table:
    - `id` (uuid, PRIMARY KEY, not null)
    - `keyword` (text, not null)
    - `timestamp` (timestamptz, not null)
    - `score` (float8, not null)
    - `platform` (text, not null)

## Security

Row Level Security (RLS) and policies:

- Both `mentions` and `trends` tables have RLS enabled.
- Only authenticated users ("authenticated" role) may SELECT from either table.
- Only authenticated users may INSERT into either table (for feature extensibility – e.g., user feedback export).
- Extend with additional policies for UPDATE or DELETE as workflow dictates (currently read/insert only).

Supabase users:
- Only frontend authenticated users (with Supabase Auth session) can access analytics and social mentions.

## Installation

Package required, handled by `npm install`:

```
@supabase/supabase-js
```

## Frontend Integration

- Environment variables (in `.env` in `social_listening_frontend` root):
  ```
  REACT_APP_SUPABASE_URL=your-supabase-project-url
  REACT_APP_SUPABASE_KEY=your-supabase-anon-public-api-key
  REACT_APP_SITE_URL=http://localhost:3000
  ```
  > `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` auto-inject from the environment into Supabase JS client. You must set these for build and runtime.
  > `REACT_APP_SITE_URL` is required for redirect URLs in Supabase auth flows/email confirmations in multi-environment deploys.

- Use a utility like `getURL()` in frontend code (see below) to properly handle redirects in signUp/signIn.
- Example:
  ```js
  // utils/getURL.js
  export const getURL = () => {
    let url = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
    if (!url.startsWith('http')) url = 'https://' + url;
    if (!url.endsWith('/')) url += '/';
    return url;
  }
  ```

- When calling Supabase Auth (signup, reset-password, magic link, OAuth), always pass `emailRedirectTo: getURL() + 'auth/callback'`.

- In Supabase dashboard:
    - Go to **Authentication > URL Configuration**.
    - Set the `Site URL` to match your deployed frontend.
    - Add allowed redirect URLs for both local and production (e.g., `http://localhost:3000/**` and `https://yourapp.com/**`).

- Table queries: see the frontend source code (e.g., `App.js`) for `.from('mentions')` and `.from('trends')`.

- The frontend will only function if the variables above are set correctly and RLS/Policies are deployed as documented.

