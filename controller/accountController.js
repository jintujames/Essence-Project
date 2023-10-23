const User = require('../model/userModel');
const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Orders = require('../model/ordersModel');
const ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require('mongoose');

const loadAccount = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const objectId = new ObjectId(userId);

        if (req.method === 'POST') {
            const { product_name, email, mobile } = req.body;

            await User.findByIdAndUpdate(userId, {
                fname: product_name,
                email,
                mobile,
            });

            res.redirect('/account');
        } else {
            const user = await User.findById(userId);
            res.render('account', { user });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error updating or loading user information');
    }
}


const editAccount = async (req, res) => {
    try {
        const id = req.body.addressId;
        const user = await User.findOne({ 'address._id': id });

        if (!user) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const address = user.address.id(id);
        address.name = req.body.name;
        address.address = req.body.address;
        address.district = req.body.district;
        address.city = req.body.city;
        address.pincode = req.body.pincode;
        address.phone = req.body.phone;

        await user.save();

        res.redirect('/myaddress');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const loadOrders = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });

        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 8;

        const totalOrders = await Orders.countDocuments({ user: userData });
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        const skip = (page - 1) * itemsPerPage;

        const orders = await Orders.find({ user: userData })
            .sort({ createdOn: -1 })
            .skip(skip)
            .limit(itemsPerPage);

        res.render('orders', {
            user: userData,
            orders: orders,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        res.status(500).send('Error loading orders');
    }
}

const loadMyAddress = async (req, res) => {

    try {

        const userData = await User.findById({ _id: req.session.user_id })
        const address = userData.address


        if (address) {
            res.render('myAddress', { user: userData, address: address });
        }


    } catch (error) {
        console.log(error.message)
    }

}


const loadOrderDetails = async (req, res) => {

    try {

        res.render('orderDetails', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }

}




module.exports = {
    loadAccount,
    loadOrders,
    loadMyAddress,
    loadOrderDetails,
    editAccount
}