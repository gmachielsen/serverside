const express = require("express");

const router = express.Router();

// controllers
const {
    getcategories,
} = require("../controllers/category");
  
  router.get("/categories", getcategories);


module.exports = router;