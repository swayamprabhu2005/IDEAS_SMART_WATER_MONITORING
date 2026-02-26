const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://oqbzbvkbqzpcuivsahkx.supabase.co";
const supabaseKey = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnpidmticXpwY3VpdnNhaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDk2MTMsImV4cCI6MjA3NDE4NTYxM30";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;