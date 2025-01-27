const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 检查环境变量
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('错误: 缺少必要的 Supabase 环境变量');
    process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// 测试连接并导出
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

// 确保导出的是正确初始化的客户端实例
module.exports = supabase;