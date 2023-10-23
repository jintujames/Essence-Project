const express = require('express');
const adminRoute = express();
const bodyParser = require('body-parser');
const nocache = require('nocache');
const session = require('express-session');
const logger = require('morgan');
const config = require('../config/config');
const upload = require('../middleware/multer');
const uploadBanner = require('../middleware/banner');

adminRoute.use(session({
    secret: config.secretId,
    resave: false,
    saveUninitialized: true
}))

const adminController = require('../controller/adminController');
const adminUserController = require('../controller/adminUserController');
const categoryController = require('../controller/categoryController');
const productsController = require('../controller/productsController');
const orderController = require('../controller/orderController');


const auth = require('../middleware/adminAuth');

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.use(logger('dev'));
adminRoute.use(nocache());
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));


// Login

adminRoute.get('/', auth.isLogout, adminController.loadLogin);
adminRoute.post('/adminLogin', adminController.verifyAdmin);
adminRoute.get('/logout', auth.isLogin, adminController.logout);

// DashBoard

adminRoute.get('/dashBoard', auth.isLogin, adminController.loadDashboard);
adminRoute.post('/dashBoard', adminController.verifyAdmin);
adminRoute.get('/loadChart', adminController.loadChart);
adminRoute.get('/report', adminController.loadReport);


// Users

adminRoute.get('/users', auth.isLogin, adminUserController.loadUsers);
adminRoute.get('/toggle', auth.isLogin, adminUserController.toggleController);

// Category

adminRoute.get('/category', auth.isLogin, categoryController.loadCategory);
adminRoute.post('/category', categoryController.addCategory);
adminRoute.get('/editCategory', auth.isLogin, categoryController.loadEditCategory);
adminRoute.post('/editCategory', categoryController.updateCategory);
adminRoute.post('/deleteCategory', auth.isLogin, categoryController.deleteCategory);

// Products

adminRoute.get('/products', auth.isLogin, productsController.loadProducts);
adminRoute.get('/addProducts', auth.isLogin, productsController.loadAddProducts);
adminRoute.post('/addProducts', upload.array('image', 4), productsController.addProducts);
adminRoute.get('/editProducts', auth.isLogin, productsController.loadEditProducts);
adminRoute.post('/editProducts', upload.array('image', 4), productsController.updateProducts);
adminRoute.post('/deleteProducts', productsController.deleteProducts);
adminRoute.post('/removeImage', productsController.removeImage);

// Orders

adminRoute.get('/orders', auth.isLogin, orderController.loadOrders);
adminRoute.get('/viewDetails', auth.isLogin, orderController.loadAdminOrderDetails);
adminRoute.get('/orderPacked/:orderId', auth.isLogin, orderController.packed);
adminRoute.get('/orderShipped/:orderId', auth.isLogin, orderController.shipped);
adminRoute.get('/orderDelivered/:orderId', auth.isLogin, orderController.delivered);
adminRoute.get('/orderCancelled/:orderId', auth.isLogin, orderController.cancelled);

// coupons

adminRoute.get('/coupons', auth.isLogin, orderController.getCoupon);
adminRoute.post('/coupons', orderController.postCoupon)
adminRoute.post('/delete-coupon', orderController.deleteCoupon)
adminRoute.get('/block-coupon', orderController.blockCoupon)

// Banner

adminRoute.get('/banners', auth.isLogin, adminController.loadBanner);
adminRoute.get('/addBanner', auth.isLogin, adminController.loadAddBanner);
adminRoute.post('/banners', uploadBanner.array('image', 1), adminController.addBanner);
adminRoute.post('/block-banner', adminController.blockBanner);
adminRoute.delete('/delete-banner', adminController.deleteBanner);


























module.exports = adminRoute;