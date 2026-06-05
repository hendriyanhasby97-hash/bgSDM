// Ganti dengan kredensial dari Supabase Project kamu
const SUPABASE_URL = 'https://rjdymyzeujfxzqwwhxbb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZHlteXpldWpmeHpxd3doeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjI2OTQsImV4cCI6MjA5NjE5ODY5NH0.dUvvgTawV0ZoOGy8VFJ91GkxNufqcITRBAiSoQ3q3tc'; 

// Inisialisasi client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
