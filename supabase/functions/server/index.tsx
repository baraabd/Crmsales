import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d80cbf4a/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= Authentication Routes =============

// Sign up new user
app.post("/make-server-d80cbf4a/auth/signup", async (c) => {
  try {
    const { email, password, name, employeeId } = await c.req.json();

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        employeeId,
      },
      // Auto-confirm email since email server is not configured
      email_confirm: true,
    });

    if (authError) {
      console.log(`Error creating user: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store user details in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      name,
      employeeId,
      email,
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true,
      user: authData.user,
    });
  } catch (error) {
    console.log(`Error in signup endpoint: ${error}`);
    return c.json({ error: 'حدث خطأ أثناء التسجيل' }, 500);
  }
});

// Get user profile
app.get("/make-server-d80cbf4a/auth/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    // Get user details from KV
    const userDetails = await kv.get(`user:${user.id}`);

    return c.json({ 
      success: true,
      user: userDetails || user.user_metadata,
    });
  } catch (error) {
    console.log(`Error getting user: ${error}`);
    return c.json({ error: 'حدث خطأ' }, 500);
  }
});

// ============= Accounts Routes =============

// Get all accounts for user
app.get("/make-server-d80cbf4a/accounts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    // Get all accounts for this user
    const accounts = await kv.getByPrefix(`account:${user.id}:`);

    return c.json({ 
      success: true,
      accounts: accounts || [],
    });
  } catch (error) {
    console.log(`Error getting accounts: ${error}`);
    return c.json({ error: 'حدث خطأ' }, 500);
  }
});

// Create or update account
app.post("/make-server-d80cbf4a/accounts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const accountData = await c.req.json();
    const accountId = accountData.id || `${Date.now()}`;
    
    // Store account
    await kv.set(`account:${user.id}:${accountId}`, {
      ...accountData,
      id: accountId,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true,
      account: { ...accountData, id: accountId },
    });
  } catch (error) {
    console.log(`Error saving account: ${error}`);
    return c.json({ error: 'حدث خطأ في حفظ العميل' }, 500);
  }
});

// ============= Visits Routes =============

// Get all visits for user
app.get("/make-server-d80cbf4a/visits", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const visits = await kv.getByPrefix(`visit:${user.id}:`);

    return c.json({ 
      success: true,
      visits: visits || [],
    });
  } catch (error) {
    console.log(`Error getting visits: ${error}`);
    return c.json({ error: 'حدث خطأ' }, 500);
  }
});

// Create visit
app.post("/make-server-d80cbf4a/visits", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const visitData = await c.req.json();
    const visitId = visitData.id || `${Date.now()}`;
    
    await kv.set(`visit:${user.id}:${visitId}`, {
      ...visitData,
      id: visitId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true,
      visit: { ...visitData, id: visitId },
    });
  } catch (error) {
    console.log(`Error saving visit: ${error}`);
    return c.json({ error: 'حدث خطأ في حفظ الزيارة' }, 500);
  }
});

// ============= Sync Route =============

// Batch sync multiple items
app.post("/make-server-d80cbf4a/sync", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'غير مصرح' }, 401);
    }

    const { items } = await c.req.json();
    const results = [];

    for (const item of items) {
      try {
        let key = '';
        
        if (item.type === 'account') {
          key = `account:${user.id}:${item.data.id}`;
        } else if (item.type === 'visit') {
          key = `visit:${user.id}:${item.data.id}`;
        }

        if (key) {
          await kv.set(key, {
            ...item.data,
            userId: user.id,
            syncedAt: new Date().toISOString(),
          });
          results.push({ id: item.id, status: 'success' });
        }
      } catch (err) {
        console.log(`Error syncing item ${item.id}: ${err}`);
        results.push({ id: item.id, status: 'failed', error: String(err) });
      }
    }

    return c.json({ 
      success: true,
      results,
    });
  } catch (error) {
    console.log(`Error in sync endpoint: ${error}`);
    return c.json({ error: 'حدث خطأ في المزامنة' }, 500);
  }
});

Deno.serve(app.fetch);