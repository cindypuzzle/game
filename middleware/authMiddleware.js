const { supabase } = require('../config/supabase');

const requireAuth = async (req, res, next) => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (user) {
                next();
            } else {
                res.redirect('/auth');
            }
        } catch (err) {
            console.log(err);
            res.redirect('/auth');
        }
    } else {
        res.redirect('/auth');
    }
};

const checkUser = async (req, res, next) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (user) {
                res.locals.user = user;
            } else {
                res.locals.user = null;
            }
        } catch (err) {
            console.log(err);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = { requireAuth, checkUser }; 