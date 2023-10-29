const User = require('../model/userModel');
const Products = require('../model/productsModel');
const mongoose = require('mongoose')


const loadCart = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        console.log(userData);

        const cartProducts = await User.findById(userData).populate('cart.products');
        // console.log(cartProducts);


        const cartItems = cartProducts.cart;
        // console.log(cartItems);



        res.render('cart', { cartProducts: cartItems, user: userData });
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        // console.log(userData._id);

        const productId = req.body.id

        const user = await User.findById(userData._id);

        const existingCartItem = user.cart.find(item =>
            String(item.products._id) === String(productId)
        );

        if (existingCartItem) {
            // If the product already exists in the cart, increment its quantity
            existingCartItem.quantity += 1;
        } else {
            // If the product does not exist in the cart, add it as a new item
            user.cart.push({ products: productId, quantity: 1 });
        }

        await user.save();

        res.redirect('/cart');

    } catch (error) {
        console.log(error.message);
    }
}



const deleteCartProducts = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.params.id;


        const user = await User.findById(userId)

        const itemIndex = user.cart.find(item =>
            String(item.products._id) === productId
        );

        if (itemIndex !== -1) {
            user.cart.splice(itemIndex, 1);
            await user.save();
        }

        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
    }
}

const clearCart = async (req, res) => {
    try {
        const userId = req.session.user_id

        const user = await User.findById(userId).populate('cart');

        user.cart = [];
        await user.save();

        res.redirect('/cart');

    } catch (error) {
        console.log(error.message);
    }
}

const updateCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { action, itemId } = req.query;

        const user = await User.findById(userId).populate('cart.products');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const product = await Products.findById(itemId)

        const cartItem = user.cart.find((item) => item.products._id.equals(itemId));

        if (cartItem) {
            if (action === 'increment') {
                if(product.quantity <= cartItem.quantity){
                    console.log('Cannot increment. Insufficient Stock');
                }
                else{
                cartItem.quantity += 1;
                }
            } else {
                if (cartItem.quantity > 1) {
                    cartItem.quantity -= 1;
                }
            }
            const subtotal = user.cart.reduce((total, item) => total + item.quantity * item.products.salePrice, 0);
            const total = subtotal; 

            await user.save();

            const updatedCartData = {
                itemId: cartItem.products._id,
                quantity: cartItem.quantity,
                price: cartItem.products.salePrice,
                subtotal: subtotal, 
                total: total,
            };
            console.log("updatedCartData",updatedCartData);
            res.json(updatedCartData);
        } else {
            res.status(404).json({ error: 'Item not found in cart' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Server error' });
    }
};


const cartTotals = async (req, res) => {
    try {
        const userId = req.session.user_id;

        // Fetch user data using the user ID and populate cart.products
        const user = await User.findById(userId).populate('cart.products');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate subtotal and total
        const subtotal = user.cart.reduce((total, item) => total + item.quantity * item.products.salePrice, 0);
        const total = subtotal; // You can modify this for additional fees if needed

        res.json({ subtotal, total });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

// controllers/checkoutController.js
const getCheckoutPage = async (req, res) => {
    try {
        // Retrieve cart items and their quantities from your database
        const cartItems = [
            { id: 1, name: 'Product 1', quantity: 2, price: 25.00 },
            { id: 2, name: 'Product 2', quantity: 1, price: 15.00 },
            // Add more cart items as needed
        ];

        // Calculate subtotal, coupon discount, and total
        let subtotal = 0;
        cartItems.forEach((item) => {
            subtotal += item.quantity * item.price;
        });

        // You can add coupon discount logic here if applicable

        // Calculate the total including discounts
        const total = subtotal; // Add coupon discount logic here if needed

        // Render the checkout page view and pass the data
        res.render('checkout', {
            cartItems,
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
        });
    } catch (error) {
        console.error(error);
        // Handle errors and display an error page if needed
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getCheckoutPage };





const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id; // Get the user's ID from the session
        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated.' });
        }

        // Find the user by their ID and populate the 'wishlist' field with product details
        const user = await User.findById(userId).populate('wishlist.products');

        const wishlistItems = user.wishlist;

        res.render('wishlist', { wishlist: wishlistItems, user: user });
    } catch (error) {
        console.log(error.message);
        // Handle errors here, e.g., render an error page or send an error response
    }
}






const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated.' });
        }

        const productId = req.query.id;

        if (!productId) {
            return res.status(400).json({ error: 'Invalid product ID.' });
        }

        const user = await User.findById(userId);

        const existingWishlistItem = user.wishlist.find(item =>
            String(item.products) === String(productId)
        );

        if (!existingWishlistItem) {
            user.wishlist.push({ products: productId });
            await user.save();
        }

        res.redirect('/wishlist');
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred while adding to the wishlist.' });
    }
}


const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
const productId = req.params.id;

const user = await User.findById(userId);

const itemIndex = user.wishlist.findIndex(item =>
    String(item.products._id) === productId
);

if (itemIndex !== -1) {
    user.wishlist.splice(itemIndex, 1);
    await user.save();
}

res.redirect('/wishlist');

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred while adding to the cart and removing from the wishlist.' });
    }
}


const deleteWishlistProducts = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.query.id;


        const user = await User.findById(userId);

        const itemIndex = user.wishlist.findIndex(item =>
            String(item.products._id) === productId
        );

        if (itemIndex !== -1) {
            user.wishlist.splice(itemIndex, 1);
            await user.save();
        }

        res.redirect('/wishlist');
    } catch (error) {
        console.log(error.message);
    }
}

const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { couponCode } = req.body;
        const cartTotal = parseFloat(req.body.cartTotal);
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        const currentDate = new Date();
        if (couponCode === "") {
            res.json("Not Applied");
        }
        if (!coupon) {
            res.json({ error: "Invalid coupon code" });
        }
        if (coupon.usedBy.includes(userId)) {
            res.json({ error: "Coupon has already been used" });
        }
        if (currentDate > coupon.expirationDate) {
            res.json({ error: "This coupon has expired" });
        }
        if (cartTotal < coupon.minAmount) {
            res.json({
                error: "Cart total does not meet the minimum total amount",
            });
        }
        const discountAmount = (coupon.discountPercentage / 100) * cartTotal;
        let couponSaving = 0;
        if (discountAmount > coupon.maxDiscount) {
            couponSaving = Math.floor(coupon.maxDiscount);
        } else {
            couponSaving = Math.floor(discountAmount);
        }
        const newTotal = Math.floor(cartTotal - couponSaving);

        req.session.discountPrice = couponSaving;
        req.session.afterDiscount = newTotal;
        req.session.couponCode = couponCode;

        res.json({
            offer: couponSaving,
            total: newTotal,
            success: "Coupon applied",
        });
    } catch (error) { }
}

//Remove_Coupon
const removeCoupon = async (req, res) => {
    try {
        req.session.discountPrice = false;
        req.session.afterDiscount = false;
        req.session.couponCode = false;
        res.status(200).json({ status: true });
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    loadCart,
    addToCart,
    deleteCartProducts,
    loadWishlist,
    clearCart,
    updateCart,
    cartTotals,
    addToWishlist,
    deleteWishlistProducts,
    applyCoupon,
    removeCoupon,
    removeWishlist
}