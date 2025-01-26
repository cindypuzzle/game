const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 打印配置信息（不要在生产环境中这样做）
console.log('Supabase 配置:', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length
});

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 测试连接
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase 认证状态变更:', event);
  if (session) {
    console.log('会话已建立');
  } else {
    console.log('无活动会话');
  }
});

// 立即测试连接
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

module.exports = supabase; 