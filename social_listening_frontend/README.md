# Social Listening Tool Frontend

A modern, minimalistic React web app for real-time social listening and sentiment analytics.

## Features

- **Keyword/Brand Search**: Query brands or topics across social platforms
- **Results Dashboard**: Visualize sentiment distribution & key trends
- **Trends Visualization**: Minimal SVG line charts of sentiment over time
- **Platform Filtering**: Select or deselect social/data platforms (e.g., Twitter, Reddit, YouTube, Blogs)
- **Real-Time Data**: Updates in-dashboard when new matching mentions are found
- **User Authentication**: Secure login/signup (via Supabase Auth)
- **Export Reports**: Export mention tables as CSV
- **Dark Minimal UI**: Stylish, mobile-friendly, and on-brand with minimal CSS

## Getting Started

1. **Install dependencies** (from the social_listening_frontend folder):

    ```bash
    npm install
    ```

2. **Configure environment variables**:

    - Create a `.env` file (not committed to version control) and add:

      ```
      REACT_APP_SUPABASE_URL=your-supabase-url-here
      REACT_APP_SUPABASE_KEY=your-supabase-key-here
      REACT_APP_SITE_URL=http://localhost:3000
      ```

    - The provided keys are used for Supabase JS client initialization in the frontend.
    - Make sure your Supabase project has the proper tables: `mentions`, `trends` with appropriate structure (see backend/API).

3. **Run the App**:

    ```bash
    npm start
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Overview

- `src/App.js`: Main app scaffolding and all feature UI/components
- `src/App.css`: Theme, layout, and dashboard styling
- `src/index.js`: App entrypoint

## Customization

- To adjust dark/light theme or colors, see CSS variables at the top of `src/App.css`.
- For further API/backend integration, edit API calls in `fetchResults` in `src/App.js`.

## Deployment

Standard Create React App deployment steps apply.

