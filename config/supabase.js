const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// 简化的连接测试
(async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Supabase 连接测试失败:', error);
        } else {
            console.log('Supabase 连接测试成功');
        }
    } catch (err) {
        console.error('Supabase 连接异常:', err);
    }
})();

module.exports = { supabase };