const User = require('../model/userModel');

const checkCart = async(req,res,next) => {
    try {

        const userId = req.session.user_id;
        const user = await User.findById(userId)

        if(user.cart.length === 0){
            res.redirect('/cart');
        }
        else {
            next()
        }
        
    } catch (error) {
        
    }
}

module.exports ={
    checkCart
}