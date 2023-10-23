const User = require('../model/userModel');
const Products = require('../model/productsModel');
const Orders = require('../model/ordersModel');
const Coupons = require('../model/couponModel');
const mongoose = require('mongoose');
const userHelper = require('../helpers/userHelper')
const PDFDocument = require('pdfkit')
const fs = require('fs')

const Razorpay = require('razorpay');
const { isArrayBufferView } = require('util/types');


const loadOrders = async (req, res) => {
    try {
        const page = req.query.page || 1; 
        const perPage = 8; 

        const ordersCount = await Orders.countDocuments(); 

        const totalPages = Math.ceil(ordersCount / perPage); 

        const orders = await Orders.find({})
            .populate('user')
            .sort({ createdOn: -1 })
            .skip((page - 1) * perPage) 
            .limit(perPage); 

        res.render('orders', { orders: orders, totalPages: totalPages, currentPage: page });
    } catch (error) {
    }
}

const loadUserOrders = async (req, res) => {
    try {
        const orders = await Orders.find({}).populate('user').sort({ createdOn: -1 });

        res.render('myAccount', { orders: orders });
    } catch (error) {

    }
}

const loadCheckout = async (req, res) => {
    try {
        const userId = res.locals.user;
        const user = await User.findById(userId._id).populate('cart.products');
        const address = user.address;
        const discountPrice = req.session.discountPrice || 0; 
        res.render('checkout', { user, address, discountPrice });
    } catch (error) {
        console.log(error.message);
    }
};


const placeOrder = async (req, res) => {
    try {

        const userId = req.session.user_id;

        const {
            cart,
            selectedAddress,
            paymentMethod,
            total,
        } = req.body;
        const selectedAddressId = new mongoose.Types.ObjectId(selectedAddress);



        const products = cart.map((item) => ({
            products: item.products,
            quantity: item.quantity,
            price: item.products.salePrice,
        }));

        for (const item of cart) {
            const orderedQuantity = item.quantity;

            const product = await Products.findById(item.products._id);

            if (orderedQuantity > product.quantity) {
                return res.status(400).json({ error: 'Insufficient stock' });
            }

            product.quantity -= orderedQuantity;

            await product.save();
        }


        const newOrder = new Orders({
            user: userId,
            products: products,
            address: selectedAddressId,
            createdOn: new Date(),
            paymentMethod: paymentMethod,
            orderStatus: 'Pending',
            total: total,

        });

        const savedOrder = await newOrder.save();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndUpdate(userId, { cart: [] });

        if (paymentMethod === 'COD') {
            res.json({ codSuccess: true, savedOrder });
        } else if (paymentMethod === 'onlinePayment') {
            userHelper.generateRazorpay(savedOrder._id, savedOrder.total).then((response) => {
                res.json({ onlinePaymentSuccess: true, savedOrder, response });
            });
        } else if (paymentMethod === 'wallet') {
            if (user.walletBalance < savedOrder.total) {
                return res.status(400).json({ error: 'Insufficient wallet balance' });
            }

            user.walletBalance -= total;
            const users = await User.findByIdAndUpdate(userId, {
                $push: {
                    transactions: {
                        type: 'Debit',
                        amount: savedOrder.total,
                        date: new Date()

                    },
                },
            })


            await user.save();

            res.json({ walletSuccess: true, savedOrder });
        }

    } catch (error) {

        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while placing the order' });
    }
};


const loadConfirmOrder = async (req, res) => {
    try {

        res.render('orderSuccess');

    } catch (error) {

    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })

        const orderId = req.query.orderId;

        const order = await Orders.findById(orderId)
            .populate({
                path: 'user',
                populate: { path: 'address' }
            })
            .populate('products.products');
        // .exec(); // Add .exec() to execute the query

        if (!order) {
            throw new Error('Order not found');
        }

        const selectedAddressId = order.address;
        const selectedAddress = order.user.address.find(address => address._id.toString() === selectedAddressId.toString());

        if (!selectedAddress) {
            throw new Error('Selected address not found');
        }



        res.render('orderDetails', { user: userData, orders: order, address: selectedAddress });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}


const returnOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { orderId } = req.params;
        console.log(orderId);


        const order = await Orders.findById(orderId);

        if (order.paymentMethod.toLowerCase() === 'onlinepayment' ||
            order.paymentMethod.toLowerCase() === 'wallet' ||
            order.paymentMethod.toLowerCase() === 'COD' && order.orderStatus.toLowerCase() === 'Delivered') {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userIds = await User.findByIdAndUpdate(userId, {
                $push: {
                    transactions: {
                        type: 'Credit',
                        amount: order.total,
                        date: new Date(),
                    },
                },
            })
                .then(() => {
                })
                .catch((error) => {
                    console.error('Error updating user transactions:', error);
                });

            user.walletBalance += order.total

            await user.save();


        }
        await Orders.findByIdAndUpdate(
            orderId,
            { orderStatus: 'Returned' },
            { new: true }
        );

        for (const orderItem of order.products) {
            const productId = orderItem.products;
            const returnedQuantity = orderItem.quantity;


            const product = await Products.findById(productId);
            console.log(product.quantity);
            console.log(typeof product.quantity);
            console.log(returnedQuantity);
            console.log(typeof returnedQuantity);

            if (product) {
                product.quantity = product.quantity + returnedQuantity;

                await product.save();
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error in returnOrder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const cancelOrder = async (req, res) => {
    try {

        const userId = req.session.user_id;
        const { orderId } = req.params;
        console.log(orderId);


        const order = await Orders.findById(orderId);

        if (order.paymentMethod.toLowerCase() === 'onlinepayment' ||
            order.paymentMethod.toLowerCase() === 'wallet' ||
            order.paymentMethod.toLowerCase() === 'COD' && order.orderStatus.toLowerCase() === 'Delivered') {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userIds = await User.findByIdAndUpdate(userId, {
                $push: {
                    transactions: {
                        type: 'Credit',
                        amount: order.total,
                        date: new Date()
                    },
                },
            })
                .then(() => {
                })
                .catch((error) => {
                    console.error('Error updating user transactions:', error);
                });

            user.walletBalance += order.total

            await user.save();


        }

        await Orders.findByIdAndUpdate(
            orderId,
            { orderStatus: 'Cancelled' },
            { new: true }
        );

        for (const orderItem of order.products) {
            const productId = orderItem.products;
            const returnedQuantity = orderItem.quantity;

            const product = await Products.findById(productId);

            if (product) {
                product.quantity += returnedQuantity;

                await product.save();
            }
        }

        res.json({ success: true });

    } catch (error) {
        console.log(error);

    }
}


const verifyPayment = async (req, res) => {
    try {

        userHelper.verifyPayment(req.body).then(() => {
            userHelper.changePaymentStatus(req.body.payment.receipt).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false, errMsg: '' })
        })

    } catch (error) {

    }
}

const rejectOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
        order, orderStatus = 'Rejected';
        await order.save();
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const acceptOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
        order.orderStatus = 'Accepted';
        await order.save();
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const packed = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
        order.orderStatus = 'Packed';
        await order.save();
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const shipped = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
        order.orderStatus = 'Shipped';
        await order.save();
        res.redirect('/admin/orders')
    } catch (error) {

    }
}
const delivered = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
        order.orderStatus = 'Delivered';
        await order.save();
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const cancelled = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.session.user_id;


        const order = await Orders.findById(orderId)
        order.orderStatus = 'Cancelled';
        await order.save();
        res.redirect('/admin/orders')

        for (const orderItem of order.products) {
            const productId = orderItem.products;
            const returnedQuantity = orderItem.quantity;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userIds = await User.findByIdAndUpdate(userId, {
                $push: {
                    transactions: {
                        type: 'Credit',
                        amount: order.total,
                        date: new Date(),
                    },
                },
            })
                .then(() => {
                })
                .catch((error) => {
                    console.error('Error updating user transactions:', error);
                });

            user.walletBalance += order.total

            await user.save();


            const product = await Products.findById(productId);
            console.log(product.quantity);
            console.log(returnedQuantity);

            if (product) {
                product.quantity = product.quantity + returnedQuantity;

                await product.save();
            }
        }
    } catch (error) {

    }
}
const loadAdminOrderDetails = async (req, res) => {

    try {

        const orderId = req.query.orderId;
        const orders = await Orders.findById({ _id: orderId })
            .populate({
                path: 'user',
                populate: { path: 'address' }
            })
            .populate('products.products');

        res.render('adminOrderDetails', { orders: orders })

    } catch (error) {

    }
}

const loadAccount = async (req, res) => {
    try {
        const orderId = req.query.orderId;

        const order = await Orders.findById(orderId)
            .populate({
                path: 'user'
            });

        if (!order) {
            throw new Error('Order not found');
        }

        const selectedAddressId = order.address;
        const selectedAddress = order.user.address.find(address => address._id.toString() === selectedAddressId.toString());

        if (!selectedAddress) {
            throw new Error('Selected address not found');
        }

        const userName = `${order.user.fname} ${order.user.lname}`;
        const userEmail = order.user.email;
        const userPhoneNumber = order.user.phone;



        res.render('orderDetails', {
            userName,
            userEmail,
            userPhoneNumber,
            address: selectedAddress
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        var options = {
            amount: total,
            currency: "INR",
            receipt: "" + orderId
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
            } else {
                resolve(order)
            }
        });
    })

}
const getWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const wallet = await Wallet.findOne({ userId: new ObjectId(userId) }).lean();
        const transactions = wallet?.transactions.reverse()
        res.render('userWallet', { wallet, transactions })
    } catch (error) {
        console.log(error.message)
    }
}


const getWalletDetails = async (req, res) => {
    try {
        let couponSaving;
        if (req.body.couponSaving) {
            couponSaving = req.body.couponSaving
        }
        const userId = req.session.user_id
        const wallet = await Wallet.find({ userId: userId }).lean();
        let walletTotal;
        if (!wallet.length) {
            const newWallet = new Wallet({
                userId: new ObjectId(userId),
                balance: 0,
                transactions: [] 
            })
            await newWallet.save();
            walletTotal = 0
        } else {
            walletTotal = wallet[0].balance
        }



        const cartTotal = await Cart.aggregate([
            {
                $match: { userId: new ObjectId(userId) },
            },
            {
                $unwind: "$products",
            },
            {
                $project: {
                    item: { $toObjectId: "$products.item" },
                    quantity: "$products.quantity",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "item",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    product: { $arrayElemAt: ["$product", 0] },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: [
                                { $toDouble: "$quantity" },
                                { $toDouble: "$product.price" },
                            ],
                        },
                    },
                },
            },
        ]);
        const totalPrice = cartTotal[0].total
        res.json({ walletTotal, cartTotal: totalPrice })

    } catch (error) {
        console.log(error.message)
    }
}

const loadPaymentFailed = async (req, res) => {
    try {
        const query = {
            paymentMethod: 'onlinePayment',
            paymentStatus: 'Pending',
            orderStatus: 'Pending'
        };
        const pendingOrder = await Orders.findOne(query);
        const orderProducts = pendingOrder.products;
        for (const orderProduct of orderProducts) {
            const productId = orderProduct.products.toString();
            const quantity = orderProduct.quantity;


            const product = await Products.findById(productId);
            if (product) {
                product.quantity += quantity
                await product.save();
            }
        }
        pendingOrder.orderStatus = 'Cancelled';
        pendingOrder.paymentStatus = 'Cancelled';
        const updated = await pendingOrder.save()

        if (updated) {
            res.redirect('/cart')
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const viewWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(req.session.user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const transactions = user.transactions.sort((a, b) => b.date - a.date);

        const itemsPerPage = 10; 
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;

        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        res.render("wallet", {
            user,
            transactions: paginatedTransactions,
            currentPage: page,
            totalPages: Math.ceil(transactions.length / itemsPerPage),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const orderInvoice = async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Orders.findById(orderId)
        .populate('user')
        .populate({
            path: 'products.products',
            model: 'products',
        });

    const selectedAddressId = order.address;
    const selectedAddress = order.user.address.find(
        (address) => address._id.toString() === selectedAddressId.toString()
    );

    const doc = new PDFDocument();

    const stream = fs.createWriteStream('invoice.pdf');
    doc.pipe(stream);

    doc.font('Helvetica-Bold');
    doc.fontSize(18);

    doc.text('Invoice', { align: 'center' }).moveDown();

    doc.fontSize(12);
    doc.text(`Invoice #: ${order._id}`, { align: 'right' });
    doc.text(`Order Date: ${order.createdOn.toDateString()}`);
    doc.text(`Order Status: ${order.orderStatus}`).moveDown();

    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text('Product', 100, 200);
    doc.text('Qty', 250, 200);
    doc.text('Unit Price', 350, 200);
    doc.text('SubTotal', 450, 200);

    let yPos = 230;
    order.products.forEach((product) => {
        const subtotal = product.products.salePrice * product.quantity;
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`${product.products.brandName} ${product.products.productName}`, 100, yPos)
            .text(product.quantity.toString(), 250, yPos)
            .text(`Rs. ${product.products.salePrice}`, 350, yPos)
            .text(`Rs. ${subtotal}`, 450, yPos);
        yPos += 20;
    });
    doc.moveDown();

    doc.text('Billing Address:', 100, 380);
    doc.moveDown();

    const {
        name,
        phone,
        address,
        city,
        pincode,
    } = selectedAddress;

    const fullAddress = `${address}, ${city}, ${pincode}`;

    const addressLines = fullAddress.split(', ');

    addressLines.forEach((line, index) => {
        doc.text(line, 100, 400 + index * 20);
    });

    doc.text(`Name: ${name}`);
    doc.text(`Phone: ${phone}`).moveDown();

    doc.font('Helvetica-Bold');
    doc.fontSize(18);
    doc.text(`Grand Total: Rs. ${order.total}`).moveDown();

    doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    doc.pipe(res);
}

const getCoupon = async (req, res) => {
    try {
        const data = await Coupons.find().lean();
        const coupons = data.reverse();
        res.render("coupons", { admin: true, coupons });
    } catch (error) {
        console.log(error.message);
    }
};

const postCoupon = async (req, res) => {
    try {
        console.log(req.body);
        const data = await Coupons.findOne({ code: req.body.code, isActive: false });

        if (data) {
            data.isActive = true;
            await data.save();
        } else {
            const expirationDate = new Date(req.body.expirationDate);
            expirationDate.setHours(23, 59, 59, 999);
            const newCoupon = new Coupons({
                code: req.body.code,
                discountPercentage: req.body.discountPercentage,
                maxDiscount: req.body.maxDiscountAmount,
                minAmount: req.body.minAmount,
                description: req.body.description,
                expirationDate: expirationDate,
            });
            newCoupon.save();
            console.log(newCoupon)
        }

        res.status(200).json({ status: true });
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        await Coupons.deleteOne({ _id: couponId });
        res.status(200).json({ status: true });
    } catch (error) {
        console.log(error.message);
    }
}

const blockCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(req.query);
        const couponData = await Coupons.findById(id);

        couponData.isActive = !couponData.isActive

        await couponData.save();
        res.redirect("/admin/coupons");
    } catch (error) {
        console.log(error.message);
    }
}

const loadCoupons = async (req, res) => {
    try {
        const data = await Coupons.find().lean();
        const coupons = data.reverse();
        res.render("coupons", { admin: true, coupons });
    } catch (error) {
        console.log(error.message);
    }
}

const selectCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;

        const coupon = await Coupons.findById(couponId);

        res.json(coupon);

    } catch (error) {

    }
}

const applyCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;
        const coupon = await Coupons.findById(couponId);

        const subTotal = parseInt(req.query.subtotal);

        let discount = subTotal * (coupon.discountPercentage / 100);

        if (discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
        const discountedPrice = subTotal - discount;

        res.json({ discountedPrice, discount })




    } catch (error) {

    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    loadConfirmOrder,
    loadOrderDetails,
    returnOrder,
    verifyPayment,
    cancelOrder,
    loadOrders,
    rejectOrder,
    acceptOrder,
    packed,
    shipped,
    delivered,
    loadUserOrders,
    loadAccount,
    generateRazorpay,
    getWallet,
    getWalletDetails,
    loadAdminOrderDetails,
    cancelled,
    loadPaymentFailed,
    viewWallet,
    orderInvoice,
    getCoupon,
    postCoupon,
    deleteCoupon,
    blockCoupon,
    loadCoupons,
    selectCoupon,
    applyCoupon

}

