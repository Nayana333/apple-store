const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // Set cache control headers to prevent caching
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          
        } else {
            res.redirect('/');
        }

        next();
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.redirect('/home');
            console.log(req.session.user_id);
        }

        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout,
};
