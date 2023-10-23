const mongoose = require('mongoose');
const Category = require('./categoryModel');

const productsModel = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    quantity: {
        type: Number,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('products', productsModel)