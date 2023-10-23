const User = require('../model/userModel');
const Orders = require('../model/ordersModel');
const Products = require('../model/productsModel');
const Banner = require('../model/bannerModel');
const PDFDocument = require('pdfkit')
const fs = require('fs')
const bcrypt = require('bcrypt');
const Admin = require('../model/adminModel');





const loadLogin = async (req, res) => {

    try {

        res.render('adminLogin', { message: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const verifyAdmin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await User.findOne({ email: email });

        if (adminData) {
            const isPasswordCorrect = await bcrypt.compare(password, adminData.password);

            if (isPasswordCorrect) {
                if (adminData.is_admin === 0) {
                    res.render('adminLogin', { message: 'Invalid Admin' });
                } else {
                    req.session.admin_id = adminData._id;
                    res.redirect('/admin');
                }
            } else {
                res.render('adminLogin', { message: 'Invalid Admin' });
            }
        } else {
            res.render('adminLogin', { message: 'Invalid Admin' });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const logout = async (req, res) => {

    try {

        req.session.admin_id = null;
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}



const loadDashboard = async (req, res) => {

    try {

        const orders = await Orders.find({ orderStatus: 'Delivered' });
        console.log(orders);

        let totalRevenue = 0;
        for (const order of orders) {
            totalRevenue += order.total

        }

        const deliveredOrdersCount = await Orders.countDocuments({ orderStatus: 'Delivered' })

        const deliveredOrders = await Orders.find({ orderStatus: 'Delivered' }).populate('products.products');

        let totalPrdoctCount = 0;
        for (const order of deliveredOrders) {
            totalPrdoctCount += order.products.reduce((total, product) => total + product.quantity, 0)
        }

        const monthlyEarning1 = (totalRevenue * 35) / 100;
        const monthlyEarning = monthlyEarning1.toLocaleString();

        res.render('dashBoard', { errMessage: '', revenue: totalRevenue, totalProduct: totalPrdoctCount, orders: deliveredOrdersCount, monthlyEarning: monthlyEarning });

    } catch (error) {
        console.log(error.message);
    }
}

const loadChart = async (req, res) => {
    try {
        const orders = await Orders.find({ orderStatus: 'Delivered' });

        const dailyRevenue = {};

        for (const order of orders) {
            const orderDate = order.createdOn; 
            const dayKey = orderDate.toISOString().split('T')[0]; 

            if (!dailyRevenue[dayKey]) {
                dailyRevenue[dayKey] = 0;
            }

            dailyRevenue[dayKey] += order.total;
        }

        const revenueData = Object.values(dailyRevenue);
        res.json(revenueData);
    } catch (error) {
        console.log(error.message);
    }
};

const loadBarChart = async (req, res) => {
    try {
        const orders = await Orders.find({ orderStatus: 'Delivered' }).populate('products.product');

        if (!orders) {
            throw new Error('No orders found with orderStatus: Delivered');
        }
        const productCategoriesSet = new Set();
        for (const order of orders) {
            for (const product of order.products) {
                if (product.products && product.products.Category) {
                    productCategoriesSet.add(product.products.Category);
                }
            }
        }
        const productCategoriesArray = Array.from(productCategoriesSet);

        res.json(productCategoriesArray);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
}

const loadReport = async (req, res) => {
    try {
        const perPage = 8; 
        const page = req.query.page || 1;
        const skip = (page - 1) * perPage;

        let filter = { orderStatus: 'Delivered' }; 
        let dateFilter = req.query.time;

        if (dateFilter) {
            if (dateFilter === 'Today') {
                filter.createdOn = {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59, 999)),
                };
            } else if (dateFilter === 'This month') {
                const now = new Date();
                filter.createdOn = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
                };
            } else if (dateFilter === 'This year') {
                const now = new Date();
                filter.createdOn = {
                    $gte: new Date(now.getFullYear(), 0, 1),
                    $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
                };
            } else if (dateFilter === 'Custom') {
                const startDate = req.query.startDate;
                const endDate = req.query.endDate;
                if (startDate && endDate) {
                    filter.createdOn = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    };
                }
            }
        }

        const totalListings = await Orders.countDocuments(filter);
        const totalPages = Math.ceil(totalListings / perPage);

        const listings = await Orders.find(filter)
            .populate('user')
            .sort({ createdOn: -1 })
            .limit(perPage)
            .skip(skip);

        res.render('report', { errMessage: '', order: listings, totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
}


const loadBanner = async (req, res) => {
    try {
        const bannerData = await Banner.find().lean(); 

        res.render('banners', { banners: bannerData }); 
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddBanner = async (req, res) => {
    try {
        res.render('addBanner', { admin: true });
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res) => {
    try {
        const img = req.files.map((file) => file.filename);
        const banner = new Banner({
            image: img,
            bannerHead: req.body.bannerHead,
            bannerText: req.body.bannerText
        });

        await banner.save(); 

        res.redirect('/admin/banners'); 
    } catch (error) {
        console.log(error.message);
    }
}

const blockBanner = async (req, res) => {
    try {
        const id = req.body.id; // Use 'id' here to get the banner ID
        const bannerData = await Banner.findById(id);

        if (!bannerData) {
            return res.status(404).send('Banner not found');
        }

        bannerData.isActive = !bannerData.isActive;

        await bannerData.save();
        res.redirect("/admin/banners");
    } catch (error) {
        console.log(error.message);
    }
}



const deleteBanner = async (req, res) => {
    try {
        const bannerId = req.query.id;
        await Banner.deleteOne({ _id: bannerId });
        res.status(200).json({ status: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: false });
    }
}


module.exports = {
    loadLogin,
    verifyAdmin,
    logout,
    loadDashboard,
    loadChart,
    loadBarChart,
    loadReport,
    loadBanner,
    loadAddBanner,
    addBanner,
    blockBanner,
    deleteBanner
}