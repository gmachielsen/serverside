const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Name is required",
        minlength: [2, "Too short"],
        maxlength: [32, "Too long"],
    }, 
    slug: {
        type: String,
        lowercase: true,
        index: true,
    },
    parent: { type: ObjectId, ref: "Category", required: false },
},
{ timestamps: true }
);

module.exports = mongoose.model("Subcategory", subcategorySchema);