import { createClient } from "@supabase/supabase-js";
import { Database } from "./databaseTypes";
import { env } from "../config/env";

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
