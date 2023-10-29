const User = require('../model/userModel');
const Products = require('../model/productsModel');
const Orders = require('../model/ordersModel');
const Coupon = require('../model/couponModel');
const mongoose = require('mongoose');

const applyCoupon = async (req, res) => {
  try {

    const couponId = req.params.couponId;
        const coupon = await Coupon.findById(couponId);

        const subTotal = parseInt(req.query.subtotal);

        let discount = subTotal * (coupon.discountPercentage / 100);

        if (discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
        const discountedPrice = subTotal - discount;

        res.json({ discountedPrice, discount })
   
  } catch (error) { }
}

const selectCoupon = async (req, res) => {
  try {

      const couponId = req.params.couponId;

      const coupon = await Coupon.findById(couponId);

      res.json(coupon);

  } catch (error) {
    console.log(error.message);
  }
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
  selectCoupon,
  removeCoupon
}