const User = require('../model/userModel');
const Products = require('../model/productsModel');
const Orders = require('../model/ordersModel');
const Coupon = require('../model/couponModel');
const mongoose = require('mongoose');

const applyCoupon = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { couponCode } = req.body;
    const cartTotal = parseFloat(req.body.cartTotal);
    console.log(cartTotal);
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

  applyCoupon,
  removeCoupon
}