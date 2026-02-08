import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Create Supabase client for frontend
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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
