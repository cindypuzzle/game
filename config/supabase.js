const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        // 实现存储逻辑
        console.log('Getting storage item:', key);
        return null;
      },
      setItem: (key, value) => {
        // 实现存储逻辑
        console.log('Setting storage item:', key, value);
      },
      removeItem: (key) => {
        // 实现存储逻辑
        console.log('Removing storage item:', key);
      }
    }
  }
});

module.exports = supabase; 