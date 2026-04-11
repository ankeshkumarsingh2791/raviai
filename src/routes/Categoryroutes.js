const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/Categorycontroller");
const upload = require("../config/multer");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use((req, _res, next) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Category router matched: ${req.method} ${req.originalUrl}`
  );
  next();
});

// single image upload, field name "catImage"
// ✅ replace with
router.post("/", isAuthenticated, (req, res, next) => {
  req.uploadFolder = "categories";
  next();
}, upload.fields([
  { name: "catImage",          maxCount: 1 },
  { name: "displayAd",         maxCount: 1 },
  { name: "displayAdSidebar",  maxCount: 1 },
]), createCategory);

router.put("/:id", isAuthenticated, (req, res, next) => {
  req.uploadFolder = "categories";
  next();
}, upload.fields([
  { name: "catImage",          maxCount: 1 },
  { name: "displayAd",         maxCount: 1 },
  { name: "displayAdSidebar",  maxCount: 1 },
]), updateCategory);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.delete("/:id", isAuthenticated, deleteCategory);

module.exports = router;
