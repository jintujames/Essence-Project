const mongoose = require('mongoose');
const Products = require('./productsModel');

const cartModel = new mongoose.Schema({

   
    Products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    quantity: {
        type: String,
        required: true
    },
    
    

});

module.exports = mongoose.model('cart', cartModel)