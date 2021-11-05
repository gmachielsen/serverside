const Category = require("../models/category");


exports.getcategories = async (req, res) => {
    const categories = await Category.find({}).sort({ createdAt: -1 }).exec()
    res.json(categories);
};