const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies['sb-token'];
    if (!token) {
      return res.status(401).json({ error: '请先登录' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '认证失败' });
  }
}; 