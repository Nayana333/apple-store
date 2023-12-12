// const isLogin = async (req, res, next) => {
//     try {
//         if (req.session.user_id) {
//             // Set cache control headers to prevent caching
//             res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          
//         } else {
//             res.redirect('/');
//         }

//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// const isLogout = async (req, res, next) => {
//     try {
//         if (req.session.user_id) {
//             res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//             res.redirect('/home');
//             console.log(req.session.user_id);
//         }

//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// };



// module.exports = {
//     isLogin,
//     isLogout,
// };
const User = require('../models/userModel')



const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next();
        } else {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.redirect('/'); // Redirect to the login page
        }
    } catch (error) {
        console.log(error.message);
    }
};


const isLogout = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            next();
        } else {
            res.redirect('/home');
            return;
        }
    } catch (error) {
        console.log(error.message);
    }
};



const isUserBlocked = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id;
            const user = await User.findById(userId);
            
            if (user && user.is_blocked) {
                req.session.destroy((err) => {
                    if (err) {
                        console.log("1", err.message);
                    }
                });
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                return res.render('login', { err: "This account is temporarily blocked or unavailable!." })
            }
        }
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout,
    isUserBlocked
};

