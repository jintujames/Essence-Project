const Products = require('../model/productsModel');
const Category = require('../model/categoryModel');
const mongoose = require('mongoose')


const loadProducts = async (req, res) => {
    try {
        const perPage = 5; 
        const page = parseInt(req.query.page) || 1; 
        const products = await Products.find({ isDeleted: false })
            .populate('Category')
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalProducts = await Products.countDocuments({ isDeleted: false });

        res.render('products', {
            Products: products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / perPage),
            message: '',
            errMessage: '',
        });
    } catch (error) {
        console.log(error.message);
    }
};


const loadAddProducts = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: false });
        res.render('addProducts', { Category: categories, message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message);
    }
}

const addProducts = async (req, res) => {
    try {
        const img = req.files.map((file) => file.filename);


        const category = await Category.findOne({ name: req.body.category });

        if (!category) {

            console.log('Category not found');

        }

        let product = new Products({
            productName: req.body.productName,
            brandName: req.body.brandName,
            Category: req.body.category,
            quantity: req.body.quantity,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            description: req.body.description,
            image: img
        });

        const products = await product.save();

        if (products) {
            res.redirect('/admin/products');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProducts = async (req, res) => {

    try {

        const category = await Category.find({ isDeleted: false });
        console.log(req.query.id);
        const products = await Products.findById(req.query.id).populate('Category')
        res.render('editProducts', { products: products, errMessage: '', message: '', Category: category });

    } catch (error) {
        console.log(error.message);
    }
}
const updateProducts = async (req, res) => {
    try {
 const img = req.files.map((file) => file.filename);
            const updatedC = new mongoose.Types.ObjectId(req.body.category);
    
            console.log(img);
            if (req.body.removedImageFilenames && req.body.removedImageFilenames.length > 0) {
    
                const removedImageFilenames = JSON.parse(req.body.removedImageFilenames);
                const result = await Products.updateOne(
                    { _id: req.body.id },
                    { $pull: { image: { $in: removedImageFilenames } } }
                );
            }
    
            const products = await Products.findById(req.body.id);
            console.log(products);
    
            if(img.length > 0){
                products.productName = req.body.productName
                products.brandName = req.body.brandName
                products.Category = updatedC
                products.quantity = req.body.quantity
                products.regularPrice = req.body.regularPrice
                products.salePrice = req.body.salePrice
                products.description = req.body.description
                products.image = products.image.concat(img);       
            }
    
            products.productName = req.body.productName
            products.brandName = req.body.brandName
            products.Category = updatedC
            products.quantity = req.body.quantity
            products.regularPrice = req.body.regularPrice
            products.description = req.body.description
            products.salePrice = req.body.salePrice 
    
    
            const updated = await products.save();
            res.json({success: true})
    
        } catch (error) {
            console.log(error.message);
        }

}
const deleteProducts = async (req, res) => {

    try {

        const Data = await Products.findById({ _id: req.body.id });

        if (Data) {
            Data.isDeleted = true;
            await Data.save();
        }

        res.redirect('/admin/products');

    } catch (error) {
        console.log(error.message);
    }
}

const removeImage = async (req, res) => {

    try {

        const imageId = req.query.imageId;
        const productId = req.query.productId;

        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            {
                $pull: { image: { _id: imageId } }
            },
            { new: true }
        );
        await updatedProduct.save();

        if (updatedProduct) {
            res.redirect('/admin/editProducts');
        }

    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProducts,
    updateProducts,
    deleteProducts,
    removeImage
}