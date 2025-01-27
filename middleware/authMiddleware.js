const supabase = require('../config/supabase');

// 检查用户是否已登录
const requireAuth = async (req, res, next) => {
    try {
        // 检查会话
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('验证错误:', error);
            return res.status(401).json({ error: '未授权访问' });
        }

        if (!session) {
            return res.status(401).json({ error: '请先登录' });
        }

        // 将用户信息添加到请求对象
        req.user = session.user;
        next();
    } catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};

// 检查用户状态
const checkUser = async (req, res, next) => {
    try {
        // 检查会话
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('检查用户状态错误:', error);
            res.locals.user = null;
        } else {
            res.locals.user = session?.user || null;
        }

        next();
    } catch (error) {
        console.error('检查用户状态错误:', error);
        res.locals.user = null;
        next();
    }
};

module.exports = { requireAuth, checkUser }; 