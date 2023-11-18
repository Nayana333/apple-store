

const isLogin = async (req, res, next) => {
    try {
        
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        if (req.session.admin_id) {
            console.log( req.session.admin_id);
            next();
        } else {
          
            res.redirect('/admin'); 
        }
    } catch (error) {
        console.log( error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
       
        if (req.session.admin_id) {
           
            req.session.admin_id = null;
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.redirect('/admin'); 
        } else {
            
            next();
        }
    } catch (error) {
        console.log( error.message);
    }
};


module.exports = {
    isLogin,
    isLogout
};
