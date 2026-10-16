import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const configuredKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** True only when the operator supplied a project-specific public client configuration. */
export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

// The browser twin can start without a seller-owned Supabase project. Legacy account
// routes remain inert until a buyer supplies their own URL and publishable/anon key.
const clientUrl = configuredUrl || "http://127.0.0.1:54321";
const clientKey = configuredKey || "demo-placeholder-key-not-a-real-secret";

export const supabase = createClient<Database>(clientUrl, clientKey);
