// Legacy hosted adapter: opt-in configuration only, never a bundled project/key.
// The application uses the local /api backend by default.
export const projectId = import.meta.env?.VITE_SUPABASE_PROJECT_ID?.trim() || '';
export const publicAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || '';
