const Category = require('../model/categoryModel');

const loadCategory = async (req, res) => {

    try {

        const category = await Category.find({ isDeleted: false });
        res.render('category', { Category: category, message: '', errMessage: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {

    try {
        const name = req.body.name.toUpperCase();
        const category = await Category.find({ IsDeleted: false })
        const categoryName = await Category.find({ name: name });

        if (categoryName.length != 0) {
            res.render('category', { message: '', errMessage: 'Category Already Exists!!!', Category: category })
        } else {
            let category = new Category({
                name: req.body.name

            });


            await category.save();

            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCategory = async (req, res) => {

    try {

        const category = await Category.findById(req.query.id);
        res.render('editCategory', { category: category, errMessage: '', message: '' });

    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {

    try {
        const name = req.body.name;
        const Data = await Category.findById(req.body.id);
        const data = await Category.findOne({ name: name });


        if (data) {

            res.render('editCategory', { errMessage: 'Category already exists', message: '', category: Data })

        } else {

            const Data = await Category.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name } })

            res.redirect('/admin/category');

        }

    } catch (error) {
        console.log(error.message);
    }
}
const deleteCategory = async (req, res) => {

    try {
        console.log(req.query.id);
        const Data = await Category.findById({ _id: req.query.id });

        if (Data) {
            Data.isDeleted = true;
            await Data.save();
        }

        res.json({response: true});

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    updateCategory,
    deleteCategory

}