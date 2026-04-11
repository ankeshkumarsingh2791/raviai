const express = require("express");
const ToolSubCategory = require("../models/ToolSubCategory");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/toolSubCategoryController");
const upload = require("../config/multer");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use((req, _res, next) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] SubCategory router matched: ${req.method} ${req.originalUrl}`
  );
  next();
});

router.post("/", isAuthenticated, upload.single("toolSubCategoryImage"), createSubCategory);

router.get("/", getAllSubCategories);

router.get("/by-category/:categoryId", getSubCategoriesByCategory);

router.get("/:id", getSubCategoryById);

router.put("/:id", isAuthenticated, upload.single("toolSubCategoryImage"), updateSubCategory);

router.delete("/:id", isAuthenticated, deleteSubCategory);

module.exports = router;
