const User = require('../model/userModel');

const loadUsers = async (req, res) => {
    try {
        const perPage = 5;
        const page = parseInt(req.query.page) || 1;

        const skip = (page - 1) * perPage;

        const userData = await User.find({})
            .skip(skip)
            .limit(perPage);

        const totalUsers = await User.countDocuments({});
        const totalPages = Math.ceil(totalUsers / perPage); 

        res.render('users', { users: userData, totalPages, currentPage: page });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const searchUser = async (req, res) => {

    try {

        const name = `^${req.body.name}`;
        const userData = await User.find({ is_admin: 0, name: { $regex: name, $options: 'i' } }).sort({ name: 1 });
        res.render('users', { users: userData });

    } catch (error) {
        console.log(error.message);
    }
}

const toggleController = async (req, res) => {
    try {

        const userData = await User.findById(req.query.id);

        if (userData) {
            userData.isActive = !userData.isActive;
            await userData.save();
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadUsers,
    searchUser,
    toggleController

}