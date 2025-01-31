const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 检查环境变量
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('错误: 缺少必要的 Supabase 环境变量');
    process.exit(1);
}

const createSupabaseClient = (access_token = null) => {
    const options = {
        auth: {
            autoRefreshToken: true,
            persistSession: false,
            detectSessionInUrl: true
        },
        global: {
            headers: access_token ? {
                Authorization: `Bearer ${access_token}`
            } : {}
        }
    };

    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        options
    );
};

// 测试连接并导出
(async () => {
    try {
        const { data, error } = await createSupabaseClient().auth.getSession();
        if (error) {
            console.error('Supabase 连接测试失败:', error);
        } else {
            console.log('Supabase 连接测试成功');
        }
    } catch (err) {
        console.error('Supabase 连接异常:', err);
    }
})();

// 确保导出的是正确初始化的客户端实例
module.exports = { createSupabaseClient };