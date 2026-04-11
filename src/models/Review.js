const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AITool",
      required: [true, "Tool is required"],
    },
    description: {
      type: String,
      required: [true, "Review description is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    published: {
      type: Boolean,
      default: false, // ← admin must approve before showing in UI
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, tool: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);