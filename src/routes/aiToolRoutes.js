const express = require("express");
const router = express.Router();
const {
  createTool,
  getAllTools,
  getToolById,
  updateTool,
  getToolAds,
  deleteTool,
  getSimilarTools,
  getToolsBySubCategory,
} = require("../controllers/aiToolController");
const {
  createToolDetail,
  getToolDetailById,
  updateToolDetail,
  deleteToolDetail,
} = require("../controllers/aiToolDetailController");
const upload = require("../config/multer");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use((req, _res, next) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Tools router matched: ${req.method} ${req.originalUrl}`
  );
  next();
});

// ─── Tool Detail routes (must be before /:id) ──────────────────────
router.post("/detail", isAuthenticated, createToolDetail);
router.get("/detail/:id", getToolDetailById);
router.put("/detail/:id", isAuthenticated, updateToolDetail);
router.delete("/detail/:id", isAuthenticated, deleteToolDetail);

// ─── AI Tool routes ────────────────────────────────────────────────
router.post(
  "/",
  isAuthenticated,
  upload.fields([
  { name: "toolImage", maxCount: 1 },
  { name: "displayAd", maxCount: 1 },
  { name: "displayAdSidebar", maxCount: 1 },
]),
  createTool
);

router.get("/subcategory/:subCatId", getToolsBySubCategory);
router.get("/", getAllTools);
router.get("/:id", getToolById);
router.get("/:id/ads", getToolAds);
router.get("/:id/similar", getSimilarTools);


router.put(
  "/:id",
  isAuthenticated,
  upload.fields([
  { name: "toolImage", maxCount: 1 },
  { name: "displayAd", maxCount: 1 },
  { name: "displayAdSidebar", maxCount: 1 },
]),
  updateTool
);

router.delete("/:id", isAuthenticated, deleteTool);

module.exports = router;
