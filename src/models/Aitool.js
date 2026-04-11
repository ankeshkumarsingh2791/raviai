const mongoose = require("mongoose");

const aiToolSchema = new mongoose.Schema(
  {
    toolName: {
      type: String,
      required: [true, "Tool name is required"],
      trim: true,
    },
    toolImage: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    youtubeUrl: {
      type: String,
      trim: true,
    },
    heading: {
      type: String,
      trim: true,
    },
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],
    aiCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    pricingModel: {
      type: String,
      trim: true,
    },
    toolUrl: {
      type: String,
      trim: true,
    },
    aiToolDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIToolDetail",
    },
    toolCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Tool category is required"],
    },
    toolSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ToolSubCategory",
      required: [true, "Tool subcategory is required"],
    },
    verified: {
      type: Boolean,
      default: false
    },
    displayAd: {
      type: String,
      trim: true,
    },
    adUrl: {
      type: String,
      trim: true,
    },
    displayAdSidebar: { 
      type: String, 
      trim: true 
    }, // tool-level sidebar ad image
    sidebarAdUrl:     { 
      type: String, 
      trim: true 
    }, // tool-level sidebar ad link
  },
  { timestamps: true }
);

module.exports = mongoose.model("AITool", aiToolSchema);
