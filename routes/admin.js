const express = require("express");
const router = express.Router();

// middleware
const { requireSignin } = require("../middlewares");


const {
    administrator,
    createCategory,
    getCategory,
    putCategory,
    removeCategory,
    listCategories,
    createSubcategory,
    getSubCategory,
    putSubCategory,
    removeSubCategory,
    listSubCategories,
    getSubs,
} = require("../controllers/admin");

router.get("/admin", requireSignin, administrator);


// categories
router.post("/admin/create-category", requireSignin, createCategory);
router.get("/admin/get-category/:slug", requireSignin, getCategory);
router.put("/admin/update-category/:slug", requireSignin, putCategory);
router.delete("/admin/remove-category/:slug", requireSignin, removeCategory);
router.get("/admin/categories", requireSignin, listCategories)

// subcategories
router.get("/category/subcategories/:_id", getSubs);
router.post("/admin/createsubcategory", requireSignin, createSubcategory);
router.get("/admin/get-subcategory/:slug", requireSignin, getSubCategory);
router.put("/admin/update-subcategory/:slug", requireSignin, putSubCategory);
router.delete("/admin/remove-subcategory/:slug", requireSignin, removeSubCategory);
router.get("/admin/subcategories", requireSignin, listSubCategories);


module.exports = router;