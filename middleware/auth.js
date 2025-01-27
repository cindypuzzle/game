const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth');
  }
  req.user = req.session.user;
  next();
};

module.exports = auth; 