import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Kept for an explicit future hosted integration. The active application uses /api.
// Importing this file without hosted configuration must not initiate a network request.
export const supabase = projectId && publicAnonKey
  ? createClient(`https://${projectId}.supabase.co`, publicAnonKey)
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      kv_store_d80cbf4a: {
        Row: {
          key: string;
          value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: any;
        };
        Update: {
          key?: string;
          value?: any;
        };
      };
    };
  };
}
