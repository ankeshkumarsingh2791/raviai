const Review = require("../models/Review");
const AITool = require("../models/Aitool");

const logEntry = (req, action) => {
  console.log(
    `[REQ ${req.requestId || "n/a"}] Controller ${action} hit params=${JSON.stringify(
      req.params || {}
    )} bodyKeys=${JSON.stringify(Object.keys(req.body || {}))}`
  );
};

// ─── Create Review (user) ──────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    logEntry(req, "createReview");
    const { toolId, description, rating } = req.body;
    const userId = req.user?.id;

    if (!toolId || !description || !rating) {
      return res.status(400).json({
        success: false,
        message: "toolId, description and rating are required",
      });
    }

    // verify tool exists
    const tool = await AITool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: "Tool not found" });
    }

    // prevent duplicate review
    const existing = await Review.findOne({ user: userId, tool: toolId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this tool",
      });
    }

    const review = await Review.create({
      user:        userId,
      tool:        toolId,
      description,
      rating,
      published:   false, // pending admin approval
    });

    // push into tool's reviews array
    await AITool.findByIdAndUpdate(toolId, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully. Pending admin approval.",
      data: review,
    });
  } catch (error) {
    console.error(`createReview failed:`, error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get Reviews by Tool (admin — all reviews) ────────────────────
const getReviewsByTool = async (req, res) => {
  try {
    logEntry(req, "getReviewsByTool");
    const reviews = await Review.find({ tool: req.params.toolId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(`getReviewsByTool failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Published Reviews by Tool (client UI) ────────────────────
const getPublishedReviewsByTool = async (req, res) => {
  try {
    logEntry(req, "getPublishedReviewsByTool");
    const reviews = await Review.find({
      tool:      req.params.toolId,
      published: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(`getPublishedReviewsByTool failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle Publish / Unpublish (admin) ───────────────────────────
const togglePublish = async (req, res) => {
  try {
    logEntry(req, "togglePublish");
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.published = !review.published;
    await review.save();

    res.status(200).json({
      success: true,
      message: review.published ? "Review published" : "Review unpublished",
      data: review,
    });
  } catch (error) {
    console.error(`togglePublish failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Review (admin) ─────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    logEntry(req, "deleteReview");
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // remove from tool's reviews array
    await AITool.findByIdAndUpdate(review.tool, {
      $pull: { reviews: review._id },
    });

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(`deleteReview failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Reviews (admin — all tools) ──────────────────────────
const getAllReviews = async (req, res) => {
  try {
    logEntry(req, "getAllReviews");
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("tool", "toolName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(`getAllReviews failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Unpublished Reviews (admin — all tools) ──────────────
const getUnpublishedReviews = async (req, res) => {
  try {
    logEntry(req, "getUnpublishedReviews");
    const reviews = await Review.find({ published: false })
      .populate("user", "name email")
      .populate("tool", "toolName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(`getUnpublishedReviews failed:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByTool,
  getPublishedReviewsByTool,
  togglePublish,
  deleteReview,
  getAllReviews,
  getUnpublishedReviews,
};
