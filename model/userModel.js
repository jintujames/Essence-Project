const mongoose = require('mongoose');

const userModel = new mongoose.Schema({

    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    is_admin: {
        type: Number,
        default: 0
    },

    cart: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],

    wishlist: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        }

    }],

    address: [{
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        phone: {
            type: Number,
            required: true
        }

    }],

    walletBalance: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: {
            type: String
        },
        amount: {
            type: Number
        },
        date: {
            type: Date
        }
    }]


});

module.exports = mongoose.model('User', userModel);