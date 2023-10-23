const Orders = require('../model/ordersModel');
const razorpay = require('razorpay');
const { db } = require('../model/userModel');
var instance = new razorpay({
    key_id: 'rzp_test_XeL7zWjuPQQ92d',
    key_secret: 'gBVOVj4iihTfXF0l6NReX6No',
});

const generateRazorpay = (orderid, total) => {
    return new Promise((resolve, reject) => {
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderid
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err);
            } else {

                console.log("New Order :", order);
                resolve(order)
            }
        });

    })

},

    verifyPayment = (details) => {
        return new Promise((resolve, reject) => {

            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'gBVOVj4iihTfXF0l6NReX6No')
            hmac.update(details.order.razorpay_order_id + '|' + details.order.razorpay_payment_id);
            hmac = hmac.digest('hex')
            if (hmac == details.order.razorpay_signature) {
                resolve()
            } else {
                reject()
            }

        })
    },
    changePaymentStatus = (orderId) => {
        return new Promise((resolve, reject) => {
            Orders.updateOne({ _id: orderId },
                {
                    $set: {
                        orderStatus: "Accepted",
                        paymentStatus: "Paid"
                    }
                }
            ).then(() => {
                resolve()

            })
        })
    }



module.exports = {
    generateRazorpay,
    verifyPayment,
    changePaymentStatus
}
