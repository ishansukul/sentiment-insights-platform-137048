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

- `mentions`: social posts/mentions, fields should minimally include
    - `id`, `time`, `text`, `author`, `platform`, `sentiment` (positive/neutral/negative)
- `trends`: trends data, fields: `id`, `keyword`, `timestamp`, `score`, `platform`

## Security

- Supabase table RLS policies and keys must be set so that only authenticated users can read/write data relevant to their needs for privacy and compliance.

## Installation

Package required, handled by `npm install`:

```
@supabase/supabase-js
```
