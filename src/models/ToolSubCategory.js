const mongoose = require("mongoose");

const toolSubCategorySchema = new mongoose.Schema(
  {
    toolSubCategoryImage: {
      type: String,
      trim: true,
    },
    toolCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Tool category reference is required"],
    },
    heading: {
      type: String,
      required: [true, "Heading is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    toolsListing: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AITool",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToolSubCategory", toolSubCategorySchema);