const express = require('express');
const userRoute = express();
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache');

const auth = require('../middleware/userAuth');
const userController = require('../controller/userController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');
const accountController = require('../controller/accountController');
const block = require('../middleware/blockedUser');
const couponController = require('../controller/couponController');



userRoute.use(nocache());

const config = require('../config/config');
userRoute.use(session({
    secret: config.secretId,
    resave: false,
    saveUninitialized: true
}));


userRoute.use(bodyParser.json());
userRoute.use(express.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

userRoute.use(logger('dev'));

// User Login

userRoute.get('/', userController.loadHome);
userRoute.get('/login', auth.isLogout, userController.loadLogin);
userRoute.post('/login', auth.isLogout, userController.verifyUser);
userRoute.get('/logout', userController.userLogout);

// forgot Password

userRoute.get('/forgotPassword', userController.loadForgotPassword);
userRoute.get('/emailverify', userController.forgotPassword);
userRoute.post('/emailverify', userController.forgotPasswordOtp);
userRoute.get('/otp', userController.otpVerification);
userRoute.post('/otp', userController.otpVerified);
userRoute.get('/resendotp', userController.resendOtp);
userRoute.post('/forgotPassword', userController.forgotPasswordVerify);


// Load Pages

userRoute.get('/home', userController.loadHome1);
userRoute.get('/shop', userController.loadShop);
userRoute.get('/productDetails', userController.loadProductDetails);

// cart

userRoute.get('/cart', auth.isLogin,block.check, cartController.loadCart);
userRoute.post('/cart', auth.isLogin, block.check, cartController.addToCart);
userRoute.get('/deleteCartProducts/:id', auth.isLogin, block.check, cartController.deleteCartProducts);
userRoute.get('/clearCart', auth.isLogin, block.check, cartController.clearCart);
userRoute.post('/updateCart', block.check, cartController.updateCart);
userRoute.get('/cartTotals', auth.isLogin, block.check, cartController.cartTotals);

// wishlist

userRoute.get('/wishlist', auth.isLogin, block.check, cartController.loadWishlist);
userRoute.get('/addToWishlist', auth.isLogin, block.check, cartController.addToWishlist);
userRoute.get('/deleteWishlistProducts', block.check, auth.isLogin, cartController.deleteWishlistProducts);
userRoute.post('/removeWishlist', auth.isLogin, block.check, cartController.removeWishlist);


// User Registration

userRoute.get('/register', auth.isLogout, userController.loadRegister);
userRoute.post('/register', userController.sendOtp);
userRoute.get('/verify', userController.otpVerify);
userRoute.post('/verify', userController.verified);
// userRoute.get('/resendverifyotp', userController.resendVerifyOtp);

userRoute.get('/signup', userController.loadSignup);


// checkout

userRoute.get('/checkout',block.check, userController.loadCheckout);
userRoute.get('/newAddress', block.check, userController.loadNewAddress);

userRoute.post('/addAddress', block.check, userController.addAddress);
userRoute.get('/editAddress', block.check, userController.loadEditAddress);
userRoute.post('/editAddress/:id', block.check, userController.editAddress);
userRoute.get('/removeAddress/:id', block.check, userController.removeAddress);


//Razorpay

userRoute.post('/placeOrder', block.check, orderController.placeOrder);
userRoute.post('/verifyPayment', block.check, orderController.verifyPayment);
userRoute.get('/orderConfirmed', block.check, orderController.loadConfirmOrder);
userRoute.get('/paymentFailed', block.check, orderController.loadPaymentFailed);


// search

userRoute.get('/searchProducts', userController.searchProducts);

//Account
userRoute.get('/account', auth.isLogin, block.check, accountController.loadAccount);
userRoute.post('/account',  block.check, accountController.loadAccount);

userRoute.get('/orders', auth.isLogin, block.check, accountController.loadOrders);
userRoute.get('/myAddress', auth.isLogin, block.check, accountController.loadMyAddress);
userRoute.get('/orderDetails', auth.isLogin, block.check, orderController.loadOrderDetails);
userRoute.post('/returnOrder/:orderId', auth.isLogin, block.check, orderController.returnOrder);
userRoute.post('/cancelOrder/:orderId', auth.isLogin, block.check, orderController.cancelOrder);


// Invoice

userRoute.get('/download-invoice/:orderId', auth.isLogin, block.check, orderController.orderInvoice)


// wallet

userRoute.get('/wallet', auth.isLogin, block.check, orderController.viewWallet);

// Coupons

userRoute.post('/apply-coupon',  block.check, couponController.applyCoupon);
userRoute.get('/remove-coupon',  block.check, couponController.removeCoupon)





























module.exports = userRoute;