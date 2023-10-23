const User = require('../model/userModel');
const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const Coupons = require('../model/couponModel');
const Banner = require('../model/bannerModel');


let otp = 0;
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const insertUser = async (req, res) => {

    try {

        const email = req.body.email;
        const checkData = await User.findOne({ email: email });

        if (checkData) {
            res.render('registration', { errMessage: 'User already exists', message: '' });
        } else {

            const user = new User({
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                mobile: req.body.mobile,
                password: req.body.password
            });

            const userData = await user.save();

            if (userData) {
                res.render('registration', { message: 'Registration successfull', errMessage: '' });
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}



const loadRegister = async (req, res) => {

    try {

        res.render('registration', { message: '', errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const filter = { isDeleted: false };

        if (categoryId) {
            filter.categoryId = categoryId; // Use the correct field name, e.g., 'categoryId'
        }

        const product = await Products.find(filter);
        const categories = await Category.find({ isDeleted: false });
        const banners = await Banner.find({ isActive: true });

        res.render('home', { product, categories, banners });

    } catch (error) {
        console.log(error.message);
    }
};


const loadLogin = async (req, res) => {

    try {

        res.render('login', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}

const verifyUser = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;
        const products = await Products.find({});

        const userData = await User.findOne({ email: email });
        const banners = await Banner.find(); 


        if (userData) {

            const ispasswordValid = await bcrypt.compare(password, userData.password);
            console.log(ispasswordValid);
            if (ispasswordValid) {
                req.session.user_id = userData._id;

                res.render('home', { user: userData, product: products, banners });

            }

            else {
                res.render('login', { message: 'Invalid Email or Password' });
            }
        } else {
            res.render('login', { message: 'Invalid Email or Password' });
        }
    }


    catch (error) {
        console.log(error.message);
    }
}


const loadHome1 = async (req, res) => {

    try {

        const userData = await User.findById({ _id: req.session.user_id })
        const products = await Products.find({});


        const categoryId = req.query.id;
        const filter = { isDeleted: false }

        if (categoryId) {
            filter.Category = categoryId
        }
        const category = await Category.find({ isDeleted: false });
        const banners = await Banner.find({ isActive: true }); // Retrieve banner data


        res.render('home', { user: userData, product: products, Category: category, banners });

    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {

    try {

        req.session.user_id = null;
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}


const loadShop = async (req, res) => {

    try {


        const categoryId = req.query.categoryId;
        const page = req.query.page || 1;
        const itemsPerPage = 6;
        const skip = (page - 1) * itemsPerPage;
        const sort = req.query.sort;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        const categories = await Category.find({ isDeleted: false });

        const filter = {
            isDeleted: false,
            Category: { $in: categories.map(cat => cat._id) }
        };

        if (categoryId) {
            filter.Category = categoryId;
        }

        if (minPrice && maxPrice) {
            filter.salePrice = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            filter.salePrice = { $gte: minPrice };
        } else if (maxPrice) {
            filter.salePrice = { $lte: maxPrice };
        }

        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        let products;

        console.log(filter);

        if (sort === '1') {
            products = await Products.find(filter)
                .sort({ salePrice: 1 })
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        } else if (sort === '-1') {
            products = await Products.find(filter)
                .sort({ salePrice: -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        } else {
            products = await Products.find(filter)
                .skip(skip)
                .limit(itemsPerPage)
                .exec();
        }

        console.log(products);
        console.log(totalProducts);
        console.log(categories);
        console.log();
        console.log();

        res.render('shop', {
            Product: products,
            category: categories, totalPages: totalPages,
            currentPage: page, categoryId: categoryId || '',
            page: req.query.page || 1, sort: sort || '',
            minPrice: minPrice || '', maxPrice: maxPrice || ''
        });

    } catch (error) {
        console.log(error.message);
    }
}

const loadProductDetails = async (req, res) => {

    try {

        const productId = req.query.id;

        const Data = await Products.findById(productId)
        res.render('productDetails', {Products: Data, user: res.locals.user});
        
        
    } catch (error) {
        console.log(error.message);
    }
}



const loadOtp = async (req, res) => {

    try {

        res.render('otp', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}

const loadSignup = async (req, res) => {

    try {

        res.render('signup', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}

const sendOtp = async (req, res) => {

    try {

        const email = req.body.email;
        const checkData = await User.findOne({ email: email });

        if (checkData) {
            res.render('registration', { message: '', errMessage: 'Email Already Exists!!!' });
        } else {

            req.session.temp = new User({
                fname: req.body.fname,
                lname: req.body.lname,
                mobile: req.body.mobile,
                email: req.body.email,
                password: req.body.password
            });

        }

        otp = generateOtp();
        console.log(otp);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'jintuuu14@gmail.com',
                pass: 'rkodpchkotisbfhf'
            }
        });

        const mailOptions = {
            from: 'test@lancome.com',
            to: req.session.temp.email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.redirect('/register');
            } else {
                res.redirect('/verify');
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}


const otpVerify = async (req, res) => {

    try {

        res.render('verify', { errMessage: ''});

    } catch (error) {
        console.log(error.message);
    }
}


const verified = async (req, res) => {

    try {


        if (req.body.otp === String(otp)) {

            const securePword = await securePassword(req.session.temp.password);

            const details = new User({
                fname: req.session.temp.fname,
                lname: req.session.temp.lname,
                mobile: req.session.temp.mobile,
                email: req.session.temp.email,
                password: securePword
            });

            const userData = await details.save();

            if (userData) {
                req.session.temp = null;
                res.redirect('/login');
            }

        } else {
            res.render('verify', {errMessage: 'Invalid OTP'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}

const securePassword = async (password) => {

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;

    } catch (error) {

        console.log(error.message);

    }
}

const forgotPassword = async (req, res) => {

    try {

        res.render('emailverify', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}

const forgotPasswordOtp = async (req, res) => {
    try {

        if (req.body.email) {
            const email = req.body.email;
            const userData = await User.findOne({ email: email });

            if (userData) {
                req.session.email = email
                res.redirect('/otp');
            } else {
                res.render('emailverify', { message: 'Invalid Email', errMessage: 'Email not Found' });
            }
        } else {
            res.render('emailverify', { message: 'Email not provided' });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadForgotPassword = async (req, res) => {

    try {

        res.render('forgotPassword', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}


const otpVerification = async (req, res) => {

    try {


        otp = generateOtp();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'jintuuu14@gmail.com',
                pass: 'rkodpchkotisbfhf'
            }
        });

        const mailOptions = {
            from: 'test@lancome.com',
            to: req.session.email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`

        };

        console.log(mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.redirect('/emailverify');
            } else {
                res.render('otp');
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerified = async (req, res) => {

    try {

        console.log(otp);
        console.log(req.body.otp);

        if (req.body.otp === String(otp)) {
            res.redirect('/forgotPassword');
        } else {
            console.log("error");
            res.render('otp', { message: 'Invalid OTP' });
        }



    } catch (error) {
        console.log(error.message);
    }
}

const resendOtp = async (req, res) => {
    try {
        const otp = generateOtp();
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'jintuuu14@gmail.com',
                pass: 'rkodpchkotisbfhf'
            }
        });

        const mailOptions = {
            from: 'test@lancome.com',
            to: req.session.email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`

        };

        console.log(mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.redirect('/emailverify');
            } else {
                res.render('otp');
            }
        });

    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// const resendVerifOtp = async (req, res) => {
//     try {
//         const otp = generateOtp();
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 587,
//             auth: {
//                 user: 'jintuuu14@gmail.com',
//                 pass: 'rkodpchkotisbfhf'
//             }
//         });

//         const mailOptions = {
//             from: 'test@lancome.com',
//             to: req.session.email,
//             subject: 'Your OTP',
//             text: `Your OTP is: ${otp}`

//         };

//         console.log(mailOptions);

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log(error);
//                 res.redirect('/emailverify');
//             } else {
//                 res.render('otp');
//             }
//         });

//     }
//     catch (error) {
//         console.log(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

const forgotPasswordVerify = async (req, res) => {
    try {
        const email = req.session.email;

        const securePword = await securePassword(req.body.password);

        const user = await User.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    password: securePword
                }
            }
        );

        const userData = await user.save();


        if (userData) {
            res.redirect('/login');
        } else {
            res.render('forgotPassword', { errMessage: "Password doesn't match" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async (req, res) => {
    try {
        const grandTotal = req.query.subtotal;
        const userId = req.session.user_id;
        const user = await User.findById(userId).populate('cart.products');
        const address = user ? user.address : null;


        const coupons = await Coupons.find({
            user: { $nin: [userId] },
            isActive: true
        }).lean();


        const validCoupons = coupons.filter(coupon => coupon.minAmount < grandTotal)

        res.render('checkout', { user: user, addresses: address, coupons: validCoupons });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('An error occurred');
    }
}


const check = async (req, res, next) => {
    const user = req.user;

    if (user && user.isActive) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}



const loadNewAddress = async (req, res) => {

    try {

        res.render('newAddress', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }

}

const addAddress = async (req, res) => {

    try {

        

        let newAddress = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            district: req.body.district,

            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
        }

        const userId = req.session.user_id


        const added = await User.findByIdAndUpdate(userId, {
            $push: { address: newAddress }
        })

        if (added) {
            res.redirect('/checkout');
        }


    } catch (error) {
        console.log(error.message)
    }

}

const searchProducts = async (req, res) => {
    try {

        const searchQuery = req.query.q;


        const searchResults = await Products.find({
            $and: [
                {
                    $or: [
                        { productName: { $regex: searchQuery, $options: 'i' } },
                        { description: { $regex: searchQuery, $options: 'i' } },
                        { brandName: { $regex: searchQuery, $options: 'i' } }
                    ]
                },
                { isDeleted: false }
            ]
        });

        const category = await Category.find();

        res.render('searchResults', { Product: searchResults, category: category })

    } catch (error) {

    }
}

const loadEditAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId;
        const user = await User.findById(req.session.user_id)
        const address = user.address.find((addr) => addr._id.toString() === addressId)


        res.render('editAddress', { address: address, errMessage: '', message: '' });


    } catch (error) {
        console.error(error.message);
    }
}

const editAddress = async (req, res) => {
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
}

const removeAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const addressId = req.params.id;


        const user = await User.findById(userId);

        const addressIndex = user.address.findIndex(addr =>
            String(addr._id) === addressId
        );

        if (addressIndex !== -1) {
            user.address.splice(addressIndex, 1);
            await user.save();
        }

        res.redirect('/myAddress');
    } catch (error) {
        console.log(error.message);
    }
}

const loadPage = async (req, res) => {
    try {

        const currentPage = parseInt(req.query.page) || 1;

        const totalItems = await Products.countDocuments();

        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

        const products = await Products.find()
            .skip(startIndex)
            .limit(ITEMS_PER_PAGE);

        res.render('products', {
            products,
            totalPages,
            currentPage,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred while loading products.' });
    }
};


module.exports = {
    insertUser,
    loadRegister,
    loadHome,
    loadHome1,
    loadLogin,
    loadShop,
    verifyUser,
    loadOtp,
    loadSignup,
    sendOtp,
    otpVerify,
    verified,
    userLogout,
    loadProductDetails,
    loadForgotPassword,
    loadCheckout,
    loadNewAddress,
    addAddress,
    removeAddress,
    searchProducts,
    loadPage,
    loadEditAddress,
    editAddress,
    check,
    forgotPassword,
    forgotPasswordOtp,
    otpVerification,
    otpVerified,
    resendOtp,
    forgotPasswordVerify

}