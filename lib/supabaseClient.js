import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show up clearly in the browser console instead of a cryptic crash.
  console.warn(
    "Supabase environment variables are missing. Check .env.local (local dev) " +
      "or your Vercel project's Environment Variables (production)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const IMAGES_BUCKET = "images";
