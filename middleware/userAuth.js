const isLogin = async (req, res, next) => {
    try {
        console.log("isLogin");

        if (req.session.user_id) {
            next();
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            res.redirect('/home');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }

}

// const blockedUser = async (req, res, next) => {
//     try {
//         if (req.session.user_id) {
//             next();
//         } else {
//             res.render('403page');
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }



module.exports = {
    isLogin,
    isLogout,
    // blockedUser
}