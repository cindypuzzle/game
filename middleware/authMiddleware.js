const { createSupabaseClient } = require('../config/supabase');

// 检查用户是否已登录
const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies['access_token'];
        if (!token) {
            return res.status(401).json({ error: '请先登录' });
        }

        const supabase = createSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.clearCookie('access_token');
            return res.status(401).json({ error: '未授权访问' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};

// 检查用户状态
const checkUser = async (req, res, next) => {
    try {
        const token = req.cookies['access_token'];
        if (!token) {
            res.locals.user = null;
            return next();
        }

        const supabase = createSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        res.locals.user = error ? null : user;
        next();
    } catch (error) {
        console.error('检查用户状态错误:', error);
        res.locals.user = null;
        next();
    }
};

module.exports = { requireAuth, checkUser }; 