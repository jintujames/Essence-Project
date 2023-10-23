const mongoose = require('mongoose');

const OrderModel = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    products: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],

    address: {
        type: String,
        required: true
    },

    createdOn: {
        type: Date,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    total: {
        type: Number,
        required: true
    }


});

module.exports = mongoose.model('Orders', OrderModel);
