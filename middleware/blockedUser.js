const User = require('../model/userModel')


const check = async (req, res, next) => {
    if (req.session.user_id) {
        const userId = req.session.user_id;
        try {
            const user = await User.findById(userId);
            if (user && !user.isActive) {
                req.session.user_id = null;
                req.session.destroy((err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.render('403page');
                });
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    } else {
        next();
    }
};





// const check = (req, res, next) => {
//     console.log("hellooo");
//     if (req.session.user_id) {
//         const user = req.session.user_id;
//         if (!user.isActive) {
//             console.log("falseeee");
//             req.session.user_id=null
//             req.session.destroy((err) => {
//                 if (err) {
//                     console.log(err);
//                 }
               
//                 res.render('403page');
//             });
//         } else {
//             console.log("elseeeee");
//             next();
//         }
//     } else {
//         next();
//     }
// };


module.exports = {
    check
}


