const express = require("express");
const router  = express.Router();
const {
  createReview,
  getReviewsByTool,
  getPublishedReviewsByTool,
  togglePublish,
  deleteReview,
  getAllReviews,
  getUnpublishedReviews,
} = require("../controllers/reviewController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use((req, _res, next) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] review router matched: ${req.method} ${req.originalUrl}`
  );
  next();
});

// ── User routes ────────────────────────────────────────────────────
router.post("/",               isAuthenticated, createReview);

// ── Admin routes ───────────────────────────────────────────────────
router.get("/",                isAuthenticated, getAllReviews);
router.get("/unpublished",     isAuthenticated, getUnpublishedReviews);
router.get("/tool/:toolId",    isAuthenticated, getReviewsByTool);
router.patch("/:id/toggle",    isAuthenticated, togglePublish);
router.delete("/:id",          isAuthenticated, deleteReview);

// ── Public routes (client UI) ──────────────────────────────────────
router.get("/tool/:toolId/published", getPublishedReviewsByTool);

module.exports = router;
