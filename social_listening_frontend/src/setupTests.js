import '@testing-library/jest-dom';
// Add dummy Supabase reference for test environments
try { 
  require('@supabase/supabase-js'); 
} catch (e) {}
