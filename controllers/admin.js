const User = require("../models/user");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Course = require("../models/course");

const slugify = require("slugify");

const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

exports.administrator = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).select("-password").exec();
        if (!user.role.includes("Admin")) {
            return res.sendStatus(403);
        } else {
            res.json({ ok: true });
        }
      } catch (err) {
          console.log(err);
    }
}


exports.createCategory = async (req, res) => {
    try {
      const { name } = req.body;
      // const category = await new Category({ name, slug: slugify(name) }).save();
      res.json(await new Category({ name, slug: slugify(name) }).save());
  
  
      // const { name } = req.body;
      // const alreadyExist = await Category.findOne({ name: req.body.name })
      // if (alreadyExist) return res.status(400).send("Name is taken");
  
      // const category = await new Category({ name, slug: slugify(name) }).save();
  
  
      // res.json(category)
  
    } catch (err) {
      console.log(err);
      return res.status(400).send("Category created failed. Try again");
    }
  }
  
  
  exports.getCategory = async (req, res) => {
    try {
      let category = await Category.findOne({ slug: req.params.slug }).exec();
      res.json(category);
      console.log(category, "category form getCategory")
    } catch (err) {
  
    }
  }
  
  exports.putCategory = async (req, res) => {
    try {
      const category = await Category.findOneAndUpdate({ slug: req.params.slug }, { name: req.body.name, slug: req.body.name }, { new: true }).exec();    
      res.json(category);
    } catch (err) {
      console.log(err);
    }
  }
  
  exports.removeCategory = async (req, res) => {
    try {
      const category = await Category.findOneAndDelete({ slug: req.params.slug }).exec();
      res.json(category);
    } catch (err) { 
      console.log(err);
    }
  }
  
  exports.listCategories = async (req, res) => {
    try {
      categories = await Category.find().exec();
      res.json(categories);
    } catch (err) {
      console.log(err);
    }
  }
  
  exports.createSubcategory = async (req, res) => {
    try {
      const { name, category } = req.body;
      res.json(await new SubCategory({ name, parent: category, slug: slugify(name) }).save());
  
    } catch (err) {
      console.log(err);
      res.status(400).send("Create subcategory failed");
  
    }
  }
  
  
  
  exports.putSubCategory = async (req, res) => {
    // const { name, parent } = req.body;
    // console.log(name, parent, "console.logt die??");
    try {
      const updated = await SubCategory.findOneAndUpdate(
        { slug: req.params.slug },
        // { name, parent, slug: slugify(name) },
        req.body,
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      console.log(err);
      res.status(400).send("Sucategory update failed");
    }
  }
  
  exports.removeSubCategory = async (req, res) => {
    try {
      console.log("slug????", req.params.slug);
      const deleted = await SubCategory.findOneAndDelete({ slug: req.params.slug });
      res.json(deleted);
    } catch (err) {
      console.log(err);
      res.status(400).send("Sub delete failed");
    }
  }
  
  exports.listSubCategories = async (req, res) => 
    res.json(await (SubCategory.find({}).sort({ createdAt: -1 }).exec()));
  
  
    exports.getSubCategory = async (req, res) => {
      try {
      let subCategory = await SubCategory.findOne({ slug: req.params.slug }).exec();
      console.log(subCategory, "<<<<<----- subcategory")
      res.json(subCategory);
      } catch (err) {
        console.log(err);
      }
    }
  
  exports.getSubs = (req, res) => {
    console.log(req.params._id, "isididjdi")
      SubCategory.find({ parent: req.params._id}).exec((err, subcategories) => {
          if (err) console.log(err);
          res.json(subcategories);
      });
  };
  